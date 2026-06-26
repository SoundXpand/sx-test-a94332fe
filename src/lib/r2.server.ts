// R2 (S3-compatible) client + helpers. Server-only.
// NOTE: Credentials are intentionally hardcoded here per project owner request.
// Rotate by editing this file. Do NOT commit this file to a public repo.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_CONFIG = {
  accountId: "a0d38ea96c203a9a7384629a79c36198",
  accessKeyId: "d9b297a34ab05d834187a9b836a7887b",
  secretAccessKey: "c0e1a1ee01392c59c2c1bedfa183b185380db29b6d9999e4209a61ed37c79fa4",
  bucket: "sxstuff1",
  publicUrl: "https://pub-20a9d3b3d544440aafcac92ca3007881.r2.dev",
} as const;

export function r2Client(): { client: S3Client; bucket: string; publicBase: string } {
  const publicBase = R2_CONFIG.publicUrl.replace(/\/+$/, "");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_CONFIG.accessKeyId,
      secretAccessKey: R2_CONFIG.secretAccessKey,
    },
  });
  return { client, bucket: R2_CONFIG.bucket, publicBase };
}


export async function presignR2Put(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
  const { client, bucket } = r2Client();
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds });
}

export function r2PublicUrl(key: string): string {
  const { publicBase } = r2Client();
  return `${publicBase}/${key}`;
}

export function keyFromUrl(url: string): string | null {
  try {
    const { publicBase } = r2Client();
    if (!url.startsWith(publicBase + "/")) return null;
    return url.slice(publicBase.length + 1);
  } catch { return null; }
}

export async function deleteR2Key(key: string): Promise<void> {
  const { client, bucket } = r2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function putR2Bytes(key: string, body: Uint8Array | Blob, contentType: string): Promise<string> {
  const { client, bucket } = r2Client();
  const bytes = body instanceof Blob ? new Uint8Array(await body.arrayBuffer()) : body;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }));
  return r2PublicUrl(key);
}
