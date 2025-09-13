import bcrypt from 'bcryptjs';
import { getSqlPool } from '../../lib/sql.js';
import { sign } from '../../lib/jwt.js';

export default async function (context, req) {
  // helpful message if you hit it in a browser
  if (req.method === 'GET') {
    return { status: 200, body: { info: "POST { email, password } JSON to /api/auth/signup" } };
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return { status: 400, body: { error: "email and password required" } };
  }

  try {
    const pool = await getSqlPool();
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.request()
      .input('e', email)
      .input('p', hash)
      .query("INSERT INTO Users(email, pwd_hash) OUTPUT inserted.id VALUES(@e,@p)");
    const id = r.recordset[0].id;
    return { status: 200, body: { token: sign({ id, email }) } };
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      return { status: 409, body: { error: 'Email exists' } };
    }
    return { status: 500, body: { error: 'signup failed' } };
  }
}
