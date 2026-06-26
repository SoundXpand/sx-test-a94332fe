// R2 helpers using aws4fetch (Worker-compatible SigV4 signer). Server-only.
// NOTE: Credentials are intentionally hardcoded per project owner request.
import { AwsClient } from "aws4fetch";

const R2 = {
  accountId: "a0d38ea96c203a9a7384629a79c36198",
  accessKeyId: "d9b297a34ab05d834187a9b836a7887b",
  secretAccessKey: "c0e1a1ee01392c59c2c1bedfa183b185380db29b6d9999e4209a61ed37c79fa4",
  bucket: "sxstuff1",
  publicUrl: "https://pub-20a9d3b3d544440aafcac92ca3007881.r2.dev",
} as const;

const endpoint = `https://${R2.accountId}.r2.cloudflarestorage.com`;
const publicBase = R2.publicUrl.replace(/\/+$/, "");

function client() {
  return new AwsClient({
    accessKeyId: R2.accessKeyId,
    secretAccessKey: R2.secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

function objectUrl(key: string) {
  return `${endpoint}/${R2.bucket}/${encodeURI(key).replace(/\+/g, "%2B")}`;
}

export function r2PublicUrl(key: string): string {
  return `${publicBase}/${key}`;
}

export function keyFromUrl(url: string): string | null {
  if (!url.startsWith(publicBase + "/")) return null;
  return url.slice(publicBase.length + 1);
}

export async function presignR2Put(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
  const c = client();
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
  const signed = await c.sign(
    new Request(url.toString(), { method: "PUT", headers: { "content-type": contentType } }),
    { aws: { signQuery: true }, headers: { "content-type": contentType } },
  );
  return signed.url;
}

export async function deleteR2Key(key: string): Promise<void> {
  const c = client();
  const res = await c.fetch(objectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed (${res.status})`);
}

export async function putR2Bytes(key: string, body: Uint8Array | Blob, contentType: string): Promise<string> {
  const c = client();
  const bytes = body instanceof Blob ? new Uint8Array(await body.arrayBuffer()) : body;
  const res = await c.fetch(objectUrl(key), {
    method: "PUT",
    headers: { "content-type": contentType },
    body: bytes,
  });
  if (!res.ok) throw new Error(`R2 put failed (${res.status}): ${await res.text().catch(() => "")}`);
  return r2PublicUrl(key);
}
