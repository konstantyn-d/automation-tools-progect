// LoopCasts API. Synchronous things the site needs right away live here
// (catalog, search, VAT check, later login and account). Multi-step business
// processes (order → invoice → payment → access) run in n8n.
import Fastify from 'fastify';
import { one, pool, q } from './db.js';
import { checkVat } from './vies.js';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

const LEVELS = ['beginner', 'intermediate', 'advanced'];

app.get('/api/health', async () => {
  await q('SELECT 1');
  return { ok: true };
});

// ---------------------------------------------------------------- products
app.get('/api/products', async () =>
  q(`SELECT code, name, price_excl, billing_period, seats FROM products WHERE active
     ORDER BY array_position(ARRAY['monthly','yearly','team','single'], code)`));

// ---------------------------------------------------------------- catalog
const COURSE_COLUMNS = `c.id, c.slug, c.title, c.summary, c.level, c.status, c.published_on,
  coalesce(c.single_price, 39) AS single_price, c.video_count, c.duration_min`;

app.get('/api/courses', async (req) => {
  const { level, sort = 'popular' } = req.query;
  const params = [];
  let where = `c.status = 'live' AND c.video_count > 0`;
  if (LEVELS.includes(level)) {
    params.push(level);
    where += ` AND c.level = $${params.length}`;
  }
  const order = sort === 'new' ? 'c.published_on DESC NULLS LAST' : 'sold DESC, c.published_on DESC NULLS LAST';
  // "popular" = how often the course was bought on its own (real order data)
  return q(
    `SELECT ${COURSE_COLUMNS}, count(o.id)::int AS sold
     FROM courses c
     LEFT JOIN orders o ON o.course_id = c.id AND o.product_code = 'single'
     WHERE ${where}
     GROUP BY c.id
     ORDER BY ${order}`,
    params,
  );
});

app.get('/api/courses/:slug', async (req, reply) => {
  const course = await one(`SELECT ${COURSE_COLUMNS} FROM courses c WHERE c.slug = $1 AND c.status <> 'draft'`, [req.params.slug]);
  if (!course) return reply.code(404).send({ message: 'Course not found' });
  // Only the first lesson is free. The Vimeo id of members-only lessons is not exposed
  // until login exists (step 2).
  course.lessons = await q(
    `SELECT position, title, duration_s, has_chapters, has_captions,
            (position = 1) AS free,
            CASE WHEN position = 1 THEN vimeo_id END AS vimeo_id
     FROM videos WHERE course_id = $1 ORDER BY position`,
    [course.id],
  );
  return course;
});

// ---------------------------------------------------------------- search
// Postgres full-text search over video titles now; transcripts are added to the same
// column by the Whisper pipeline later, so this endpoint will not change.
app.get('/api/search', async (req) => {
  const term = String(req.query.q || '').trim().slice(0, 100);
  if (term.length < 2) return [];
  return q(
    `SELECT c.slug AS course_slug, c.title AS course_title, v.position, v.title, v.duration_s,
            ts_rank(v.search, query) AS rank,
            CASE WHEN v.transcript IS NOT NULL
                 THEN ts_headline('simple', v.transcript, query, 'MaxWords=18,MinWords=8') END AS snippet
     FROM videos v
     JOIN courses c ON c.id = v.course_id AND c.status = 'live',
          websearch_to_tsquery('simple', $1) AS query
     WHERE v.search @@ query OR c.title ILIKE '%' || $1 || '%'
     ORDER BY rank DESC, c.title, v.position
     LIMIT 40`,
    [term],
  );
});

// ---------------------------------------------------------------- VAT (VIES)
// Live check while the customer types. n8n checks again when the order is placed and
// stores the result with the order (proof for the accountant).
app.post('/api/vat/check', async (req) => checkVat(req.body?.vat));

// ---------------------------------------------------------------- errors
app.setErrorHandler((err, req, reply) => {
  req.log.error(err);
  reply.code(err.statusCode || 500).send({ message: err.statusCode ? err.message : 'Something went wrong on our side.' });
});

const port = Number(process.env.API_PORT || 3001);
await app.listen({ port, host: '127.0.0.1' });

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
