-- LoopCasts core schema.
-- One database replaces: orders 2025/2026.xlsx, Facturen 2026.xlsx (two tabs), the course
-- catalogue, the Vimeo export, the MySQL users table and the colours in all of them.

CREATE EXTENSION IF NOT EXISTS citext;

-- ---------------------------------------------------------------- catalogue
CREATE TABLE products (
  code           text PRIMARY KEY,                      -- monthly | yearly | team | single
  name           text NOT NULL,
  price_excl     numeric(10,2) NOT NULL,
  billing_period text NOT NULL CHECK (billing_period IN ('month', 'year', 'once')),
  seats          int NOT NULL DEFAULT 1,
  active         boolean NOT NULL DEFAULT true
);

CREATE TABLE courses (
  id            serial PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  summary       text,
  level         text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'retired')),
  published_on  date,
  single_price  numeric(10,2),
  video_count   int NOT NULL DEFAULT 0,
  duration_min  int
);

CREATE TABLE videos (
  vimeo_id        bigint PRIMARY KEY,
  course_id       int REFERENCES courses(id),
  position        int,
  title           text NOT NULL,
  duration_s      int NOT NULL,
  privacy         text NOT NULL,                       -- 'disable' = embed only; 'anybody' = public (bad)
  embed_domains   text,
  has_description boolean NOT NULL DEFAULT false,
  has_chapters    boolean NOT NULL DEFAULT false,
  has_captions    boolean NOT NULL DEFAULT false,
  uploaded_on     date,
  transcript      text,                                -- filled by the Whisper pipeline later
  search          tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(transcript, '')), 'B')) STORED
);
CREATE INDEX videos_course_idx ON videos (course_id, position);
CREATE INDEX videos_search_idx ON videos USING gin (search);

-- ---------------------------------------------------------------- customers and orders
CREATE TABLE customers (
  id          serial PRIMARY KEY,
  email       citext NOT NULL UNIQUE,
  name        text,
  company     text,
  vat_number  text,                                    -- normalised: BE0456789123
  vat_checked_at timestamptz,                          -- last successful VIES check
  vat_valid   boolean,
  country     char(2),
  po_number   text,
  address     text,
  source      text NOT NULL DEFAULT 'web',             -- where the row came from (legacy import or web)
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id                serial PRIMARY KEY,
  customer_id       int NOT NULL REFERENCES customers(id),
  ordered_on        date,
  product_code      text REFERENCES products(code),
  course_id         int REFERENCES courses(id),        -- for single-course orders
  seats             int NOT NULL DEFAULT 1,
  price_excl        numeric(10,2),
  promo_code        text,
  discount          numeric(10,2) NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'invoiced', 'paid', 'cancelled', 'legacy')),
  legacy_invoice_nr text,
  remark            text,
  source            text NOT NULL DEFAULT 'web',
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_idx ON orders (customer_id);

-- ---------------------------------------------------------------- invoices
-- Numbering: one counter row per series and year, locked inside the invoice transaction.
-- (A sequence would leave gaps after a rollback; the accountant wants none.)
CREATE TABLE invoice_counters (
  series  text NOT NULL,
  year    int  NOT NULL,
  last_no int  NOT NULL,
  PRIMARY KEY (series, year)
);

CREATE TABLE invoices (
  id             serial PRIMARY KEY,
  number         text NOT NULL,
  series         text NOT NULL DEFAULT 'main',          -- main | monthly
  kind           text NOT NULL DEFAULT 'invoice' CHECK (kind IN ('invoice', 'credit_note')),
  issued_on      date,
  due_on         date,
  customer_id    int REFERENCES customers(id),
  order_id       int REFERENCES orders(id),
  credits_invoice_id int REFERENCES invoices(id),
  customer_name  text,
  amount_excl    numeric(10,2) NOT NULL,
  vat_rule       text,                                  -- BE_21 | EU_PRIVATE_21 | EU_REVERSE_CHARGE | NON_EU_0
  vat_amount     numeric(10,2) NOT NULL,
  total          numeric(10,2) NOT NULL,
  ogm            text UNIQUE,                           -- +++123/4567/89012+++ (new invoices only)
  status         text NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'paid', 'paid_wrong_amount', 'credited', 'cancelled')),
  paid_amount    numeric(10,2),
  paid_on        date,
  remark         text,
  legacy         boolean NOT NULL DEFAULT false,
  duplicate_number boolean NOT NULL DEFAULT false,      -- legacy only: 2026-0029, 2026-0071
  created_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (round(amount_excl + vat_amount, 2) = total OR legacy)
);
-- New invoices can never share a number. Legacy duplicates are kept as history, flagged.
CREATE UNIQUE INDEX invoices_number_uq ON invoices (number) WHERE NOT legacy;
CREATE INDEX invoices_customer_idx ON invoices (customer_id);
CREATE INDEX invoices_open_idx ON invoices (status) WHERE status = 'open';

-- ---------------------------------------------------------------- bank
CREATE TABLE bank_transactions (
  id                serial PRIMARY KEY,
  booked_on         date NOT NULL,
  amount            numeric(10,2) NOT NULL,
  currency          char(3) NOT NULL DEFAULT 'EUR',
  counterparty_name text,
  counterparty_iban text,
  message           text,
  balance           numeric(12,2),
  source_file       text,
  source_line       int,
  invoice_id        int REFERENCES invoices(id),
  match_method      text,                               -- ogm | invoice_number | amount_name | manual
  match_confidence  numeric(3,2),
  needs_review      boolean NOT NULL DEFAULT false,
  imported_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_file, source_line)                     -- importing the same file twice is a no-op
);

-- ---------------------------------------------------------------- members
CREATE TABLE accounts (
  id                serial PRIMARY KEY,
  customer_id       int REFERENCES customers(id),
  email             citext NOT NULL UNIQUE,
  password_hash     text,                               -- bcrypt; NULL until the user sets a password
  must_set_password boolean NOT NULL DEFAULT true,
  legacy_ids        int[],
  created_at        timestamptz NOT NULL DEFAULT now(),
  last_login_at     timestamptz
);

-- What somebody paid for. Access is derived from the dates, never from an "active" flag
-- that somebody has to remember to switch off.
CREATE TABLE entitlements (
  id            serial PRIMARY KEY,
  account_id    int NOT NULL REFERENCES accounts(id),
  product_code  text REFERENCES products(code),
  course_id     int REFERENCES courses(id),           -- single course only
  invoice_id    int REFERENCES invoices(id),
  starts_on     date,
  ends_on       date,                                  -- NULL = lifetime (single course) or rolling monthly
  legacy_active boolean,                               -- what the old table said, kept for comparison
  source        text NOT NULL DEFAULT 'web'
);
CREATE INDEX entitlements_account_idx ON entitlements (account_id);

CREATE VIEW account_access AS
SELECT a.id AS account_id, a.email,
       bool_or(e.ends_on IS NULL OR e.ends_on >= current_date) AS has_access,
       max(e.ends_on) AS access_until,
       array_agg(DISTINCT e.product_code) AS products
FROM accounts a
LEFT JOIN entitlements e ON e.account_id = a.id AND (e.starts_on IS NULL OR e.starts_on <= current_date)
GROUP BY a.id, a.email;
