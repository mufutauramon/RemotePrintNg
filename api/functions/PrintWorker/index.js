import { getSqlPool } from '../../lib/sql.js';
import { BlobServiceClient } from '@azure/storage-blob';


export default async function (context, myTimer) {
  const pool = await getSqlPool();
  const batchSize = parseInt(process.env.BATCH_SIZE || '5', 10);
  const printerUrl = process.env.IPP_PRINTER_URL || '';

  try {
    const jobs = (await pool.request().query(`SELECT TOP (${batchSize}) id, storage_url, file_name FROM Jobs WHERE status='Queued' ORDER BY id ASC`)).recordset;
    if (!jobs.length) return;

    const conn = process.env.STORAGE_CONNECTION_STRING;
    const accName = /AccountName=([^;]+)/.exec(conn)[1];
    const svc = BlobServiceClient.fromConnectionString(conn);
    const container = svc.getContainerClient(process.env.STORAGE_CONTAINER);

    for (const j of jobs) {
      context.log(`Printing job ${j.id} - ${j.file_name}`);
      await pool.request().input('id', j.id).query("UPDATE Jobs SET status='Printing' WHERE id=@id");

      // download blob
      const u = new URL(j.storage_url);
      const blobName = decodeURIComponent(u.pathname.split('/').slice(2).join('/'));
      const blob = container.getBlobClient(blobName);
      const dl = await blob.download();
      const buff = await streamToBuffer(dl.readableStreamBody);

      if (printerUrl) {
        const printer = ipp.Printer(printerUrl);
        await new Promise((resolve, reject)=>{
          printer.execute("Print-Job", {
            "operation-attributes-tag": {
              "requesting-user-name": "swa-func",
              "job-name": j.file_name,
              "document-format": "application/octet-stream"
            },
            data: buff
          }, (err) => err ? reject(err) : resolve());
        });
      }

      await pool.request().input('id', j.id).query("UPDATE Jobs SET status='Ready' WHERE id=@id");
    }
  } catch (e) {
    context.log.error(e);
  }
}

async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(chunk);
  return Buffer.concat(chunks);
}
