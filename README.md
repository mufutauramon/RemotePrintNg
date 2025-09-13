# RemotePrint NG – Azure Static Web Apps (Frontend + Functions)

This repo contains a complete **SWA** setup:
- `frontend/` static site (index.html, style, script)
- `api/` Functions API with HTTP endpoints + a timer `PrintWorker`
- GitHub Action to deploy both

## Configure (SWA → Configuration)

- **If using SQL password (SWA Free):**
  - `USE_SQL_PASSWORD = true`
  - `SQL_CONNECTION_STRING = Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;User ID=<user>;Password=<pwd>;Encrypt=true;`

- **If using Managed Identity (SWA Standard):**
  - `USE_SQL_PASSWORD = false`
  - `SQL_MI_CONNECTION_STRING = Server=tcp:<server>.database.windows.net,1433;Database=<db>;Encrypt=true;`
  - Grant the SWA Functions identity db_datareader/db_datawriter in Azure SQL.

- Storage:
  - `STORAGE_CONNECTION_STRING`
  - `STORAGE_CONTAINER`

- JWT:
  - `JWT_SECRET`

- Worker (optional):
  - `IPP_PRINTER_URL`
  - `BATCH_SIZE`

## API routes

- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET  `/api/me`
- POST `/api/subscribe`
- POST `/api/price`
- POST `/api/uploads/sas`
- POST `/api/jobs`
- GET  `/api/jobs`
- Timer: `PrintWorker` runs every 5 minutes

## Notes

- Frontend calls `/api/*` automatically (SWA proxy).
- Upload uses **SAS** (browser uploads directly to Blob).
- Remember to create SQL schema for Plans/Users/Subscriptions/Jobs.
- Thank you