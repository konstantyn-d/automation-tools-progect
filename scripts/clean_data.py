"""Clean the LoopCasts Dropbox export into tidy CSV files for PostgreSQL.

Input : data/raw/dropbox/... (the unzipped dataset, not in git)
Output: data/clean/*.csv   (loaded by db/seed/load.sql)
        docs/data-quality.md (aggregate findings only, no personal data)

Run:   python scripts/clean_data.py
"""
from __future__ import annotations

import collections
import csv
import re
import sys
import unicodedata
from datetime import date, datetime
from pathlib import Path

import openpyxl
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "dropbox"
OUT = ROOT / "data" / "clean"
REPORT = ROOT / "docs" / "data-quality.md"

EU = {"AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT",
      "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"}

# Products and prices from handbook chapter 01 (prices excl. VAT).
PRODUCTS = [
    # code, name, price_excl, period, seats
    ("monthly", "Monthly subscription", 15, "month", 1),
    ("yearly", "Yearly subscription", 149, "year", 1),
    ("team", "Team licence", 599, "year", 5),
    ("single", "Single course", 39, "once", 1),
]
PRODUCT_BY_NAME = {"monthly subscription": "monthly", "yearly subscription": "yearly",
                   "team licence": "team", "single course": "single"}

COUNTRY_ALIASES = {
    "belgium": "BE", "belgie": "BE", "belgië": "BE", "belgi": "BE", "b": "BE", "be": "BE",
    "netherlands": "NL", "the netherlands": "NL", "nederland": "NL", "holland": "NL", "nl": "NL",
    "france": "FR", "frankrijk": "FR", "fr": "FR",
    "germany": "DE", "deutschland": "DE", "duitsland": "DE", "de": "DE",
    "united kingdom": "GB", "uk": "GB", "gb": "GB",
    "united states": "US", "usa": "US", "us": "US",
    "spain": "ES", "españa": "ES", "espana": "ES", "es": "ES",
    "italy": "IT", "it": "IT", "poland": "PL", "pl": "PL", "ireland": "IE", "ie": "IE",
    "luxembourg": "LU", "lu": "LU", "switzerland": "CH", "ch": "CH",
}
LEVELS = {"beginner": "beginner", "easy": "beginner", "intermediate": "intermediate",
          "medium": "intermediate", "advanced": "advanced", "expert": "advanced"}

GREEN, ORANGE, RED = "0092D050", "00FFC000", "00FF5050"

findings: list[tuple[str, str]] = []
MONTH_FIRST: list[str] = []
UNPARSED_DATES: list[str] = []
YEAR_FROM_SHEET: list[str] = []


def note(area: str, text: str) -> None:
    findings.append((area, text))


