import bcrypt from 'bcryptjs';
import { getSqlPool } from '../../lib/sql.js';
import { sign } from '../../lib/jwt.js';

export default async function (context, req) {
  const { email, password } = req.body || {};
  const pool = await getSqlPool();
  const r = await pool.request().input('e', email)
    .query("SELECT TOP 1 id, pwd_hash FROM Users WHERE email=@e");
  if (!r.recordset.length) return { status: 401, body: { error: 'bad credentials' } };
  const u = r.recordset[0];
  const ok = await bcrypt.compare(password, u.pwd_hash);
  if (!ok) return { status: 401, body: { error: 'bad credentials' } };
  return { status: 200, body: { token: sign({ id: u.id, email }) } };
}
