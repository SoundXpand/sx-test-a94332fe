import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";

export const Route = createFileRoute("/legal/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms and Conditions — SoundXpand" },
      { name: "description", content: "SoundXpand terms and conditions governing the use of our music distribution platform." },
      { property: "og:title", content: "Terms and Conditions — SoundXpand" },
      { property: "og:description", content: "Terms governing the use of the SoundXpand platform." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/terms" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/terms" }],
  }),
});

function Terms() {
  return (
    <LegalPage
      title="Terms and Conditions"
      updated="30 April 2024"
      pdfUrl="https://drive.google.com/file/d/1Yaz9ClMVkwK_2ALk4pLrz2oFgRcrXWer/view?usp=sharing"
    >
      <h3>Introduction</h3>
      <p>Welcome to VinylVista Pvt. Ltd. t/a SoundXpand, incorporated under the Companies Act, 2013 (18 of 2013), with Corporate Identity Number U47620JH2024PTC022375 / U46900JH2024PTC022375 and registered office at Hijla Road, Burudih, Hijla, Purana Dumka, Dumka, Dumka, Dumka-814101, Jharkhand, India providing services through its website and affiliated subdomains ("SoundXpand"). These terms and conditions outline the contractual agreement between users and SoundXpand. By accessing and utilizing our website and its subdomains, as well as any associated subsidiaries (collectively referred to as "Website" or "Services"), users acknowledge and agree to abide by the terms and conditions set forth herein.</p>

      <h3>Disclaimer</h3>
      <p>Before utilizing the services provided by SoundXpand through its Website and affiliated subdomains, users must carefully read and comprehend the following terms and conditions. The act of using the Website implies a conscious acceptance of the terms laid out herein.</p>
      <p>SoundXpand offers its Services on an "as is" basis. No representations or warranties of any kind, express or implied, are made regarding the accuracy, reliability, or suitability of the information, content, or services provided.</p>

      <h3>Governing Law</h3>
      <p>These terms and conditions are governed by the laws of India and are to be construed in accordance with them. Any disputes arising out of or in connection with these terms shall fall under the exclusive jurisdiction of the courts of India.</p>
      <p>The Privacy Policy will govern the gathering and processing of personal data.</p>

      <h3>Registration</h3>
      <p>Certain services provided by SoundXpand require user registration. Users must provide accurate and complete information during registration. They are responsible for maintaining the confidentiality of their account information and all activities conducted under their accounts.</p>

      <h3>Liability</h3>
      <p>Users explicitly acknowledge that they use the Website and its Services at their own risk. SoundXpand holds no liability for any direct, indirect, incidental, consequential, or punitive damages arising from the use of the Website or any Services offered.</p>

      <h3>Intellectual Property Rights</h3>
      <p>All intellectual property rights pertaining to SoundXpand and the Services provided on the Website are exclusively owned by SoundXpand. Users agree not to reproduce, distribute, or create derivative works from any content on the Website without express written permission.</p>

      <h3>Changes and Closure of the Website</h3>
      <p>SoundXpand reserves the right to make changes to the Website and its Services at any time without prior notice. Furthermore, SoundXpand retains the right to close the Website or any part thereof at its discretion.</p>

      <h3>Services Offered</h3>
      <p>SoundXpand is pleased to offer a diverse range of services aimed at providing musicians and content creators with a robust platform to amplify their artistic reach. Our comprehensive suite of services includes:</p>
      <ul>
        <li><strong>Music Distribution</strong> — SoundXpand simplifies the process of distributing your music across a multitude of platforms, ensuring your work is accessible to a broad and varied audience.</li>
        <li><strong>Submission Services</strong> — We've streamlined the submission process, making it effortless for artists to share their musical creations with major streaming platforms and digital stores.</li>
        <li><strong>Promotion of Music Content</strong> — Beyond distribution, our platform actively promotes your music content, maximizing its visibility and increasing the likelihood of discovery by a wider audience.</li>
        <li><strong>Audio File Format Conversion</strong> — SoundXpand provides audio file format conversion services to optimize your music for different platforms and ensure compatibility across various devices.</li>
        <li><strong>Rights Management</strong> — SoundXpand assists in managing the rights associated with your music, guiding you through the intricacies of copyright and licensing in the digital music landscape.</li>
        <li><strong>Reporting and Analytics</strong> — Our platform furnishes detailed reporting and analytics to help you monitor the performance of your music, comprehend audience engagement, and make informed decisions to elevate your digital presence.</li>
      </ul>

      <h3>Authorized Use</h3>
      <p>Users are obligated to use the Services only for lawful purposes and in strict accordance with the stipulations outlined in these terms and conditions.</p>

      <h3>Content Terms</h3>
      <p>Users bear sole responsibility for the content they submit on the Website. SoundXpand reserves the right to remove any content that violates the terms and conditions. By submitting content to SoundXpand, users grant a license for the distribution and promotion of their music through the Services. Specific terms will be outlined in individual agreements.</p>

      <h3>Sponsored Content</h3>
      <p>Sponsored content may be featured on the Website, and its inclusion does not imply endorsement by SoundXpand.</p>

      <h3>User Content and Publicity</h3>
      <p>By utilizing our Services, users grant permission for SoundXpand to provide promotional links and showcase their music and artworks on the Website.</p>

      <h3>License Agreement for Music Distribution</h3>
      <p>Users agree to a separate license agreement for the distribution of their music through SoundXpand. The specifics of these agreements will be detailed in individual contracts.</p>

      <h3>Our Proprietary Rights</h3>
      <p>SoundXpand retains all proprietary rights to the Website and its content.</p>

      <h3>Third-Party Links and Applications</h3>
      <p>The Website may include links to third-party websites and applications. SoundXpand disclaims responsibility for the content or practices of these third parties.</p>

      <h3>Indemnity</h3>
      <p>Users agree to indemnify SoundXpand against any claims, damages, and expenses arising from their use of the Website and Services.</p>

      <h3>No Warranty</h3>
      <p>The Website and its services are provided "as is" without any warranties, expressed or implied.</p>

      <h3>Limitation of Liability</h3>
      <p>SoundXpand's liability is limited to the maximum extent permitted by law.</p>

      <h3>Changes to and Termination of the Website</h3>
      <p>SoundXpand reserves the right to change, suspend, or terminate the Website or any part thereof at any time.</p>

      <h3>Term, Termination, and Suspension</h3>
      <p>These terms and conditions remain effective until terminated by either party. SoundXpand may suspend or terminate user access to the Website for violations of these terms.</p>

      <h3>Plans, Billings, and Payments</h3>
      <p>Details regarding plans, billings, and payments are outlined on the Website and are subject to change.</p>

      <h3>No Implied Licenses</h3>
      <p>These terms and conditions do not grant users any implied licenses or rights to the intellectual property of SoundXpand or its licensors.</p>

      <h3>Ownership</h3>
      <p>SoundXpand retains ownership of all its design, and source code, and all content included in any of them (including without limitation text, images, animations, databases, graphics, logos, trademarks, icons, buttons, pictures, videos, sound recordings, etc.) belong or are licensed to the Company.</p>

      <h3>General Provisions</h3>
      <p>These terms constitute the entire agreement between users and SoundXpand, superseding any prior agreements or understandings.</p>

      <h3>Changes to this Policy</h3>
      <p>SoundXpand reserves the right to modify these terms and conditions at any time. Users are responsible for regularly reviewing the terms. Continued use of the Website after changes implies acceptance of the modified terms.</p>

      <h3>General and Contact Information</h3>
      <p>For general inquiries or communication regarding these terms and conditions, users are encouraged to use the contact information provided on the Website.</p>
    </LegalPage>
  );
}
