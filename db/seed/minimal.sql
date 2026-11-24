-- Start without the legacy data: products and prices (handbook chapter 01, excl. VAT)
-- and the invoice counter. Numbering continues after the last invoice in "Facturen 2026.xlsx"
-- (2026-0283), so the series stays unbroken for the accountant.
INSERT INTO products (code, name, price_excl, billing_period, seats) VALUES
  ('monthly', 'Monthly subscription', 15, 'month', 1),
  ('yearly', 'Yearly subscription', 149, 'year', 1),
  ('team', 'Team licence', 599, 'year', 5),
  ('single', 'Single course', 39, 'once', 1)
ON CONFLICT (code) DO NOTHING;

INSERT INTO invoice_counters (series, year, last_no) VALUES ('main', 2026, 283)
ON CONFLICT (series, year) DO NOTHING;
