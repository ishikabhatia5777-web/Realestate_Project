import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Server, CreditCard, ShieldCheck, Eye, Key } from 'lucide-react';

const SecurityPage = () => {
  const measures = [
    {
      icon: <Lock className="w-6 h-6 text-amber-400" />,
      title: 'TLS / HTTPS Encryption',
      desc: 'All data transmitted between your browser and AuraEstates is encrypted using TLS 1.3. We enforce HTTPS across every endpoint with HTTP Strict Transport Security (HSTS) headers.'
    },
    {
      icon: <Key className="w-6 h-6 text-amber-400" />,
      title: 'JWT Authentication',
      desc: 'User sessions are secured with signed JSON Web Tokens (JWT) with short-lived expiry and HTTP-only cookie handling to prevent XSS-based token theft.'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber-400" />,
      title: 'PCI DSS Payment Security',
      desc: 'All payment processing is handled by Stripe, a PCI DSS Level 1 certified provider. AuraEstates never stores raw card numbers or CVVs on our servers.'
    },
    {
      icon: <Server className="w-6 h-6 text-amber-400" />,
      title: 'Secure Cloud Infrastructure',
      desc: 'Our backend is hosted on Render and MongoDB Atlas with IP allowlisting, automated backups, and encryption at rest. Our client is deployed via Vercel with edge security headers.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Every API endpoint enforces strict role-based access checks. Super admins, agents, agencies, sellers, and buyers have distinct permission scopes — no privilege escalation is possible.'
    },
    {
      icon: <Eye className="w-6 h-6 text-amber-400" />,
      title: 'AI Fraud Risk Scoring',
      desc: 'Every property listing is scored by our AI fraud detection engine at submission time. Listings with high fraud-risk scores are automatically flagged for admin review before publication.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Security & Compliance</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            AuraEstates is built with enterprise-grade security standards, protecting every buyer, seller, and agent on our platform.
          </p>
        </div>

        {/* Security Measures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {measures.map((m, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  {m.icon}
                </div>
                <h3 className="font-bold text-white text-sm">{m.title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Compliance Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-white mb-5">Regulatory Compliance</h2>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="flex items-start space-x-3">
              <span className="text-amber-400 font-bold mt-0.5">✓</span>
              <p><strong className="text-slate-200">Australian Privacy Act 1988 (Cth)</strong> — We comply with all 13 Australian Privacy Principles governing the collection, use, and disclosure of personal information.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-amber-400 font-bold mt-0.5">✓</span>
              <p><strong className="text-slate-200">Australian Consumer Law (ACL)</strong> — All transactions and listings must comply with consumer protection obligations under the Competition and Consumer Act 2010.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-amber-400 font-bold mt-0.5">✓</span>
              <p><strong className="text-slate-200">Anti-Money Laundering & Counter-Terrorism Financing Act 2006</strong> — We apply AML/CTF obligations including transaction monitoring and suspicious matter reporting for high-value property transactions.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-amber-400 font-bold mt-0.5">✓</span>
              <p><strong className="text-slate-200">PCI DSS Level 1</strong> — Payment card security is enforced through our Stripe integration, meeting the highest level of PCI Data Security Standard compliance.</p>
            </div>
          </div>
        </div>

        {/* Vulnerability Disclosure */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-bold text-white mb-2">Responsible Disclosure</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            If you discover a security vulnerability in the AuraEstates platform, please report it responsibly to our security team
            at <span className="text-amber-400">security@auraestates.com.au</span>. We commit to acknowledge your report within 48 hours
            and provide a resolution timeline. We will not pursue legal action against researchers acting in good faith.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 AuraEstates Pty Ltd. ABN 12 345 678 901. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-3">
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-amber-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
