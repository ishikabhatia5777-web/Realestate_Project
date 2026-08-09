import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <FileText className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: August 2026 &nbsp;|&nbsp; Governing Law: New South Wales, Australia</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-400">
              By accessing or using the AuraEstates platform ("Service"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree, please do not use the Service. These Terms constitute a legally binding agreement
              between you and AuraEstates Pty Ltd (ABN 12 345 678 901), a company incorporated in New South Wales, Australia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Platform Description</h2>
            <p className="text-slate-400">
              AuraEstates is a technology platform that connects buyers, renters, sellers, property agents, and real estate
              agencies across Australia. We provide property search, AI-assisted valuation, inspection booking, offer submission,
              and secure payment processing services. AuraEstates does not act as a licensed real estate agent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Eligibility</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>You must be at least 18 years of age to use this platform.</li>
              <li>You must provide accurate, current, and complete registration information.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>Corporate accounts must be operated by an authorised representative of the entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Permitted Use</h2>
            <p className="text-slate-400">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Post false, misleading, or fraudulent property listings.</li>
              <li>Scrape, reproduce, or commercially exploit platform data without written consent.</li>
              <li>Use the platform for money laundering or any activity that violates Australian law.</li>
              <li>Attempt to gain unauthorised access to other accounts or platform infrastructure.</li>
              <li>Use automated bots or crawlers to access the Service without prior approval.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Property Listings</h2>
            <p className="text-slate-400">
              Agents, agencies, and sellers are solely responsible for the accuracy, completeness, and legality of their property
              listings. AuraEstates reviews listings for quality standards but does not independently verify all listing claims.
              Listings are subject to removal if found to be inaccurate, fraudulent, or in breach of Australian consumer law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Payments & Fees</h2>
            <p className="text-slate-400">
              Holding deposits and subscription payments are processed via Stripe under PCI DSS security standards. All fees are
              displayed in Australian Dollars (AUD) inclusive of GST where applicable. Refund eligibility is determined on a
              case-by-case basis in accordance with Australian Consumer Law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
            <p className="text-slate-400">
              All content, design, software, and branding on AuraEstates are the exclusive intellectual property of AuraEstates
              Pty Ltd and are protected under Australian copyright law. You may not reproduce or distribute platform content
              without prior written authorisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-slate-400">
              The Service is provided "as is" without warranties of any kind. AuraEstates does not guarantee the accuracy of
              AI-generated property valuations. AI valuations are indicative only and should not replace professional appraisals
              by a licensed valuer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p className="text-slate-400">
              To the maximum extent permitted under Australian Consumer Law, AuraEstates' aggregate liability for any claim
              arising from use of the Service shall not exceed the total fees paid by you in the 12 months preceding the claim.
              We are not liable for indirect, incidental, or consequential losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Governing Law</h2>
            <p className="text-slate-400">
              These Terms are governed by the laws of New South Wales, Australia. Any disputes shall be resolved in the courts
              of New South Wales. If any provision of these Terms is found to be unenforceable, the remaining provisions
              continue in full force.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p className="text-slate-400">
              Legal & Compliance — AuraEstates Pty Ltd<br />
              Level 42, 100 Barangaroo Avenue, Sydney NSW 2000<br />
              Email: <span className="text-amber-400">legal@auraestates.com.au</span>
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 AuraEstates Pty Ltd. ABN 12 345 678 901. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-3">
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link to="/security" className="hover:text-amber-400 transition-colors">Security & Compliance</Link>
            <Link to="/sitemap" className="hover:text-amber-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
