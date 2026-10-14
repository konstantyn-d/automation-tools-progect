-- Load the cleaned legacy data (data/clean/*.csv, produced by scripts/clean_data.py).
-- Runs inside the db container: CSV files are mounted at /seed/data.
-- Safe to run again: it empties the tables first.
\set ON_ERROR_STOP on
BEGIN;

TRUNCATE entitlements, accounts, bank_transactions, invoices, invoice_counters, orders, customers,
         videos, courses, products RESTART IDENTITY CASCADE;

\copy products (code, name, price_excl, billing_period, seats) FROM '/seed/data/products.csv' CSV HEADER
\copy courses (id, slug, title, level, status, published_on, single_price, video_count, duration_min) FROM '/seed/data/courses.csv' CSV HEADER
\copy videos (vimeo_id, course_id, position, title, duration_s, privacy, embed_domains, has_description, has_chapters, has_captions, uploaded_on) FROM '/seed/data/videos.csv' CSV HEADER
\copy customers (id, email, name, company, vat_number, country, source) FROM '/seed/data/customers.csv' CSV HEADER

CREATE TEMP TABLE stage_orders (id int, customer_id int, ordered_on date, product_code text, course_id int,
  price_excl numeric, legacy_invoice_nr text, account_created boolean, remark text, source text);
\copy stage_orders FROM '/seed/data/orders.csv' CSV HEADER
INSERT INTO orders (id, customer_id, ordered_on, product_code, course_id, seats, price_excl, status,
                    legacy_invoice_nr, remark, source)
SELECT id, customer_id, ordered_on, product_code, course_id, CASE WHEN product_code = 'team' THEN 5 ELSE 1 END,
       price_excl, 'legacy', legacy_invoice_nr, remark, source
FROM stage_orders;

CREATE TEMP TABLE stage_invoices (id int, number text, series text, kind text, issued_on date, customer_id int,
  order_id int, customer_name text, amount_excl numeric, vat_amount numeric, total numeric, status text,
  remark text, duplicate_number boolean);
\copy stage_invoices FROM '/seed/data/invoices.csv' CSV HEADER
INSERT INTO invoices (id, number, series, kind, issued_on, due_on, customer_id, order_id, customer_name,
                      amount_excl, vat_amount, total, status, remark, legacy, duplicate_number)
SELECT id, number, series, kind, issued_on, issued_on + 14, customer_id, order_id, customer_name,
       amount_excl, vat_amount, total, status, remark, true, duplicate_number
FROM stage_invoices;

\copy bank_transactions (id, booked_on, amount, currency, counterparty_name, counterparty_iban, message, balance, source_file, source_line) FROM '/seed/data/bank_transactions.csv' CSV HEADER
\copy accounts (id, customer_id, email, legacy_ids, must_set_password) FROM '/seed/data/accounts.csv' CSV HEADER
\copy entitlements (id, account_id, product_code, course_id, starts_on, ends_on, legacy_active, source) FROM '/seed/data/entitlements.csv' CSV HEADER

-- Monthly subscribers have no end date in the old table ("active until somebody notices").
-- New rule: paid through the last paid monthly invoice + 1 month + 7 days grace.
UPDATE entitlements e
SET ends_on = sub.paid_through
FROM (
  SELECT a.id AS account_id, (max(i.issued_on) + interval '1 month' + interval '7 days')::date AS paid_through
  FROM accounts a
  JOIN invoices i ON i.customer_id = a.customer_id AND i.series = 'monthly' AND i.status = 'paid'
  GROUP BY a.id
) sub
WHERE e.account_id = sub.account_id AND e.product_code = 'monthly' AND e.ends_on IS NULL;

-- Monthly subscribers without any paid monthly invoice in 2026: keep what the old table said,
-- but give them an end date so they show up in the renewal / follow-up list instead of running forever.
UPDATE entitlements
SET ends_on = DATE '2026-07-31'
WHERE product_code = 'monthly' AND ends_on IS NULL AND legacy_active;
UPDATE entitlements
SET ends_on = coalesce(starts_on, DATE '2026-06-30')
WHERE product_code = 'monthly' AND ends_on IS NULL;

-- From now on every invoice uses one series: 2026-NNNN, continuing after the last legacy number.
INSERT INTO invoice_counters (series, year, last_no)
SELECT 'main', 2026, max(split_part(number, '-', 2)::int)
FROM invoices WHERE series = 'main' AND number LIKE '2026-%';

-- Keep serial columns in step with the imported ids.
SELECT setval(pg_get_serial_sequence('courses', 'id'), (SELECT max(id) FROM courses));
SELECT setval(pg_get_serial_sequence('customers', 'id'), (SELECT max(id) FROM customers));
SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT max(id) FROM orders));
SELECT setval(pg_get_serial_sequence('invoices', 'id'), (SELECT max(id) FROM invoices));
SELECT setval(pg_get_serial_sequence('bank_transactions', 'id'), (SELECT max(id) FROM bank_transactions));
SELECT setval(pg_get_serial_sequence('accounts', 'id'), (SELECT max(id) FROM accounts));
SELECT setval(pg_get_serial_sequence('entitlements', 'id'), (SELECT max(id) FROM entitlements));

COMMIT;

-- Quick summary
SELECT 'courses' AS tbl, count(*) FROM courses
UNION ALL SELECT 'videos', count(*) FROM videos
UNION ALL SELECT 'customers', count(*) FROM customers
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'invoices', count(*) FROM invoices
UNION ALL SELECT 'bank_transactions', count(*) FROM bank_transactions
UNION ALL SELECT 'accounts', count(*) FROM accounts
UNION ALL SELECT 'accounts with access today', count(*) FROM account_access WHERE has_access;
