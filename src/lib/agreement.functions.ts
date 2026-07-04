import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({
  signature_type: z.enum(["draw", "type"]),
  signature_data: z.string().min(1).max(2_000_000), // dataURL PNG for draw, name for type
  signed_name: z.string().trim().min(2).max(200),
  acknowledged: z.literal(true),
  agreement_key: z.string(),
  version: z.string(),
});

async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return (
    "0x" +
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

function base64ToBytes(b64: string): Uint8Array {
  // atob is available in Workers
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function fetchImageBytes(url: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return new Uint8Array(await r.arrayBuffer());
  } catch {
    return null;
  }
}

const LICENSEE_SIGNATURE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Example_of_a_signature.svg/320px-Example_of_a_signature.svg.png";
const LICENSEE_SIGNATURE_HASH =
  "0x8f2b5c1d9a3f4b6e7c8d0a2b1e9f4c3d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d";

const AGREEMENT_PARAGRAPHS: Array<{ heading?: string; body?: string }> = [
  { body: "This Exclusive Licensing and Distribution Agreement (the “Agreement”) is entered into between the Licensor and VinylVista Private Limited dba “SoundXpand”, an Indian Company with a Registered Address at Hijla Road, Burudih, Hijla, Purana Dumka, Dumka, Jharkhand, India – 814101 (the “Licensee”)." },
  { body: "By electing to participate in this Agreement and/or utilizing the licensing or distribution services provided by Licensee, Licensor acknowledges and agrees to adhere to the terms delineated herein. The Effective Date shall be construed as the date upon which Licensor initially elects to participate in or utilize the licensing or distribution services provided by Licensee." },
  { heading: "Basic Terms" },
  { body: "1. Grant of Rights: Licensor grants Licensee exclusive Digital Distribution rights for the Recordings; exclusive Neighboring Rights Administration, if opted; exclusive Content ID Rights; exclusive YouTube Channel Admin Services, if opted; and non-exclusive Procured Licensing Rights." },
  { body: "2. Royalty: Licensor shall receive 100% of Net Receipts from Digital Distribution and Neighboring Rights Administration; from Content ID, YouTube, and YouTube Channel Admin Services; from Procured Licensing; and from other sources of revenue." },
  { body: "3. Term: The initial Licensing Term is three (3) years from Licensee's initial commercial release of the Licensed Content, with automatic renewal for successive three (3) year periods, subject to termination as per Schedule A." },
  { body: "4. Territory: Worldwide." },
  { heading: "Schedule A — General Terms and Conditions" },
  { body: "1. Definitions and Interpretation: “Assets”, “Recordings”, “Videos”, “Digital Distribution”, “Neighboring Rights”, “Content ID”, “YouTube Channel Admin Services”, “Procured Licensing”, “Deliver/Delivery”, “Digital Services”, “Neighboring Rights Royalties”, “Net Receipts”, “Recoupable Costs”, “Site(s)”, “The SoundXpand Network”, “Licensed Content”, “Licensed Territory” and “Licensing Terms” have the meanings given them by industry convention and by the Basic Terms above." },
  { body: "2. Grant of Rights: Licensor irrevocably grants Licensee exclusive, sub-licensable rights throughout the Licensed Territory for the Licensing Terms to convert, digitize, encode, integrate, reproduce, and digitally distribute the Recordings, Videos and Assets across Digital Services; to transmit, license, sell, advertise, publish, publicly perform, broadcast and otherwise exploit the Licensed Content; to act as Licensor's ISRC manager; to stream preview clips for promotional purposes; to administer third-party audio/audiovisual content that synchronizes with the Licensed Content via Content ID; to use approved artist materials for promotion; to exploit the musical compositions for distribution/monetization; to license synchronization uses; to administer, collect and exploit rights to Licensed Content uploaded to YouTube channels, and if opted, include the channel in The SoundXpand Network." },
  { body: "3. Restrictions: Licensor shall not transfer, sub-license, or assign the rights granted without prior written consent; distribute or exploit the Licensed Content outside the scope of this Agreement; or use any Licensed Content or Artist image to endorse third-party recordings, products, services, or brands." },
  { body: "4. Assignment: Neither party shall assign or transfer its rights or obligations under this Agreement without the prior written consent of the other party, except to a successor in interest by merger, acquisition, or sale of substantially all Assets." },
  { body: "5. Obligations: Licensee shall collect revenue and royalties, edit metadata for accuracy, make available preview clips, distribute the Licensed Content digitally, and provide quarterly reporting. Licensor shall provide accurate metadata, notify Licensee of third-party claims, comply with Digital Services rules, deliver Recordings, Videos and Assets under Licensee's Delivery Specifications, and furnish input materials as reasonably required." },
  { body: "6. Accounting: Licensee provides quarterly accounting statements. Licensor's share of Net Receipts encompasses publishing, mechanical royalties, and other compensations unless disbursed directly by Digital Services. Payments via Bank Transfer, PayPal or other Licensee-designated method, subject to third-party fees. Licensor must raise objections within one (1) year of receipt. Licensee may freeze/withhold revenues related to content deemed to violate this Agreement, with written notice." },
  { body: "7. Change Control: Any changes or modifications to this Agreement shall be made in writing and signed by both parties." },
  { body: "8. Confidentiality: The terms of this Agreement are confidential. Disclosure may only occur if required by law, in which case Licensor must notify Licensee at least seven (7) days in advance." },
  { body: "9. Warranties and Indemnity: Licensor warrants legal capacity, age of majority (or guardian consent), ownership of or rights to the Recordings/Videos/Assets, non-conflict with third-party grants, sole responsibility for third-party royalties, and non-infringement. Licensor indemnifies Licensee and its affiliates from third-party claims arising from any breach. Licensee's aggregate liability shall not exceed amounts paid to Licensor in the preceding twelve (12) months; no indirect, consequential, or punitive damages." },
  { body: "10. Termination: Licensor may terminate with ninety (90) days prior written notice. Licensee has a thirty (30) day window to request takedown from Digital Services. Licensee may terminate at any time for infringement, breach, offensive content, harm to reputation, or otherwise in its sole discretion; upon termination for cause, Licensor shall immediately pay any unrecouped Recoupable Costs. Sections 6(c), 8, 9, 10(a), 10(c) and 11 survive termination." },
  { body: "11. Miscellaneous: The parties are independent contractors. Licensor agrees to the Site Agreements and Digital Services Agreements. Notices in writing via electronic mail; notices to Licensee at support@soundxpand.com. Severability, waiver, cumulative remedies, force majeure (with three (3) month termination right), no third-party beneficiaries under the Indian Contract Act, 1872. Governed by the laws of the Republic of India; non-exclusive jurisdiction of the Civil Court in Dumka. Disputes resolved by arbitration under the Indian Arbitration and Conciliation Act, 1996, seated in Dumka, Jharkhand, in English or Hindi. This Agreement may be executed via physical signatures, digital or electronic signatures, or by clicking “I agree”." },
  { body: "Licensor understands that the General Terms and Conditions contain a binding arbitration provision (Section 11) which includes Indian law as governing law and waiver of jury trials and class actions. By signing below, Licensor expressly consents to such arbitration provision." },
  { body: "IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date first above written." },
];

async function buildAgreementPdf(opts: {
  fullName: string;
  effectiveDate: string;
  licensorHash: string;
  licenseeHash: string;
  signatureImage?: Uint8Array | null;
  licenseeSignatureImage?: Uint8Array | null;
  agreementKey: string;
  version: string;
  signedAtIso: string;
  signatureType: "draw" | "type";
  contact: {
    username?: string | null;
    email?: string | null;
    mobile?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
  };
}): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 13;
  const size = 10;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawHeader = (p: any) => {
    // Top hash strip on every page
    p.drawRectangle({
      x: 0,
      y: pageHeight - 22,
      width: pageWidth,
      height: 22,
      color: rgb(0.96, 0.96, 0.97),
    });
    p.drawText(`Licensee: ${opts.licenseeHash.slice(0, 22)}...${opts.licenseeHash.slice(-6)}`, {
      x: margin,
      y: pageHeight - 15,
      size: 7,
      font,
      color: rgb(0.25, 0.25, 0.28),
    });
    p.drawText(`Licensor: ${opts.licensorHash.slice(0, 22)}...${opts.licensorHash.slice(-6)}`, {
      x: pageWidth / 2,
      y: pageHeight - 15,
      size: 7,
      font,
      color: rgb(0.25, 0.25, 0.28),
    });
  };

  const drawFooter = (p: any, pageNum: number, totalHint?: number) => {
    p.drawText(
      `SoundXpand · Agreement ${opts.agreementKey} · v${opts.version} · Signed ${opts.signedAtIso}`,
      { x: margin, y: 24, size: 7, font, color: rgb(0.4, 0.4, 0.45) },
    );
    p.drawText(totalHint ? `Page ${pageNum} of ${totalHint}` : `Page ${pageNum}`, {
      x: pageWidth - margin - 60,
      y: 24,
      size: 7,
      font,
      color: rgb(0.4, 0.4, 0.45),
    });
  };

  drawHeader(page);
  y = pageHeight - 42;

  const ensureSpace = (need: number) => {
    if (y - need < margin + 30) {
      drawFooter(page, doc.getPageCount());
      page = doc.addPage([pageWidth, pageHeight]);
      drawHeader(page);
      y = pageHeight - 42;
    }
  };

  const wrap = (text: string, maxWidth: number, fnt: any, fntSize: number) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (fnt.widthOfTextAtSize(test, fntSize) > maxWidth) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const drawParagraph = (text: string, opts2?: { bold?: boolean; sizeOverride?: number; center?: boolean }) => {
    const fnt = opts2?.bold ? fontBold : font;
    const s = opts2?.sizeOverride ?? size;
    const lines = wrap(text, contentWidth, fnt, s);
    for (const ln of lines) {
      ensureSpace(lineHeight);
      const x = opts2?.center
        ? (pageWidth - fnt.widthOfTextAtSize(ln, s)) / 2
        : margin;
      page.drawText(ln, { x, y, size: s, font: fnt, color: rgb(0.1, 0.1, 0.12) });
      y -= lineHeight;
    }
    y -= 4;
  };

  // Title
  drawParagraph("Exclusive Licensing And Distribution Agreement", {
    bold: true,
    sizeOverride: 14,
    center: true,
  });
  y -= 6;

  drawParagraph(
    `Effective Date: ${opts.effectiveDate}    Licensor: ${opts.fullName}    Agreement: ${opts.agreementKey} v${opts.version}`,
    { sizeOverride: 9 },
  );
  y -= 4;

  // Parties intro with Licensor address
  const addressLine = [opts.contact.address, opts.contact.city, opts.contact.country]
    .filter(Boolean)
    .join(", ");
  drawParagraph(
    `This Agreement is entered into between ${opts.fullName}${
      addressLine ? ` of ${addressLine}` : ""
    } (the “Licensor”) and VinylVista Private Limited dba “SoundXpand”, an Indian Company with a Registered Address at Hijla Road, Burudih, Hijla, Purana Dumka, Dumka, Jharkhand, India – 814101 (the “Licensee”).`,
  );

  // Licensor contact block
  drawParagraph("Licensor contact details", { bold: true, sizeOverride: 10 });
  if (opts.contact.username) drawParagraph(`Account username: ${opts.contact.username}`, { sizeOverride: 9 });
  if (opts.contact.email) drawParagraph(`Email: ${opts.contact.email}`, { sizeOverride: 9 });
  if (opts.contact.mobile) drawParagraph(`Phone: ${opts.contact.mobile}`, { sizeOverride: 9 });
  if (opts.contact.city) drawParagraph(`City: ${opts.contact.city}`, { sizeOverride: 9 });
  if (opts.contact.country) drawParagraph(`Country: ${opts.contact.country}`, { sizeOverride: 9 });
  y -= 4;

  for (const block of AGREEMENT_PARAGRAPHS) {
    if (block.heading) {
      y -= 6;
      drawParagraph(block.heading, { bold: true, sizeOverride: 11, center: true });
    }
    if (block.body) drawParagraph(block.body);
  }

  // Signature block
  ensureSpace(180);
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.75),
  });
  y -= 18;

  const colW = contentWidth / 2 - 10;
  const colLeftX = margin;
  const colRightX = margin + contentWidth / 2 + 10;
  const sigTop = y;
  const sigBoxH = 60;

  page.drawText("LICENSOR", {
    x: colLeftX,
    y: sigTop,
    size: 8,
    font: fontBold,
    color: rgb(0.35, 0.35, 0.38),
  });
  page.drawText("LICENSEE", {
    x: colRightX,
    y: sigTop,
    size: 8,
    font: fontBold,
    color: rgb(0.35, 0.35, 0.38),
  });

  // Licensor signature
  if (opts.signatureImage) {
    try {
      const img = await doc.embedPng(opts.signatureImage);
      const scale = Math.min(colW / img.width, sigBoxH / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, {
        x: colLeftX,
        y: sigTop - 10 - h,
        width: w,
        height: h,
      });
    } catch {
      page.drawText(opts.fullName, {
        x: colLeftX,
        y: sigTop - 40,
        size: 22,
        font: fontOblique,
        color: rgb(0.1, 0.1, 0.15),
      });
    }
  } else {
    page.drawText(opts.fullName, {
      x: colLeftX,
      y: sigTop - 40,
      size: 22,
      font: fontOblique,
      color: rgb(0.1, 0.1, 0.15),
    });
  }

  // Licensee signature (Sahil Hansda)
  if (opts.licenseeSignatureImage) {
    try {
      const img = await doc.embedPng(opts.licenseeSignatureImage);
      const scale = Math.min(colW / img.width, sigBoxH / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, {
        x: colRightX,
        y: sigTop - 10 - h,
        width: w,
        height: h,
      });
    } catch {
      page.drawText("Sahil Hansda", {
        x: colRightX,
        y: sigTop - 40,
        size: 22,
        font: fontOblique,
        color: rgb(0.1, 0.1, 0.15),
      });
    }
  }

  y = sigTop - sigBoxH - 20;
  page.drawText(opts.fullName, { x: colLeftX, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText("Sahil Hansda, Director", { x: colRightX, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  y -= 12;
  page.drawText("Licensor", { x: colLeftX, y, size: 8, font, color: rgb(0.4, 0.4, 0.45) });
  page.drawText("For and on behalf of SoundXpand", {
    x: colRightX,
    y,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.45),
  });
  y -= 20;
  page.drawText(
    `Signed via ${opts.signatureType === "draw" ? "drawn signature" : "typed signature"} on ${opts.signedAtIso}`,
    { x: margin, y, size: 8, font, color: rgb(0.4, 0.4, 0.45) },
  );

  const total = doc.getPageCount();
  // Redraw footers with total
  for (let i = 0; i < total; i++) {
    const p = doc.getPage(i);
    // clear no-op; just redraw footer with total
    drawFooter(p, i + 1, total);
  }

  return await doc.save();
}

async function uploadToR2(bytes: Uint8Array, key: string): Promise<string> {
  const { AwsClient } = await import("aws4fetch");
  const accountId = process.env.R2_ACCOUNT_ID!;
  const bucket = process.env.R2_BUCKET!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  const publicBase = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
  const res = await client.fetch(endpoint, {
    method: "PUT",
    body: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    headers: { "Content-Type": "application/pdf" },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`R2 upload failed: ${res.status} ${t.slice(0, 200)}`);
  }
  return publicBase ? `${publicBase}/${key}` : endpoint;
}

export const signAgreement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase, claims } = context as any;
    const signedAt = new Date();
    const signedAtIso = signedAt.toISOString();
    const effectiveDate = signedAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Compute licensor hash
    const hashPayload = [
      userId,
      data.agreement_key,
      data.version,
      data.signed_name,
      data.signature_type,
      data.signature_type === "draw" ? data.signature_data.slice(0, 512) : data.signed_name,
      signedAtIso,
    ].join("|");
    const licensor_hash = await sha256Hex(hashPayload);

    // Decode signature dataURL
    let signatureImage: Uint8Array | null = null;
    if (data.signature_type === "draw") {
      const m = /^data:image\/png;base64,(.+)$/.exec(data.signature_data);
      if (m) signatureImage = base64ToBytes(m[1]);
    }
    const licenseeSignatureImage = await fetchImageBytes(LICENSEE_SIGNATURE_URL);

    // Fetch licensor profile for contact details
    const { data: profile } = await supabase
      .from("profiles")
      .select("username,email,mobile,city,country,full_name")
      .eq("user_id", userId)
      .maybeSingle();

    const pdfBytes = await buildAgreementPdf({
      fullName: data.signed_name,
      effectiveDate,
      licensorHash: licensor_hash,
      licenseeHash: LICENSEE_SIGNATURE_HASH,
      signatureImage,
      licenseeSignatureImage,
      agreementKey: data.agreement_key,
      version: data.version,
      signedAtIso,
      signatureType: data.signature_type,
      contact: {
        username: (profile as any)?.username ?? null,
        email: (profile as any)?.email ?? null,
        mobile: (profile as any)?.mobile ?? null,
        address: null,
        city: (profile as any)?.city ?? null,
        country: (profile as any)?.country ?? null,
      },
    });

    const key = `agreements/${data.agreement_key}/${data.version}/${userId}/${signedAt
      .getTime()}.pdf`;
    const pdf_url = await uploadToR2(pdfBytes, key);

    const ip =
      (claims && (claims["x-forwarded-for"] as string)) ||
      undefined;

    const { error, data: inserted } = await supabase
      .from("user_agreements")
      .insert({
        user_id: userId,
        agreement_key: data.agreement_key,
        version: data.version,
        signature_type: data.signature_type,
        signature_data: data.signature_type === "draw" ? data.signature_data : data.signed_name,
        signed_name: data.signed_name,
        acknowledged: true,
        licensor_hash,
        licensee_hash: LICENSEE_SIGNATURE_HASH,
        ip: ip ?? null,
        user_agent: null,
        signed_at: signedAtIso,
        pdf_url,
      })
      .select("id, signed_at, pdf_url, licensor_hash")
      .single();

    if (error) throw new Error(error.message);
    return inserted as {
      id: string;
      signed_at: string;
      pdf_url: string;
      licensor_hash: string;
    };
  });
