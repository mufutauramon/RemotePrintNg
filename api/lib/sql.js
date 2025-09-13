import sql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';

let pool;
export async function getSqlPool() {
  if (pool) return pool;
  const usePassword = String(process.env.USE_SQL_PASSWORD || 'true').toLowerCase() === 'true';
  if (usePassword) {
    pool = await sql.connect({ connectionString: process.env.SQL_CONNECTION_STRING, options: { encrypt: true } });
    return pool;
  }
  const cred = new DefaultAzureCredential();
  const token = await cred.getToken('https://database.windows.net/.default');
  pool = await sql.connect({
    authentication: { type: 'azure-active-directory-access-token', options: { token: token.token } },
    options: { encrypt: true },
    connectionString: process.env.SQL_MI_CONNECTION_STRING
  });
  return pool;
}
