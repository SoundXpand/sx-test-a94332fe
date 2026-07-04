export const AGREEMENT_KEY = "sx-exclusive-licensing";
export const AGREEMENT_VERSION = "2026.07.04";

// Fixed licensee (SoundXpand / Sahil Hansda) signature hash — stable, precomputed.
export const LICENSEE_SIGNATURE_HASH =
  "0x8f2b5c1d9a3f4b6e7c8d0a2b1e9f4c3d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d";
export const LICENSEE_SIGNED_AT = "2024-01-15T00:00:00Z";

// Stock signature image used as Sahil Hansda's placeholder signature.
export const LICENSEE_SIGNATURE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Example_of_a_signature.svg/320px-Example_of_a_signature.svg.png";

export function LicenseeSignedBadge({ licensorHash }: { licensorHash?: string | null }) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-muted/60 backdrop-blur px-4 py-2 text-[10px] font-mono text-muted-foreground">
      <span>
        <span className="text-foreground/70 font-sans font-medium mr-1">Licensee hash:</span>
        {LICENSEE_SIGNATURE_HASH.slice(0, 18)}…{LICENSEE_SIGNATURE_HASH.slice(-6)}
      </span>
      <span className="text-emerald-500">✓ Pre-signed · Sahil Hansda, Director</span>
      {licensorHash ? (
        <span className="ml-auto">
          <span className="text-foreground/70 font-sans font-medium mr-1">Licensor hash:</span>
          {licensorHash.slice(0, 18)}…{licensorHash.slice(-6)}
        </span>
      ) : (
        <span className="ml-auto text-amber-500 font-sans font-medium">Licensor hash: pending signature</span>
      )}
    </div>
  );
}

