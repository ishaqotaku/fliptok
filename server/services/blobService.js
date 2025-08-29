const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'videos';

if (!connStr) console.warn('AZURE_STORAGE_CONNECTION_STRING not set, blob uploads will fail until configured.');

const blobServiceClient = connStr ? BlobServiceClient.fromConnectionString(connStr) : null;

// Extract account name and key for SAS generation
const accountNameMatch = connStr.match(/AccountName=([^;]+)/);
const accountKeyMatch = connStr.match(/AccountKey=([^;]+)/);
const accountName = accountNameMatch ? accountNameMatch[1] : '';
const accountKey = accountKeyMatch ? accountKeyMatch[1] : '';
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

async function uploadStreamToBlob(readableStream, contentType, originalName) {
  if (!blobServiceClient) throw new Error('Blob service not configured');

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists(); // private container

  const blobName = `${uuidv4()}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const uploadOptions = { blobHTTPHeaders: { blobContentType: contentType } };

  const stream = readableStream;
  const ONE_MEGABYTE = 1024 * 1024;
  const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
  const HIGH_CONCURRENCY = 20;

  await blockBlobClient.uploadStream(stream, FOUR_MEGABYTES, HIGH_CONCURRENCY, uploadOptions);

  // Generate SAS URL valid for 24 hours
  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse('r'), // read only
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 24 * 60 * 60 * 1000), // 24 hours
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  return `${blockBlobClient.url}?${sasToken}`;
}

module.exports = { uploadStreamToBlob };
