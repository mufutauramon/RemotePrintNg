import { getUser } from '../../lib/jwt.js';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from '@azure/storage-blob';

export default async function (context, req) {
  const user = getUser(req);
  const { fileName } = req.body || {};
  const conn = process.env.STORAGE_CONNECTION_STRING;
  const match = /AccountName=([^;]+);AccountKey=([^;]+)/.exec(conn || '');
  if(!match) return { status: 500, body: { error: 'storage connection string required' } };
  const [_, accountName, accountKey] = match;
  const cred = new StorageSharedKeyCredential(accountName, accountKey);
  const svc = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, cred);
  const container = svc.getContainerClient(process.env.STORAGE_CONTAINER);
  const safeName = (fileName||'file').replace(/[^a-zA-Z0-9._-]/g,'_');
  const blobName = `${user.id}/${Date.now()}_${safeName}`;
  const blob = container.getBlockBlobClient(blobName);

  const sas = generateBlobSASQueryParameters({
    containerName: container.containerName,
    blobName,
    permissions: BlobSASPermissions.parse('cw'),
    startsOn: new Date(Date.now()-5*60*1000),
    expiresOn: new Date(Date.now()+60*60*1000),
    protocol: SASProtocol.Https
  }, cred).toString();

  return { status: 200, body: { uploadUrl: `${blob.url}?${sas}`, blobUrl: blob.url } };
}
