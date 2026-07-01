import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";

export const Route = createFileRoute("/legal/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — SoundXpand" },
      { name: "description", content: "How SoundXpand collects, uses, and safeguards your personal data." },
      { property: "og:title", content: "Privacy Policy — SoundXpand" },
      { property: "og:description", content: "How SoundXpand handles your personal data." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/privacy" }],
  }),
});

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="26 February 2023"
      pdfUrl="https://drive.google.com/file/d/1NnHZ3qJcUzV0cq10PxCFOUWb1a_tKyA6/view?usp=sharing"
    >
      <h3>Introduction</h3>
      <p>At SoundXpand, we are committed to protecting the privacy and security of our users' personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our website and affiliated services.</p>

      <h3>Information We Collect</h3>
      <p><strong>a. Information You Provide</strong> — When you register an account, make purchases, or interact with our services, you may provide us with personal information such as your name, email address, billing information, and other details.</p>
      <p><strong>b. Automatically Collected Information</strong> — We may automatically collect certain information about your device, browsing actions, and patterns, including your IP address, browser type, operating system, referring URLs, and other usage details.</p>
      <p><strong>c. Cookies and Similar Technologies</strong> — We may use cookies, web beacons, and similar tracking technologies to enhance your experience, analyze trends, and gather information about how you navigate our website.</p>

      <h3>Use of Information</h3>
      <p>We may use the information we collect for various purposes, including to:</p>
      <ul>
        <li>Provide and maintain our services.</li>
        <li>Process transactions and fulfill orders.</li>
        <li>Communicate with you about your account and updates.</li>
        <li>Personalize your experience and tailor content.</li>
        <li>Improve our website, products, and services.</li>
        <li>Respond to your inquiries and provide support.</li>
        <li>Enforce our policies and terms of service.</li>
      </ul>

      <h3>Disclosure of Information</h3>
      <p>We may disclose your information to third parties for certain purposes, including to:</p>
      <ul>
        <li>Service providers who assist us in operating our website and delivering services.</li>
        <li>Payment processors to facilitate transactions.</li>
        <li>Law enforcement or regulatory authorities in response to legal requests or to protect our rights.</li>
      </ul>

      <h3>Data Security</h3>
      <p>We employ industry-standard security measures to safeguard your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.</p>

      <h3>Third-Party Links</h3>
      <p>Our website may contain links to third-party websites or services that are not operated or controlled by SoundXpand. This Privacy Policy applies solely to information collected by SoundXpand, and we are not responsible for the privacy practices of third parties.</p>

      <h3>Content and Ads</h3>
      <p>Please note that our website and services may contain explicit content and advertisements. While we strive to ensure a safe and appropriate browsing experience, users should exercise caution and discretion when accessing such content.</p>

      <h3>Your Choices</h3>
      <p>You have the right to access, update, or delete your personal information. You may also opt-out of certain communications or cookies by adjusting your browser settings or contacting us directly.</p>

      <h3>Changes to this Privacy Policy</h3>
      <p>We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised policy on our website.</p>

      <h3>Contact Us</h3>
      <p>If you have any questions or concerns about our Privacy Policy, please contact us at <a href="mailto:support@soundxpand.com">support@soundxpand.com</a>.</p>
    </LegalPage>
  );
}
