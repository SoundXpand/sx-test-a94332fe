import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";

export const Route = createFileRoute("/legal/refund")({
  component: Refund,
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy — SoundXpand" },
      { name: "description", content: "SoundXpand cancellation and refund policy for orders and services." },
      { property: "og:title", content: "Cancellation & Refund Policy — SoundXpand" },
      { property: "og:description", content: "Terms for cancellations and refunds on SoundXpand." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/refund" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/refund" }],
  }),
});

function Refund() {
  return (
    <LegalPage
      title="Cancellation & Refund Policy"
      updated="11 April 2025"
      pdfUrl="https://drive.google.com/file/d/1nflXpiS5Ku2yDDuLfbOHjg3LGt6J9zPy/view"
    >
      <h3>Introduction</h3>
      <p>This Cancellation & Refund Policy ("Policy") governs the terms and conditions for cancellations and refunds for services provided by <strong>VinylVista Pvt. Ltd.</strong>, trading as <strong>SoundXpand</strong>, a company incorporated under the Companies Act, 2013 (18 of 2013), bearing Corporate Identity Number <strong>U47620JH2024PTC022375 / U46900JH2024PTC022375</strong>, having its registered office at Hijla Road, Burudih, Hijla, Purana Dumka, Dumka, Dumka, Dumka-814101, Jharkhand, India (hereinafter referred to as "SoundXpand", "we", "our", or "us").</p>
      <p>By using our website and affiliated subdomains (collectively referred to as the "Platform"), you agree to the terms of this Policy.</p>

      <h2>1. Cancellation of Services</h2>

      <h3>1.1 User-Initiated Cancellations</h3>
      <ul>
        <li>Users may request cancellation of services (such as music distribution, content delivery, or promotional packages) within 24 hours of placing the order, provided the service has not yet commenced.</li>
        <li>Once the service has begun (e.g., content has been submitted to streaming platforms or promotional activities have started), cancellations will not be permitted.</li>
      </ul>

      <h3>1.2 SoundXpand-Initiated Cancellations</h3>
      <ul>
        <li>We reserve the right to cancel any service or order in cases of non-compliance with our terms of use, incomplete information, or suspected misuse or fraud.</li>
        <li>In such cases, we may issue a full or partial refund, at our sole discretion.</li>
      </ul>

      <h2>2. Refund Policy</h2>

      <h3>2.1 Eligibility</h3>
      <ul>
        <li>The cancellation is requested within the permitted window.</li>
        <li>There is a proven failure on our part to deliver the promised service, not due to third-party delays or force majeure.</li>
      </ul>

      <h3>2.2 Non-Refundable Services</h3>
      <p>Services such as:</p>
      <ul>
        <li>Music distribution to digital stores</li>
        <li>Platform or promotional listing fees</li>
        <li>Custom promotional or marketing campaigns</li>
        <li>Administrative/processing charges</li>
      </ul>
      <p>are non-refundable once initiated.</p>

      <h3>2.3 Refund Process</h3>
      <ul>
        <li>Eligible refunds, once approved, will be processed within 7–10 business days through the original mode of payment.</li>
        <li>In some cases, refunds may be issued as credit to the user's SoundXpand account to be used for future services.</li>
      </ul>

      <h2>3. Disputes and Resolution</h2>
      <p>If you believe you are entitled to a refund or wish to raise a dispute, please contact our support team at <a href="mailto:support@soundxpand.com">support@soundxpand.com</a> with your order ID and supporting details. We aim to resolve all such matters fairly, transparently, and in a timely manner.</p>

      <h2>4. Amendments</h2>
      <p>SoundXpand reserves the right to amend or update this Cancellation and Refund Policy at any time without prior notice. The updated policy will be available on our Platform and shall be effective immediately upon posting.</p>

      <h2>Contact Us</h2>
      <p><strong>VinylVista Pvt. Ltd. t/a SoundXpand</strong></p>
      <p>Hijla Road, Burudih, Hijla, Purana Dumka, Dumka, Dumka, Dumka-814101, Jharkhand, India</p>
      <p>Email: <a href="mailto:support@soundxpand.com">support@soundxpand.com</a></p>
      <p>Phone: <a href="tel:+918987935530">+91 89879 35530</a></p>
    </LegalPage>
  );
}
