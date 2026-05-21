const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const PUBLIC_BUCKET = process.env.SUPABASE_PUBLIC_BUCKET || 'public-images';
const DIAGNOSIS_BUCKET = process.env.SUPABASE_DIAGNOSIS_BUCKET || 'diagnosis-images';

function buildObjectKey(prefix, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${prefix}/${unique}${ext}`;
}

function getFileBody(file) {
  if (file?.buffer) return file.buffer;
  if (file?.path) return fs.readFileSync(file.path);
  throw new Error('File buffer or path is required');
}

async function uploadToBucket(bucket, file, objectKey) {
  const body = getFileBody(file);
  const contentType = file?.mimetype || 'application/octet-stream';
  const { error } = await supabase.storage.from(bucket).upload(objectKey, body, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
}

async function uploadPublicImage(file, objectKey) {
  await uploadToBucket(PUBLIC_BUCKET, file, objectKey);
  const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(objectKey);
  return data?.publicUrl || data?.publicURL;
}

async function uploadDiagnosisImage(file, objectKey) {
  await uploadToBucket(DIAGNOSIS_BUCKET, file, objectKey);
  return `supabase-private://${DIAGNOSIS_BUCKET}/${objectKey}`;
}

async function createSignedUrlFromStoragePath(storagePath, expiresSeconds) {
  if (!storagePath || !storagePath.startsWith('supabase-private://')) return null;
  const without = storagePath.replace('supabase-private://', '');
  const firstSlash = without.indexOf('/');
  if (firstSlash === -1) return null;
  const bucket = without.slice(0, firstSlash);
  const objectPath = without.slice(firstSlash + 1);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, expiresSeconds);
  if (error) throw error;
  return data?.signedUrl || data?.signedURL || null;
}

module.exports = {
  buildObjectKey,
  uploadPublicImage,
  uploadDiagnosisImage,
  createSignedUrlFromStoragePath,
};
