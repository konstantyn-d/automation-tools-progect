// Frontend-only copy for the products. Prices, seats and periods come from the
// database (/api/products); this file only adds the marketing text per product code.
export const PLAN_COPY = {
  monthly: {
    unit: '/ month',
    blurb: 'Every course, every new lesson. Cancel any month.',
    features: ['All courses', 'New videos every Tuesday and Friday', 'Invoice every month'],
  },
  yearly: {
    unit: '/ year', badge: 'Most popular',
    blurb: 'Everything for a year, one invoice.',
    features: ['All courses', 'About two months free compared to monthly', 'One invoice a year'],
  },
  team: {
    unit: '/ year · 5 seats',
    blurb: 'For companies. Manage the five seats yourself, PO number on the invoice.',
    features: ['5 people, all courses', 'Seat management in your account', 'VAT reverse charge for EU companies'],
  },
  single: {
    unit: 'once',
    blurb: 'One course, lifetime access.',
    features: ['Pick any course', 'Yours forever', 'Upgrade to a subscription later'],
  },
};

export const withCopy = (products) => products.map((p) => ({ ...p, ...PLAN_COPY[p.code] }));

// Promo codes are still mocked: they move into the database with the order workflow (step 3).
export const PROMOS = {
  LOOP10: { code: 'LOOP10', percent: 10, label: '10% off' },
};

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export const fmtDuration = (min) => (min == null ? '' : min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`);
export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
// Vimeo titles are "Course title — 03"; the lesson name itself is not in the data yet.
export const lessonLabel = (l) => `Lesson ${String(l.position).padStart(2, '0')}`;
