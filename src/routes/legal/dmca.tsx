import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";

export const Route = createFileRoute("/legal/dmca")({
  component: Dmca,
  head: () => ({
    meta: [
      { title: "DMCA Policy — SoundXpand" },
      { name: "description", content: "SoundXpand DMCA policy for reporting and responding to copyright infringement." },
      { property: "og:title", content: "DMCA Policy — SoundXpand" },
      { property: "og:description", content: "How SoundXpand handles copyright infringement notices." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/dmca" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/dmca" }],
  }),
});

function Dmca() {
  return (
    <LegalPage
      title="DMCA Policy"
      updated="20 February 2024"
      pdfUrl="https://drive.google.com/file/d/1YuJC3XXPBlNn94frxaO4f30O0SMNZAcG/view?usp=sharing"
    >
      <h3>Introduction</h3>
      <p>At SoundXpand, we take copyright infringement seriously to maintain a fair and respectful environment for all creators. Our Digital Millennium Copyright Act (DMCA) Policy outlines our procedures for addressing copyright infringement claims and protecting the rights of intellectual property owners.</p>

      <h3>Reporting Copyright Infringement</h3>
      <p>If you believe that your copyrighted work has been used or shared on SoundXpand's website or affiliated subdomains without your authorization, please promptly notify us by submitting a formal DMCA notice to our designated agent. Your notification must include the following information:</p>
      <ul>
        <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works are covered by a single notification, a representative list of such works.</li>
        <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit SoundXpand to locate the material.</li>
        <li>Information reasonably sufficient to permit SoundXpand to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address at which the complaining party may be contacted.</li>
        <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
        <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
      </ul>
      <p>Please send your DMCA notice to:</p>
      <p>
        <strong>SoundXpand</strong><br />
        Attn: Copyright Agent<br />
        <a href="mailto:support@soundxpand.com">support@soundxpand.com</a>
      </p>

      <h3>Response to DMCA Notices</h3>
      <p>Upon receiving a valid DMCA notice, SoundXpand will promptly investigate the reported infringement. If the reported content is found to infringe upon copyright, SoundXpand will take appropriate action, which may include:</p>
      <ul>
        <li>Removing or disabling access to the infringing content.</li>
        <li>Suspending or terminating the account of the infringing user.</li>
        <li>Blocking access to the infringing material.</li>
        <li>Freezing any earnings, royalties, outstanding amounts, or revenue of the infringing user.</li>
      </ul>

      <h3>Counter-Notification Process</h3>
      <p>If you believe that your content was mistakenly identified as infringing, or if you have authorization from the copyright owner, you may submit a counter-notification. Your counter-notification must include:</p>
      <ul>
        <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access to it was disabled.</li>
        <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.</li>
        <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or the district courts located in Dumka, Jharkhand, if your address is outside of the United States), and that you will accept service of process from the person who provided the DMCA notice or an agent of such person.</li>
      </ul>

      <h3>Repeat Infringer Policy</h3>
      <p>SoundXpand reserves the right to suspend or terminate the accounts of users who repeatedly infringe upon copyright.</p>

      <h3>Modifications to the DMCA Policy</h3>
      <p>SoundXpand may update or modify this DMCA Policy from time to time. Any changes will be effective immediately upon posting the revised policy on our website.</p>
      <p>By using SoundXpand's services, you agree to comply with this DMCA Policy and acknowledge that failure to do so may result in the removal of infringing content, termination of your account, and other appropriate actions as outlined herein.</p>

      <h3>Contact Us</h3>
      <p>If you have any questions or concerns about our DMCA Policy, please contact us at <a href="mailto:support@soundxpand.com">support@soundxpand.com</a>.</p>
    </LegalPage>
  );
}
