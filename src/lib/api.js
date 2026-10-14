// Single integration layer between the site and the backend.
// - Real now: catalog, products, search, VAT check -> LoopCasts API (/api, server/index.js)
// - Still mocked: orders, login, account, support, newsletter -> n8n webhooks / API in the next steps.
//   While VITE_N8N_BASE_URL is empty those run on mock data.
import { makeOGM } from './ogm.js';
import { vatRule } from './vat.js';
import { PROMOS } from '../data/catalog.js';
import { MOCK_ACCOUNT } from '../data/account.js';

const API = import.meta.env.VITE_API_URL || '';

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// ---------- catalog (real data from Postgres) ----------
export const getProducts = () => api('/api/products');
export const getCourses = (params = {}) => api('/api/courses?' + new URLSearchParams(params));
export const getCourse = (slug) => api(`/api/courses/${encodeURIComponent(slug)}`);
export const searchVideos = (q) => api('/api/search?' + new URLSearchParams({ q }));

// ---------- VAT: real VIES check through the API ----------
export const checkVat = (vat) => api('/api/vat/check', { method: 'POST', body: { vat } });

const env = import.meta.env;
const BASE = env.VITE_N8N_BASE_URL || '';
export const MOCK = !BASE; // n8n not connected yet

// Name → path. Rendered in the UI by <Hook> so it is visible where n8n plugs in.
export const WEBHOOKS = {
  orderCreate: env.VITE_WH_ORDER_CREATE || '/webhook/order/create',
  vatCheck: env.VITE_WH_VAT_CHECK || '/webhook/vat/check',
  promoCheck: env.VITE_WH_PROMO_CHECK || '/webhook/promo/check',
  orderStatus: env.VITE_WH_ORDER_STATUS || '/webhook/order/status',
  login: env.VITE_WH_AUTH_LOGIN || '/webhook/auth/login',
  signup: env.VITE_WH_AUTH_SIGNUP || '/webhook/auth/signup',
  resetRequest: env.VITE_WH_PASSWORD_RESET_REQUEST || '/webhook/auth/reset-request',
  resetConfirm: env.VITE_WH_PASSWORD_RESET_CONFIRM || '/webhook/auth/reset-confirm',
  account: env.VITE_WH_ACCOUNT || '/webhook/account',
  billingUpdate: env.VITE_WH_BILLING_UPDATE || '/webhook/account/billing',
  seatsUpdate: env.VITE_WH_SEATS_UPDATE || '/webhook/account/seats',
  renew: env.VITE_WH_RENEW || '/webhook/subscription/renew',
  supportCreate: env.VITE_WH_SUPPORT_CREATE || '/webhook/support/create',
  newsletterSubscribe: env.VITE_WH_NEWSLETTER_SUBSCRIBE || '/webhook/newsletter/subscribe',
  newsletterConfirm: env.VITE_WH_NEWSLETTER_CONFIRM || '/webhook/newsletter/confirm',
  newsletterUnsubscribe: env.VITE_WH_NEWSLETTER_UNSUBSCRIBE || '/webhook/newsletter/unsubscribe',
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(name, body, mock) {
  if (MOCK) {
    await wait(450 + Math.random() * 400);
    return mock(body);
  }
  const res = await fetch(BASE + WEBHOOKS[name], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// ---------- mock state (localStorage, so flows survive a reload) ----------
const LS = 'lc_mock_v1';
function load() {
  try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; }
}
function save(s) {
  try { localStorage.setItem(LS, JSON.stringify(s)); } catch { /* private mode */ }
}
// In n8n the number is taken atomically from the database: no duplicates, no gaps.
function nextInvoiceNo(s) {
  s.invoiceSeq = (s.invoiceSeq || 136) + 1;
  return `2026-${String(s.invoiceSeq).padStart(4, '0')}`;
}

// ---------- Order → Invoice → Payment → Access ----------
export const checkPromo = (code, planId) =>
  call('promoCheck', { code, planId }, ({ code }) => {
    const p = PROMOS[String(code || '').trim().toUpperCase()];
    return p ? { valid: true, ...p } : { valid: false, message: 'Unknown or expired code.' };
  });

// Live price preview. n8n recalculates on the server; the browser is never trusted for money.
export function priceOrder({ plan, promo, country, isCompany, vatStatus }) {
  const gross = plan.price_excl;
  const discount = promo?.valid ? Math.round(gross * promo.percent) / 100 : 0;
  const net = +(gross - discount).toFixed(2);
  const rule = vatRule({ country, isCompany, vatValid: vatStatus === 'valid' });
  const vat = +(net * rule.rate).toFixed(2);
  return { plan, seats: plan.seats, gross, discount, net, vat, total: +(net + vat).toFixed(2), vatLabel: rule.label };
}

export const createOrder = (order) =>
  call('orderCreate', order, (o) => {
    const s = load();
    const p = priceOrder(o);
    const invoiceNo = nextInvoiceNo(s);
    const id = 'ORD-' + Date.now().toString(36).toUpperCase();
    const created = {
      id, invoiceNo,
      ogm: makeOGM(invoiceNo.replace('-', '')),
      status: 'payment_pending',
      plan: p.plan.name + (o.course ? `: ${o.course.title}` : ''), planId: p.plan.code, seats: p.seats,
      gross: p.gross, discount: p.discount, net: p.net, vat: p.vat, total: p.total, vatLabel: p.vatLabel,
      vatChecked: o.vatStatus !== 'unavailable',
      email: o.email, name: o.name, company: o.company, po: o.po,
      iban: 'BE68 5390 0754 7034', bic: 'KREDBEBB',
      createdAt: new Date().toISOString(),
    };
    s.orders = { ...(s.orders || {}), [id]: created };
    save(s);
    return created;
  });

export const getOrder = (id) =>
  call('orderStatus', { id }, ({ id }) => {
    const o = load().orders?.[id];
    if (!o) throw new Error('Order not found.');
    return o;
  });

// Demo only: in production the daily bank-matching workflow flips this status.
export function mockMarkPaid(id) {
  const s = load();
  if (!s.orders?.[id]) return null;
  s.orders[id] = { ...s.orders[id], status: 'paid', paidAt: new Date().toISOString() };
  save(s);
  return s.orders[id];
}

// ---------- Auth ----------
export const login = (email, password) =>
  call('login', { email, password }, ({ email, password }) => {
    if (!email || !password || password.length < 6) throw new Error('Wrong email or password.');
    return { user: { ...MOCK_ACCOUNT.user, email } };
  });

export const signup = (data) =>
  call('signup', data, (d) => ({ status: 'verify_email', email: d.email }));

// Same answer for every email, so the form never reveals who has an account.
export const requestReset = (email) =>
  call('resetRequest', { email }, () => ({ status: 'sent' }));

export const confirmReset = (token, password) =>
  call('resetConfirm', { token, password }, ({ token }) => {
    if (!token || token === 'expired') throw new Error('This link has expired. Request a new one.');
    return { status: 'ok' };
  });

// ---------- Account ----------
export const getAccount = () => call('account', {}, () => {
  const s = load();
  return { ...MOCK_ACCOUNT, ...(s.account || {}) };
});

function patchAccount(patch) {
  const s = load();
  s.account = { ...(s.account || {}), ...patch };
  save(s);
  return { ...MOCK_ACCOUNT, ...s.account };
}

export const updateBilling = (billing) =>
  call('billingUpdate', billing, (b) => patchAccount({ billing: b }));

export const updateSeats = (members) =>
  call('seatsUpdate', { members }, ({ members }) => patchAccount({ members }));

export const renewSubscription = () =>
  call('renew', {}, () => patchAccount({
    subscription: { ...MOCK_ACCOUNT.subscription, status: 'active', renewsAt: '2027-11-01', daysLeft: 383 },
  }));

// ---------- Support (AI triage + human approval happen in n8n) ----------
export const createSupport = (ticket) =>
  call('supportCreate', ticket, (t) => ({
    ticketId: 'LC-' + Math.floor(1000 + Math.random() * 9000),
    category: guessCategory(`${t.topic || ''} ${t.message}`),
    sla: '1 business day',
  }));

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/(password|wachtwoord|login|log in|inlog)/.test(t)) return 'Login / password';
  if (/(invoice|factuur|vat|btw|\bpo\b)/.test(t)) return 'Invoice / VAT';
  if (/(paid|betaald|access|toegang)/.test(t)) return 'Payment / access';
  if (/(refund|cancel|terugbetal)/.test(t)) return 'Refund / cancellation';
  return 'Course content';
}

// ---------- Newsletter (double opt-in) ----------
export const subscribeNewsletter = (email) =>
  call('newsletterSubscribe', { email }, () => ({ status: 'confirm_sent' }));

export const confirmNewsletter = (token) =>
  call('newsletterConfirm', { token }, ({ token }) => {
    if (!token) throw new Error('Missing confirmation token.');
    return { status: 'confirmed' };
  });

export const unsubscribeNewsletter = (token, reason) =>
  call('newsletterUnsubscribe', { token, reason }, () => ({ status: 'unsubscribed' }));