# ---------------------------------------------------------------- helpers
def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def slugify(s: str) -> str:
    s = strip_accents(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


MONTHS = {"jan": 1, "feb": 2, "mrt": 3, "mar": 3, "apr": 4, "mei": 5, "may": 5, "jun": 6, "jul": 7,
          "aug": 8, "sep": 9, "okt": 10, "oct": 10, "nov": 11, "dec": 12}


def parse_date(v, year: int | None = None) -> date | None:
    """Handles datetime objects, 2026-01-06, 05/01/2026, 5-1-26, 31/5/2026 (always day first)."""
    if v is None or (isinstance(v, float) and pd.isna(v)) or v is pd.NaT:
        return None
    if isinstance(v, (datetime, pd.Timestamp)):
        return v.date()
    if isinstance(v, date):
        return v
    s = str(v).strip()
    if not s:
        return None
    m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m:
        return date(int(m[1]), int(m[2]), int(m[3]))
    m = re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$", s)
    if m:
        y = int(m[3])
        y = y + 2000 if y < 100 else y
        a, b = int(m[1]), int(m[2])
        if b > 12:                       # 03/14/2023: somebody typed it month first
            MONTH_FIRST.append(s)
            a, b = b, a
        return date(y, b, a)
    m = re.match(r"^(\d{1,2})\s+([a-z]{3})[a-z]*\.?$", s.lower())
    if m and year and m[2] in MONTHS:    # "11 apr" in the 2026 orders sheet: year from the sheet
        YEAR_FROM_SHEET.append(s)
        return date(year, MONTHS[m[2]], int(m[1]))
    UNPARSED_DATES.append(s)             # "24 okt", "?": no year, cannot be trusted
    return None


def parse_money(v) -> float | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    if isinstance(v, (int, float)):
        return round(float(v), 2)
    s = str(v).replace("€", "").replace("€", "").replace("�", "").strip().replace(" ", "")
    if "," in s and "." in s:          # 1.234,56
        s = s.replace(".", "").replace(",", ".")
    else:
        s = s.replace(",", ".")
    return round(float(s), 2) if s else None


def norm_email(v) -> str | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    s = str(v).strip().lower().replace(",", ".")   # "mail,example" typos seen in the data
    return s or None


def norm_country(v) -> str | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    s = strip_accents(str(v)).strip().lower().replace("�", "")
    return COUNTRY_ALIASES.get(s, s.upper() if len(s) == 2 else None)


def norm_vat(v) -> str | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    s = re.sub(r"[\s.\-]", "", str(v)).upper()
    return s or None


def is_blank(v) -> bool:
    return v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == ""


def duration_minutes(v) -> int | None:
    """'1h20', '55 min', '1:45:00', '2h 50', '186 min' -> minutes."""
    if is_blank(v):
        return None
    if hasattr(v, "hour") and hasattr(v, "minute"):      # Excel turned "1:45:00" into a time
        return v.hour * 60 + v.minute
    s = str(v).strip().lower()
    if m := re.match(r"^(\d+):(\d{2}):(\d{2})$", s):
        return int(m[1]) * 60 + int(m[2])
    if m := re.match(r"^(\d+)\s*h\s*(\d+)?", s):
        return int(m[1]) * 60 + int(m[2] or 0)
    if m := re.match(r"^(\d+)\s*min", s):
        return int(m[1])
    return None                                         # "?", "tbd", …


def fills(path: Path, sheet: str) -> list[str | None]:
    """Background colour of each data row (Excel colours carry meaning at LoopCasts)."""
    ws = openpyxl.load_workbook(path)[sheet]
    out = []
    for row in ws.iter_rows(min_row=2):
        colours = {c.fill.fgColor.rgb for c in row if c.fill is not None and c.fill.fill_type}
        out.append(next(iter(colours)) if colours else None)
    return out


def vat_rule(country: str | None, is_company: bool, vat_number: str | None) -> tuple[str, float]:
    if country == "BE" or country is None:
        return "BE_21", 0.21
    if country in EU:
        if is_company and vat_number:
            return "EU_REVERSE_CHARGE", 0.0
        return "EU_PRIVATE_21", 0.21
    return "NON_EU_0", 0.0


def write(name: str, rows: list[dict], cols: list[str]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / f"{name}.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: ("" if r.get(k) is None else r.get(k)) for k in cols})
    print(f"  {name}.csv: {len(rows)} rows")


# ---------------------------------------------------------------- products
def build_products():
    return [dict(code=c, name=n, price_excl=p, billing_period=per, seats=s) for c, n, p, per, s in PRODUCTS]


# ---------------------------------------------------------------- catalogue + videos
def build_catalogue():
    cat = pd.read_excel(RAW / "Courses" / "course catalogue.xlsx")
    vim = pd.read_csv(RAW / "Courses" / "vimeo export 2026-06-30.csv")

    courses, by_title = [], {}
    raw_levels = collections.Counter(str(x) for x in cat.level)
    for i, r in cat.iterrows():
        level = LEVELS.get(str(r.level).strip().lower()) if not is_blank(r.level) else None
        c = dict(
            id=i + 1, slug=slugify(r.title), title=r.title.strip(), level=level,
            status=str(r.status).strip().lower(), published_on=parse_date(r.published),
            single_price=parse_money(r.single_price),
            catalogue_videos=int(r.videos) if not is_blank(r.videos) else None,
            catalogue_minutes=duration_minutes(r.total_duration),
        )
        courses.append(c)
        by_title[c["title"]] = c
    note("Catalogue", f"{len(courses)} courses. Level written {len(raw_levels)} different ways "
         f"({', '.join(sorted(raw_levels))}); mapped to beginner / intermediate / advanced, "
         f"{sum(1 for c in courses if not c['level'])} without level.")
    durs = collections.Counter(re.sub(r"\d", "9", str(x)) for x in cat.total_duration.dropna())
    note("Catalogue", f"Duration in {len(durs)} formats ({', '.join(sorted(durs)[:6])}, ...); stored as minutes.")
    note("Catalogue", f"{sum(1 for c in courses if c['single_price'] is None)} courses without a single price "
         f"(prices used: {sorted({c['single_price'] for c in courses if c['single_price']})}).")

    videos = []
    for _, v in vim.iterrows():
        course = by_title.get(v.folder.strip())
        m = re.search(r"(\d+)\s*$", v.title)
        videos.append(dict(
            vimeo_id=int(v.video_id), course_id=course["id"] if course else None,
            position=int(m[1]) if m else None, title=v.title.strip(),
            duration_s=int(v.duration_seconds), privacy=v.privacy,
            embed_domains=v.embed_domains if not is_blank(v.embed_domains) else None,
            has_description=bool(v.has_description), has_chapters=bool(v.has_chapters),
            has_captions=bool(v.has_captions), uploaded_on=parse_date(v.uploaded),
        ))
    # catalogue numbers vs. Vimeo reality
    per_course = collections.defaultdict(list)
    for v in videos:
        per_course[v["course_id"]].append(v)
    mismatch_count = mismatch_time = 0
    for c in courses:
        vs = per_course.get(c["id"], [])
        c["video_count"] = len(vs)
        c["duration_min"] = round(sum(v["duration_s"] for v in vs) / 60) if vs else c["catalogue_minutes"]
        if vs and c["catalogue_videos"] and c["catalogue_videos"] != len(vs):
            mismatch_count += 1
        if vs and c["catalogue_minutes"] and abs(c["catalogue_minutes"] - c["duration_min"]) > 5:
            mismatch_time += 1
    total_min = round(sum(v["duration_s"] for v in videos) / 60)
    note("Vimeo", f"{len(videos)} videos, {total_min} minutes. Public (privacy=anybody): "
         f"{sum(v['privacy'] == 'anybody' for v in videos)}. Without chapters: "
         f"{sum(not v['has_chapters'] for v in videos)}. Without description: "
         f"{sum(not v['has_description'] for v in videos)}. With captions: {sum(v['has_captions'] for v in videos)}.")
    note("Vimeo", f"Catalogue video count differs from Vimeo for {mismatch_count} courses, duration (>5 min) "
         f"for {mismatch_time}. The database uses the Vimeo numbers.")
    empty = [c["title"] for c in courses if c["video_count"] == 0]
    note("Vimeo", f"Courses in the catalogue without videos in Vimeo: {len(empty)} ({', '.join(empty)}).")
    return courses, videos


# ---------------------------------------------------------------- customers, orders
def course_from_remark(remark, courses_by_slug):
    if is_blank(remark):
        return None
    m = re.search(r"course:\s*(.+)$", str(remark), re.I)
    if not m:
        return None
    want = slugify(m[1])
    for slug, c in courses_by_slug.items():
        if slug == want or slug.startswith(want) or want in slug:
            return c
    return None


def build_orders(courses):
    by_slug = {c["slug"]: c for c in courses}
    customers: dict[str, dict] = {}
    orders = []
    bad = collections.Counter()

    def customer_for(r, src):
        email = norm_email(r.email)
        if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$", email):
            bad["invalid email"] += 1
        c = customers.get(email)
        if not c:
            c = customers[email] = dict(id=len(customers) + 1, email=email, name=None, company=None,
                                        vat_number=None, country=None, source=src)
        # newest non-empty value wins
        for k, v in (("name", None if is_blank(r["name"]) else str(r["name"]).strip()),
                     ("company", None if is_blank(r.company) else str(r.company).strip()),
                     ("vat_number", norm_vat(r.vat_number)), ("country", norm_country(r.country))):
            if v:
                c[k] = v
        return c

    country_raw = collections.Counter()
    date_formats = collections.Counter()
    for year, path in ((2025, RAW / "ADMIN" / "orders 2025.xlsx"), (2026, RAW / "ADMIN (new)" / "orders 2026.xlsx")):
        df = pd.read_excel(path, dtype=object)
        colours = fills(path, "orders")
        for (_, r), colour in zip(df.iterrows(), colours):
            country_raw[str(r.country)] += 1
            date_formats[type(r.date).__name__ if not isinstance(r.date, str) else re.sub(r"\d", "9", r.date)] += 1
            c = customer_for(r, f"orders_{year}")
            product = PRODUCT_BY_NAME.get(str(r["product"]).strip().lower())
            course = course_from_remark(r.remark, by_slug) if product == "single" else None
            if product == "single" and not course:
                bad["single course order without identifiable course"] += 1
            if is_blank(c["vat_number"]) and not is_blank(c["company"]) and c["country"] in EU:
                bad["company order without VAT number"] += 1
            orders.append(dict(
                id=len(orders) + 1, customer_id=c["id"], ordered_on=parse_date(r.date, year),
                product_code=product, course_id=course["id"] if course else None,
                price_excl=parse_money(r.price_excl),
                legacy_invoice_nr=None if is_blank(r.invoice_nr) else str(r.invoice_nr).strip(),
                account_created=colour == RED, remark=None if is_blank(r.remark) else str(r.remark).strip(),
                source=f"orders_{year}",
            ))
    note("Orders", f"{len(orders)} orders (2025 + 2026). Country written {len(country_raw)} different ways; "
         f"normalised to ISO codes. Dates in {len(date_formats)} formats.")
    note("Orders", f"{bad['company order without VAT number']} EU company orders without VAT number; "
         f"{bad['single course order without identifiable course']} single-course orders where the course "
         f"cannot be identified from the remark; {bad['invalid email']} invalid e-mail addresses.")
    prices = collections.Counter(re.sub(r"\d", "9", str(x)) for x in pd.read_excel(RAW / "ADMIN (new)" / "orders 2026.xlsx").price_excl)
    note("Orders", f"Price column written in {len(prices)} formats (e.g. 149, 149,00, € 149).")
    no_inv = [o for o in orders if o["source"] == "orders_2026" and not o["legacy_invoice_nr"]]
    note("Orders", f"{len(no_inv)} orders of 2026 have no invoice number (never invoiced or not written down).")
    return customers, orders


# ---------------------------------------------------------------- invoices
def build_invoices(customers, orders):
    path = RAW / "ADMIN (new)" / "Facturen 2026.xlsx"
    inv_main = pd.read_excel(path, sheet_name="2026", dtype=object)
    inv_month = pd.read_excel(path, sheet_name="monthly", dtype=object)
    order_by_inv = {o["legacy_invoice_nr"]: o for o in orders if o["legacy_invoice_nr"]}
    cust_by_id = {c["id"]: c for c in customers.values()}
    invoices = []
    status_of = {GREEN: "paid", ORANGE: "paid_wrong_amount", None: "open"}

    numbers = collections.Counter(str(x).strip() for x in inv_main.invoice_nr)
    dups = sorted(n for n, k in numbers.items() if k > 1)
    seq = sorted(int(n.split("-")[1]) for n in numbers)
    gaps = sorted(set(range(seq[0], seq[-1] + 1)) - set(seq))
    note("Invoices", f"{len(inv_main)} invoices in the main register (2026-0001..2026-{seq[-1]:04d}). "
         f"Duplicate numbers: {', '.join(dups) or 'none'}. Missing numbers: "
         f"{', '.join(f'2026-{g:04d}' for g in gaps) or 'none'}.")

    vat_errors, sum_errors = [], 0
    for (_, r), colour in zip(inv_main.iterrows(), fills(path, "2026")):
        nr = str(r.invoice_nr).strip()
        excl, vat, total = parse_money(r.amount_excl), parse_money(r.vat), parse_money(r.total)
        o = order_by_inv.get(nr)
        cust = cust_by_id.get(o["customer_id"]) if o else None
        kind = "credit_note" if (excl or 0) < 0 else "invoice"
        if abs(round((excl or 0) + (vat or 0), 2) - (total or 0)) > 0.01:
            sum_errors += 1
        expected = None
        if cust and kind == "invoice":
            rule, rate = vat_rule(cust["country"], bool(cust["company"]), cust["vat_number"])
            expected = round(excl * rate, 2)
            if abs(expected - (vat or 0)) > 0.01:
                vat_errors.append(nr)
        invoices.append(dict(
            number=nr, series="main", kind=kind, issued_on=parse_date(r.date),
            customer_id=cust["id"] if cust else None, order_id=o["id"] if o else None,
            customer_name=str(r.customer).strip(), amount_excl=excl, vat_amount=vat, total=total,
            status=status_of.get(colour, "open") if kind == "invoice" else "credited",
            remark=None if is_blank(r.remark) else str(r.remark).strip(),
            duplicate_number=nr in dups,
        ))
    note("Invoices", f"{sum_errors} invoices where excl. + VAT ≠ total. {len(vat_errors)} invoices where the VAT "
         f"does not match the VAT rule for that customer ({', '.join(vat_errors[:8])}{' …' if len(vat_errors) > 8 else ''}).")
    unlinked = sum(1 for i in invoices if not i["customer_id"])
    note("Invoices", f"{unlinked} invoices cannot be linked to an order/customer (register has only a name, "
         f"no e-mail; link goes through the invoice number in the orders sheet).")

    for (_, r), colour in zip(inv_month.iterrows(), fills(path, "monthly")):
        email = norm_email(r.email)
        cust = customers.get(email)
        if not cust:
            cust = customers[email] = dict(id=len(customers) + 1, email=email, name=str(r.customer).strip(),
                                           company=None, vat_number=None, country=None, source="monthly_register")
        invoices.append(dict(
            number=str(r.invoice_nr).strip(), series="monthly", kind="invoice", issued_on=parse_date(r.date),
            customer_id=cust["id"], order_id=None, customer_name=str(r.customer).strip(),
            amount_excl=parse_money(r.amount_excl), vat_amount=parse_money(r.vat), total=parse_money(r.total),
            status=status_of.get(colour, "open"), remark=None, duplicate_number=False,
        ))
    st = collections.Counter((i["series"], i["status"]) for i in invoices)
    open_amount = sum(i["total"] for i in invoices if i["status"] == "open")
    note("Invoices", f"Paid status only exists as a cell colour: main register {st[('main', 'paid')]} green, "
         f"{st[('main', 'paid_wrong_amount')]} orange, {st[('main', 'open')]} uncoloured; monthly register "
         f"{st[('monthly', 'paid')]} green, {st[('monthly', 'open')]} uncoloured. Open according to colours: "
         f"€{open_amount:,.2f}.")
    note("Invoices", "Monthly invoices use a second numbering series (M26-01-001 …) in a separate tab.")
    for i, inv in enumerate(invoices, 1):
        inv["id"] = i
    return invoices


# ---------------------------------------------------------------- bank
def build_bank():
    path = RAW / "ADMIN (new)" / "bank" / "KBC export 2026-01-01 to 2026-06-30.csv"
    df = pd.read_csv(path, sep=";", dtype=str, encoding="utf-8")
    rows = []
    for i, r in df.iterrows():
        rows.append(dict(
            id=i + 1, booked_on=parse_date(r.Datum), amount=parse_money(r.Bedrag), currency=r.Munt,
            counterparty_name=None if is_blank(r["Naam tegenpartij"]) else r["Naam tegenpartij"].strip(),
            counterparty_iban=None if is_blank(r["Rekening tegenpartij"]) else r["Rekening tegenpartij"].replace(" ", ""),
            message=None if is_blank(r["Vrije mededeling"]) else r["Vrije mededeling"].strip(),
            balance=parse_money(r.Saldo), source_file=path.name, source_line=i + 2,
        ))
    incoming = [r for r in rows if r["amount"] > 0]
    with_nr = [r for r in incoming if r["message"] and re.search(r"(20\d{2}-?\d{4}|M\d{2}-\d{2}-\d{3})", r["message"])]
    empty = [r for r in incoming if not r["message"]]
    common = collections.Counter(r["amount"] for r in incoming).most_common(3)
    note("Bank", f"{len(rows)} lines, {len(incoming)} incoming. With a recognisable invoice number (main or monthly series) in the message: "
         f"{len(with_nr)} ({len(with_nr) / len(incoming):.0%}). Empty message: {len(empty)}. Most common amounts: "
         f"{', '.join(f'€{a} ×{n}' for a, n in common)}.")
    return rows


# ---------------------------------------------------------------- members (old users table)
def build_accounts(customers, orders, courses):
    sql = (RAW / "Website" / "users table export 2026-06-30.sql").read_text(encoding="latin-1")
    pat = re.compile(r"\((\d+), '([^']*)', '([0-9a-f]{32})', (NULL|'[^']*'), (NULL|'[^']*'), (NULL|'[^']*'), (\d)\)")
    raw = pat.findall(sql)
    export_day = date(2026, 6, 30)
    accounts: dict[str, dict] = {}
    entitlements = []
    zombies = 0
    single_by_email = collections.defaultdict(list)
    cust_email = {c["id"]: c["email"] for c in customers.values()}
    for o in orders:
        if o["product_code"] == "single" and o["course_id"]:
            single_by_email[cust_email[o["customer_id"]]].append(o["course_id"])

    val = lambda s: None if s == "NULL" else s.strip("'")
    for legacy_id, email, _md5, product, start, end, active in raw:
        email = norm_email(email)
        end_d = parse_date(val(end)) if val(end) else None
        if active == "1" and end_d and end_d < export_day:
            zombies += 1
        acc = accounts.get(email)
        if not acc:
            cust = customers.get(email)
            if not cust:
                cust = customers[email] = dict(id=len(customers) + 1, email=email, name=None, company=None,
                                               vat_number=None, country=None, source="members_db")
            acc = accounts[email] = dict(id=len(accounts) + 1, customer_id=cust["id"], email=email,
                                         legacy_ids=[], must_set_password=True)
        acc["legacy_ids"].append(legacy_id)
        product = val(product)
        course_id = None
        if product == "single":
            course_id = (single_by_email.get(email) or [None])[0]
        entitlements.append(dict(
            id=len(entitlements) + 1, account_id=acc["id"], product_code=product, course_id=course_id,
            starts_on=parse_date(val(start)), ends_on=end_d, legacy_active=active == "1", source="members_db",
        ))
    for a in accounts.values():
        a["legacy_ids"] = "{" + ",".join(a["legacy_ids"]) + "}"
    dups = len(raw) - len(accounts)
    note("Members", f"{len(raw)} rows in the old users table, {len(accounts)} unique e-mails ({dups} duplicate rows, "
         f"merged: one login per e-mail, every row kept as an entitlement).")
    note("Members", f"{zombies} accounts still active although the end date has passed (on {export_day}). In the new "
         f"model access is computed from the end date, so this cannot happen again.")
    note("Members", "Passwords are MD5 hashes of 'first name + number'. They are NOT imported; every account gets a "
         "'set your password' link (bcrypt from then on).")
    unknown_single = sum(1 for e in entitlements if e["product_code"] == "single" and not e["course_id"])
    note("Members", f"{unknown_single} single-course accounts where the old table does not say which course "
         f"(not in the 2025/2026 orders either).")
    return accounts, entitlements


# ---------------------------------------------------------------- main
def main() -> int:
    if not RAW.exists():
        print(f"Dataset not found at {RAW}. Unzip LoopCasts.zip into data/raw first.", file=sys.stderr)
        return 1
    print("Cleaning LoopCasts data …")
    products = build_products()
    courses, videos = build_catalogue()
    customers, orders = build_orders(courses)
    invoices = build_invoices(customers, orders)
    bank = build_bank()
    accounts, entitlements = build_accounts(customers, orders, courses)

    write("products", products, ["code", "name", "price_excl", "billing_period", "seats"])
    write("courses", courses, ["id", "slug", "title", "level", "status", "published_on", "single_price",
                               "video_count", "duration_min"])
    write("videos", videos, ["vimeo_id", "course_id", "position", "title", "duration_s", "privacy", "embed_domains",
                             "has_description", "has_chapters", "has_captions", "uploaded_on"])
    write("customers", sorted(customers.values(), key=lambda c: c["id"]),
          ["id", "email", "name", "company", "vat_number", "country", "source"])
    write("orders", orders, ["id", "customer_id", "ordered_on", "product_code", "course_id", "price_excl",
                             "legacy_invoice_nr", "account_created", "remark", "source"])
    write("invoices", invoices, ["id", "number", "series", "kind", "issued_on", "customer_id", "order_id",
                                 "customer_name", "amount_excl", "vat_amount", "total", "status", "remark",
                                 "duplicate_number"])
    write("bank_transactions", bank, ["id", "booked_on", "amount", "currency", "counterparty_name",
                                      "counterparty_iban", "message", "balance", "source_file", "source_line"])
    write("accounts", list(accounts.values()), ["id", "customer_id", "email", "legacy_ids", "must_set_password"])
    write("entitlements", entitlements, ["id", "account_id", "product_code", "course_id", "starts_on", "ends_on",
                                         "legacy_active", "source"])

    if MONTH_FIRST:
        note("Dates", f"{len(MONTH_FIRST)} dates were typed month first (e.g. {MONTH_FIRST[0]}); detected because the "
             f"'month' was above 12. Ambiguous ones (both parts ≤ 12) are read day first, as in Belgium.")
    if YEAR_FROM_SHEET:
        note("Dates", f"{len(YEAR_FROM_SHEET)} order dates were written without a year in Dutch or English "
             f"(e.g. {YEAR_FROM_SHEET[0]}); the year was taken from the sheet (orders 2025 / 2026).")
    if UNPARSED_DATES:
        note("Dates", f"{len(UNPARSED_DATES)} dates could not be read at all ({', '.join(sorted(set(UNPARSED_DATES))[:6])}); "
             f"stored as empty.")
    lines = ["# LoopCasts data quality report", "",
             "Generated by `scripts/clean_data.py` from the Dropbox export. Aggregates only, no personal data.", ""]
    for area in dict.fromkeys(a for a, _ in findings):
        lines += [f"## {area}", ""] + [f"- {t}" for a, t in findings if a == area] + [""]
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report: {REPORT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
