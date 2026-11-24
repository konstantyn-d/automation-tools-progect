-- Payment matching and access (workflow "2. Bank statement → payments → access").

ALTER TABLE bank_transactions
  ADD COLUMN suggested_invoice_id int REFERENCES invoices(id),  -- a guess a person has to confirm
  ADD COLUMN review_reason        text;

-- Register one payment that n8n matched to an invoice, in one transaction:
--   bank line → invoice paid → account (new customers get one) → access with an end date → order paid.
-- Returns one row with what happened, so n8n can send the right e-mail.
-- Safe to call twice: a bank line that is already matched is skipped.
CREATE OR REPLACE FUNCTION register_payment(p_tx int, p_invoice int, p_method text, p_confidence numeric)
RETURNS TABLE (invoice_number text, email text, name text, product text, course_title text,
               access_until date, new_account boolean, result text, paid numeric, total numeric)
LANGUAGE plpgsql AS $$
#variable_conflict use_column
DECLARE
  tx      bank_transactions;
  inv     invoices;
  o       orders;
  c       customers;
  acc_id  int;
  is_new  boolean := false;
  prod    text;
  start_d date;
  end_d   date;
  sum_paid numeric(10,2);
BEGIN
  SELECT * INTO tx FROM bank_transactions WHERE id = p_tx FOR UPDATE;
  IF NOT FOUND OR tx.invoice_id IS NOT NULL THEN
    RETURN;
  END IF;
  SELECT * INTO inv FROM invoices WHERE id = p_invoice FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % does not exist', p_invoice;
  END IF;

  sum_paid := coalesce(inv.paid_amount, 0) + tx.amount;
  UPDATE bank_transactions
     SET invoice_id = inv.id, match_method = p_method, match_confidence = p_confidence,
         needs_review = false, suggested_invoice_id = NULL, review_reason = NULL
   WHERE id = tx.id;

  -- Not enough money: keep the invoice open for the rest, a person follows up.
  IF sum_paid < inv.total THEN
    UPDATE invoices SET paid_amount = sum_paid, remark = format('Partly paid: %s of %s', sum_paid, inv.total)
     WHERE id = inv.id;
    UPDATE bank_transactions SET needs_review = true,
           review_reason = format('Paid %s of %s for invoice %s', sum_paid, inv.total, inv.number)
     WHERE id = tx.id;
    RETURN QUERY SELECT inv.number, NULL::text, inv.customer_name, NULL::text, NULL::text, NULL::date,
                        false, 'partly_paid'::text, sum_paid, inv.total;
    RETURN;
  END IF;

  UPDATE invoices
     SET paid_amount = sum_paid, paid_on = tx.booked_on,
         status = CASE WHEN sum_paid > inv.total THEN 'paid_wrong_amount' ELSE 'paid' END,
         remark = CASE WHEN sum_paid > inv.total THEN format('Paid %s, %s too much', sum_paid, sum_paid - inv.total) ELSE inv.remark END
   WHERE id = inv.id;

  SELECT * INTO c FROM customers WHERE id = inv.customer_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT inv.number, NULL::text, inv.customer_name, NULL::text, NULL::text, NULL::date,
                        false, 'paid_no_customer'::text, sum_paid, inv.total;
    RETURN;
  END IF;

  SELECT * INTO o FROM orders WHERE id = inv.order_id;
  prod := coalesce(o.product_code, CASE WHEN inv.series = 'monthly' THEN 'monthly' END, 'yearly');

  -- One account per e-mail address. New customers get one; they set a password from the welcome e-mail.
  INSERT INTO accounts (customer_id, email) VALUES (c.id, c.email)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO acc_id;
  is_new := acc_id IS NOT NULL;
  IF acc_id IS NULL THEN
    SELECT id INTO acc_id FROM accounts WHERE accounts.email = c.email;
  END IF;

  -- Access always has an end date (single course: lifetime). A renewal continues after the current end.
  IF prod = 'single' THEN
    start_d := tx.booked_on;
    end_d := NULL;
  ELSE
    SELECT greatest(tx.booked_on, max(e.ends_on) + 1) INTO start_d
      FROM entitlements e WHERE e.account_id = acc_id AND e.product_code = prod;
    start_d := coalesce(start_d, tx.booked_on);
    end_d := (start_d + CASE WHEN prod = 'monthly' THEN interval '1 month' ELSE interval '1 year' END)::date - 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM entitlements WHERE invoice_id = inv.id) THEN
    INSERT INTO entitlements (account_id, product_code, course_id, invoice_id, starts_on, ends_on, source)
    VALUES (acc_id, prod, o.course_id, inv.id, start_d, end_d, 'web');
  END IF;

  UPDATE orders SET status = 'paid' WHERE id = o.id;

  RETURN QUERY
    SELECT inv.number, c.email::text, c.name, prod,
           (SELECT title FROM courses WHERE id = o.course_id), end_d, is_new,
           CASE WHEN sum_paid > inv.total THEN 'paid_too_much' ELSE 'paid' END, sum_paid, inv.total;
END
$$;
