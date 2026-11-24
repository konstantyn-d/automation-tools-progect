-- What the n8n workflows need on top of the core schema (001).

-- ---------------------------------------------------------------- orders from the new site
ALTER TABLE orders
  ADD COLUMN course_slug   text,                       -- the site's course slug (single course orders)
  ADD COLUMN po_number     text,
  ADD COLUMN vat_rule      text,                       -- BE_21 | EU_PRIVATE_21 | EU_REVERSE_CHARGE | NON_EU_0
  ADD COLUMN needs_review  boolean NOT NULL DEFAULT false,
  ADD COLUMN review_reason text,
  ADD COLUMN payload       jsonb;                      -- the order exactly as the site sent it

-- ---------------------------------------------------------------- structured reference (OGM)
-- Belgian "gestructureerde mededeling": 10 digits + 2 check digits (mod 97, 0 becomes 97),
-- written as +++123/4567/89012+++. The bank copies it into every transfer, so a payment can be
-- matched to its invoice without guessing.
CREATE OR REPLACE FUNCTION ogm(base bigint) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT format('+++%s/%s/%s+++', substr(d, 1, 3), substr(d, 4, 4), substr(d, 8, 5))
  FROM (SELECT lpad(base::text, 10, '0')
               || lpad((CASE WHEN base % 97 = 0 THEN 97 ELSE base % 97 END)::text, 2, '0') AS d) x
$$;

-- ---------------------------------------------------------------- one invoice per order
-- Called by n8n. Everything happens in one transaction:
--   * the counter row is locked, so two orders at the same moment never get the same number,
--   * if anything fails the counter goes back too, so there are no gaps,
--   * calling it twice for the same order returns the same invoice (safe to retry).
CREATE OR REPLACE FUNCTION create_invoice(p_order_id int, p_vat_rule text, p_vat_rate numeric)
RETURNS invoices
LANGUAGE plpgsql AS $$
DECLARE
  o   orders;
  c   customers;
  inv invoices;
  y   int := extract(year FROM current_date)::int;
  n   int;
  excl numeric(10,2);
  vat  numeric(10,2);
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % does not exist', p_order_id;
  END IF;

  SELECT * INTO inv FROM invoices WHERE order_id = p_order_id AND kind = 'invoice' AND NOT legacy;
  IF FOUND THEN
    RETURN inv;
  END IF;

  SELECT * INTO c FROM customers WHERE id = o.customer_id;

  INSERT INTO invoice_counters (series, year, last_no) VALUES ('main', y, 1)
  ON CONFLICT (series, year) DO UPDATE SET last_no = invoice_counters.last_no + 1
  RETURNING last_no INTO n;

  excl := o.price_excl - o.discount;
  vat  := round(excl * p_vat_rate, 2);

  INSERT INTO invoices (number, series, issued_on, due_on, customer_id, order_id, customer_name,
                        amount_excl, vat_rule, vat_amount, total, ogm)
  VALUES (format('%s-%s', y, lpad(n::text, 4, '0')), 'main', current_date, current_date + 14,
          c.id, o.id, coalesce(c.company, c.name), excl, p_vat_rule, vat, excl + vat,
          ogm(y::bigint * 1000000 + n))
  RETURNING * INTO inv;

  UPDATE orders SET status = 'invoiced' WHERE id = o.id;
  RETURN inv;
END
$$;

-- ---------------------------------------------------------------- automation errors
-- Filled by the n8n error workflow: every failed run leaves a row a person can follow up.
CREATE TABLE automation_errors (
  id            serial PRIMARY KEY,
  workflow      text NOT NULL,
  node          text,
  message       text,
  execution_id  text,
  execution_url text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz
);
