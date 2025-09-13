import jwt from 'jsonwebtoken';
export const sign = (u) => jwt.sign(u, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
export const verify = (t) => jwt.verify(t, process.env.JWT_SECRET || 'dev');
export const getUser = (req) => {
  const h = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) { const e = new Error('unauthorized'); e.status = 401; throw e; }
  try { return verify(token); } catch { const e = new Error('unauthorized'); e.status = 401; throw e; }
};
