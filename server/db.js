import pg from 'pg';

// numeric columns come back as strings by default; money fits safely in a JS number here
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => (v === null ? null : Number(v)));
// keep DATE as 'YYYY-MM-DD' instead of a JS Date shifted by the time zone
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

export const q = async (text, params) => (await pool.query(text, params)).rows;
export const one = async (text, params) => (await pool.query(text, params)).rows[0] ?? null;
