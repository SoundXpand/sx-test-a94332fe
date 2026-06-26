// R2 (S3-compatible) client + helpers. Server-only.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function r2Client(): { client: S3Client; bucket: string; publicBase: string } {
  const accountId = env("R2_ACCOUNT_ID");
  const bucket = env("R2_BUCKET");
  const publicBase = env("R2_PUBLIC_URL").replace(/\/+$/, "");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
  return { client, bucket, publicBase };
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
