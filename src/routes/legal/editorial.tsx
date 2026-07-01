import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";

export const Route = createFileRoute("/legal/editorial")({
  component: Editorial,
  head: () => ({
    meta: [
      { title: "Editorial Policy — SoundXpand" },
      { name: "description", content: "SoundXpand editorial guidelines for metadata, audio, artwork, and content quality." },
      { property: "og:title", content: "Editorial Policy — SoundXpand" },
      { property: "og:description", content: "SoundXpand editorial guidelines and quality standards." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/editorial" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/editorial" }],
  }),
});

function Editorial() {
  return (
    <LegalPage title="Editorial Policy" updated="21 May 2024">
      <h3>Commitment to Quality</h3>
      <p>SoundXpand is dedicated to supporting original, high-quality music and ensuring all distributed products meet stringent standards for metadata, audio, and artwork. Our partners are required to uphold these principles to enhance the listener experience.</p>

      <h3>Metadata and Compliance</h3>
      <p>Accurate and compliant metadata is essential for proper representation of artists and tracks. SoundXpand reserves the right to reject or remove submissions that do not meet these standards.</p>

      <h3>Prohibited Content</h3>
      <ul>
        <li>Misleading content</li>
        <li>Sound-alike artists or performers</li>
        <li>Unauthorized public domain content</li>
        <li>Content with legal or rights issues</li>
      </ul>

      <h3>Artificial Streaming</h3>
      <p>SoundXpand actively monitors for artificial streaming or fraudulent activities. Content found to be involved in such practices will be removed, and accounts may be penalized or terminated.</p>

      <h3>Policy Updates</h3>
      <p>This policy is subject to periodic review and updates to align with evolving industry standards. By using SoundXpand's services, partners agree to comply with this editorial policy.</p>

      <h3>Contact Us</h3>
      <p>For questions or additional information about this Editorial Policy, please contact us at <a href="mailto:support@soundxpand.com">support@soundxpand.com</a>.</p>
    </LegalPage>
  );
}