export type LicensorProfile = {
  fullName: string;
  username?: string | null;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

export function AgreementBody({
  fullName,
  signatureImage,
  profile,
}: {
  fullName: string;
  signatureImage?: string | null;
  profile?: LicensorProfile;
}) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const addressParts = [profile?.address, profile?.city, profile?.country].filter(Boolean);
  const addressLine = addressParts.join(", ");
  return (
    <div className="space-y-4 px-6 py-6 text-[13px] leading-relaxed text-foreground/90">
      <h3 className="text-center text-lg font-semibold text-foreground">
        Exclusive Licensing And Distribution Agreement
      </h3>
      <p>
        This agreement (the “Agreement”) is made as of <strong>{today}</strong> (the “Effective Date”)
        by and between: <strong>{fullName || "[Licensor Full Name]"}</strong>
        {addressLine ? <> of <strong>{addressLine}</strong></> : null}{" "}
        (hereinafter referred to as the “Licensor”) and{" "}
        <strong>VinylVista Private Limited dba “SoundXpand”</strong>, an Indian Company with a
        Registered Address at Hijla Road, Burudih, Hijla, Purana Dumka, Dumka, Jharkhand, India –
        814101 (hereinafter referred to as the “Licensee”).
      </p>
      {(profile?.email || profile?.mobile || profile?.username || addressLine) && (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-[12px] space-y-1">
          <p className="font-semibold text-foreground">Licensor contact details</p>
          {profile?.username && (
            <p><span className="text-muted-foreground">Account username:</span>{" "}
              <span className="font-mono">{profile.username}</span></p>
          )}
          {profile?.email && (
            <p><span className="text-muted-foreground">Email:</span> {profile.email}</p>
          )}
          {profile?.mobile && (
            <p><span className="text-muted-foreground">Phone:</span> {profile.mobile}</p>
          )}
          {profile?.city && (
            <p><span className="text-muted-foreground">City:</span> {profile.city}</p>
          )}
          {profile?.country && (
            <p><span className="text-muted-foreground">Country:</span> {profile.country}</p>
          )}
        </div>
      )}
      <p>
        Capitalized terms not explicitly defined within the basic terms and conditions outlined
        below (“Basic Terms”) shall be construed according to the definitions provided in the
        general terms and conditions appended hereto as Schedule A (“General Terms and Conditions”).
      </p>
      <p className="font-semibold">
        By electing to participate in this Agreement and/or utilizing the licensing or distribution
        services provided by Licensee, Licensor acknowledges and agrees to adhere to the terms
        delineated herein. Should Licensor decline to accept this Agreement in its entirety, refrain
        from consenting and/or signing this Agreement, and abstain from availing Licensor's of the
        licensing or distribution services offered by Licensee.
      </p>

      <h4 className="text-center font-semibold pt-2">Basic Terms</h4>
      <ol className="list-decimal pl-5 space-y-3">
        <li>
          <strong>Grant of Rights</strong>: The Licensor grants Licensee the following exclusive
          rights in accordance with the General Terms and Conditions:
          <ol className="list-[lower-alpha] pl-5 mt-1 space-y-0.5">
            <li>exclusive Digital Distribution rights for the Recordings;</li>
            <li>exclusive Neighboring Rights Administration, if opted;</li>
            <li>exclusive Content ID Rights;</li>
            <li>exclusive YouTube Channel Admin Services, if opted;</li>
            <li>non-exclusive Procured Licensing Rights.</li>
          </ol>
        </li>
        <li>
          <strong>Royalty</strong>: Licensor shall receive:
          <ol className="list-[lower-alpha] pl-5 mt-1 space-y-0.5">
            <li>100% of Net Receipts from Digital Distribution and Neighboring Rights Administration;</li>
            <li>100% of Net Receipts from Content ID, YouTube, and YouTube Channel Admin Services;</li>
            <li>100% of Net Receipts from Procured Licensing;</li>
            <li>100% of Net Receipts from other sources of revenue.</li>
          </ol>
        </li>
        <li>
          <strong>Term</strong>: Initial Licensing Term of three (3) years from commercial release,
          with automatic renewal for successive three (3) year periods subject to Schedule A.
        </li>
        <li>
          <strong>Territory</strong>: Worldwide.
        </li>
      </ol>

      <h4 className="text-center font-semibold pt-2">Schedule A — General Terms and Conditions</h4>
      <ol className="list-decimal pl-5 space-y-3">
        <li>
          <strong>Definitions and Interpretation</strong>: “Assets”, “Recordings”, “Videos”,
          “Digital Distribution”, “Neighboring Rights”, “Content ID”, “YouTube Channel Admin
          Services”, “Procured Licensing”, “Deliver/Delivery”, “Digital Services”, “Neighboring
          Rights Royalties”, “Net Receipts”, “Recoupable Costs”, “Site(s)”, “The SoundXpand
          Network”, “Licensed Content”, “Licensed Territory” and “Licensing Terms” have the meanings
          given them by industry convention and by the Basic Terms above.
        </li>
        <li>
          <strong>Grant of Rights</strong>: Licensor irrevocably grants Licensee exclusive,
          sub-licensable rights throughout the Licensed Territory for the Licensing Terms to
          convert, digitize, encode, integrate, reproduce, and digitally distribute the Recordings,
          Videos and Assets; to transmit, license, publish, publicly perform, broadcast and
          otherwise exploit the Licensed Content; to act as ISRC manager; to stream preview clips
          for promotion; to administer third-party audio/audiovisual content that syncs with the
          Licensed Content via Content ID; to use approved artist materials for promotion; to
          exploit the musical compositions for distribution/monetization; to license synchronization
          uses; to administer, collect and exploit rights to Licensed Content uploaded to YouTube
          channels (and if opted, include the channel in The SoundXpand Network); and to resolve
          copyright disputes at Licensee's reasonable discretion.
        </li>
        <li>
          <strong>Restrictions</strong>: Licensor shall not transfer, sub-license, or assign the
          rights without prior written consent; distribute or exploit Licensed Content outside this
          Agreement; or use any Licensed Content or Artist image to endorse third-party products.
        </li>
        <li>
          <strong>Assignment</strong>: Neither party shall assign or transfer rights or obligations
          without prior written consent, except to a successor in interest by merger, acquisition,
          or sale of substantially all Assets.
        </li>
        <li>
          <strong>Obligations</strong>: Licensee collects revenue and royalties, edits metadata for
          accuracy, distributes Licensed Content digitally, and provides quarterly reporting.
          Licensor provides accurate metadata, notifies Licensee of third-party claims, complies
          with Digital Services rules, and delivers Recordings/Videos/Assets to specification.
        </li>
        <li>
          <strong>Accounting</strong>: Licensee provides quarterly accounting statements. Licensor's
          share of Net Receipts encompasses publishing, mechanical royalties, and other
          compensations unless disbursed directly by Digital Services. Payments via Bank Transfer,
          PayPal or other Licensee-designated method. Licensor must raise objections within one (1)
          year of receipt. Licensee may freeze/withhold revenues related to content deemed to
          violate this Agreement, with written notice.
        </li>
        <li>
          <strong>Change Control</strong>: Any changes must be made in writing and signed by both parties.
        </li>
        <li>
          <strong>Confidentiality</strong>: Terms are confidential. Any disclosure required by law
          requires seven (7) days prior notice to Licensee.
        </li>
        <li>
          <strong>Warranties and Indemnity</strong>: Licensor warrants legal capacity, ownership of
          or rights to the Recordings/Videos/Assets, non-conflict with third-party grants, sole
          responsibility for third-party royalties, and non-infringement. Licensor indemnifies
          Licensee from third-party claims. Licensee's aggregate liability shall not exceed amounts
          paid to Licensor in the preceding twelve (12) months; no indirect, consequential, or
          punitive damages.
        </li>
        <li>
          <strong>Termination</strong>: Licensor may terminate with ninety (90) days prior written
          notice, effective end of the current period. Licensee may terminate at any time for
          infringement, breach, offensive content, harm to reputation, or otherwise in its sole
          discretion. Sections 6(c), 8, 9, 10(a), 10(c) and 11 survive termination.
        </li>
        <li>
          <strong>Miscellaneous</strong>: Parties are independent contractors. Notices in writing
          via electronic mail; notices to Licensee at support@soundxpand.com. Governed by the laws
          of the Republic of India; non-exclusive jurisdiction of the Civil Court in Dumka.
          Disputes resolved by arbitration under the Indian Arbitration and Conciliation Act, 1996,
          seated in Dumka, Jharkhand, in English or Hindi. This Agreement may be executed via
          physical or electronic signatures, or by clicking “I agree”.
        </li>
      </ol>

      <p className="font-semibold pt-2">
        Licensor understands that the General Terms and Conditions contain a binding arbitration
        provision (Section 11) which includes Indian law as governing law and waiver of jury trials
        and class actions. By signing below, Licensor expressly consents to such arbitration
        provision.
      </p>
      <p>
        IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective
        Date first above written.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Licensor</p>
          <div className="h-16 flex items-end">
            {signatureImage ? (
              <img
                src={signatureImage}
                alt="Licensor signature"
                className="max-h-16 object-contain bg-white rounded px-2 py-1 border border-border"
              />
            ) : fullName ? (
              <p
                className="text-3xl text-foreground"
                style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive" }}
              >
                {fullName}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sign below to add your signature here</p>
            )}
          </div>
          <p className="text-sm font-medium mt-1">{fullName || "—"}</p>
          <p className="text-[11px] text-muted-foreground">Licensor</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Licensee</p>
          <div className="h-16 flex items-end">
            <img
              src={LICENSEE_SIGNATURE_URL}
              alt="Sahil Hansda signature"
              className="max-h-16 object-contain bg-white rounded px-2 py-1 border border-border"
            />
          </div>
          <p className="text-sm font-medium mt-1">Sahil Hansda, Director</p>
          <p className="text-[11px] text-muted-foreground">
            For and on behalf of SoundXpand (VinylVista Private Limited)
          </p>
        </div>
      </div>
    </div>
  );
}
