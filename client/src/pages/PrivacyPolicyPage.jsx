import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: August 2026</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              AuraEstates Pty Ltd ("AuraEstates", "we", "our", or "us") is committed to protecting your personal information in
              accordance with the <strong className="text-amber-400">Australian Privacy Act 1988 (Cth)</strong> and the Australian
              Privacy Principles (APPs). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal
              information when you use our platform at <span className="text-amber-400">auraestates.com.au</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Account Data:</strong> Name, email address, phone number, role, and profile avatar.</li>
              <li><strong className="text-slate-200">Property Activity:</strong> Saved wishlists, booking history, offers submitted, and inspection requests.</li>
              <li><strong className="text-slate-200">Payment Data:</strong> Transaction identifiers processed securely via Stripe. We do not store raw card numbers.</li>
              <li><strong className="text-slate-200">Usage Data:</strong> Pages visited, search queries, browser type, IP address, and device identifiers.</li>
              <li><strong className="text-slate-200">Communications:</strong> Messages sent through the expert connection or AI concierge features.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>To provide and improve the AuraEstates platform and services.</li>
              <li>To process property bookings, offers, and payment transactions.</li>
              <li>To personalise your property recommendations using AI-assisted matching.</li>
              <li>To communicate platform updates, inspection confirmations, and offer status notifications.</li>
              <li>To comply with legal obligations under Australian law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Disclosure of Information</h2>
            <p className="text-slate-400">
              We do not sell your personal information to third parties. We may share your data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Real estate agents and agencies on our platform, strictly for property transaction purposes.</li>
              <li>Payment processors (Stripe) operating under PCI DSS compliance standards.</li>
              <li>Cloud infrastructure providers (MongoDB Atlas, Vercel, Render) under strict data processing agreements.</li>
              <li>Regulatory authorities if required by Australian law or court order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
            <p className="text-slate-400">
              We retain your personal information for as long as your account is active or as required to fulfil the purposes
              outlined in this policy, or as required by Australian law. You may request deletion of your account data by
              contacting us at <span className="text-amber-400">privacy@auraestates.com.au</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cookies & Tracking</h2>
            <p className="text-slate-400">
              We use cookies and similar tracking technologies to maintain session state, analyse usage patterns, and personalise
              your experience. You may disable cookies through your browser settings; however, some platform features may be
              impacted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p className="text-slate-400">
              Under the Privacy Act, you have the right to access, correct, or request deletion of your personal information.
              To exercise these rights, contact our Privacy Officer at <span className="text-amber-400">privacy@auraestates.com.au</span>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact Us</h2>
            <p className="text-slate-400">
              Privacy Officer — AuraEstates Pty Ltd<br />
              Level 42, 100 Barangaroo Avenue, Sydney NSW 2000<br />
              Email: <span className="text-amber-400">privacy@auraestates.com.au</span><br />
              Phone: +61 (02) 9000 8888
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 AuraEstates Pty Ltd. ABN 12 345 678 901. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-3">
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-amber-400 transition-colors">Security & Compliance</Link>
            <Link to="/sitemap" className="hover:text-amber-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
