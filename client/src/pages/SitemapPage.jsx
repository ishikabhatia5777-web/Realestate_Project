import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';

const SitemapPage = () => {
  const sections = [
    {
      title: 'Main Pages',
      links: [
        { label: 'Home', to: '/' },
        { label: 'Explore All Properties', to: '/properties' },
        { label: 'Agencies', to: '/agencies' },
        { label: 'Market Insights (Blogs)', to: '/blogs' },
        { label: 'Wishlist', to: '/wishlist' },
      ]
    },
    {
      title: 'Property Search by Type',
      links: [
        { label: 'Luxury Villas', to: '/properties?propertyType=Villa' },
        { label: 'Sky Penthouses & Apartments', to: '/properties?propertyType=Apartment' },
        { label: 'Modern Townhouses', to: '/properties?propertyType=Townhouse' },
        { label: 'Residential Homes', to: '/properties?propertyType=Residential' },
        { label: 'Commercial Offices', to: '/properties?propertyType=Office' },
        { label: 'Development Land', to: '/properties?propertyType=Land' },
        { label: 'Farm & Rural Properties', to: '/properties?propertyType=Farm' },
      ]
    },
    {
      title: 'Property Search by Listing Type',
      links: [
        { label: 'Properties For Sale', to: '/properties?listingType=Sale' },
        { label: 'Properties For Rent', to: '/properties?listingType=Rent' },
      ]
    },
    {
      title: 'Top Suburbs',
      links: [
        { label: 'Point Piper, NSW', to: '/properties?suburb=Point Piper' },
        { label: 'Barangaroo, Sydney', to: '/properties?suburb=Barangaroo' },
        { label: 'Bondi Beach, NSW', to: '/properties?suburb=Bondi Beach' },
        { label: 'Mosman, NSW', to: '/properties?suburb=Mosman' },
        { label: 'South Yarra, VIC', to: '/properties?suburb=South Yarra' },
        { label: 'Toorak, VIC', to: '/properties?suburb=Toorak' },
        { label: 'Surfers Paradise, QLD', to: '/properties?suburb=Surfers Paradise' },
        { label: 'Noosa Heads, QLD', to: '/properties?suburb=Noosa Heads' },
        { label: 'Cottesloe, WA', to: '/properties?suburb=Cottesloe' },
        { label: 'Manly Beach, NSW', to: '/properties?suburb=Manly' },
      ]
    },
    {
      title: 'Account & Dashboards',
      links: [
        { label: 'Sign In', to: '/login' },
        { label: 'Create Account', to: '/register' },
        { label: 'Buyer Dashboard', to: '/dashboard/buyer' },
        { label: 'Seller Dashboard', to: '/dashboard/seller' },
        { label: 'Agent Dashboard', to: '/dashboard/agent' },
        { label: 'Agency Dashboard', to: '/dashboard/agency' },
        { label: 'Admin Dashboard', to: '/dashboard/admin' },
      ]
    },
    {
      title: 'Legal & Compliance',
      links: [
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Security & Compliance', to: '/security' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <Map className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Sitemap</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            A complete directory of all pages and sections available on AuraEstates.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/20 transition-colors">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-slate-800">
                {section.title}
              </h2>
              <ul className="space-y-2.5">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-amber-400 transition-colors flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-400 transition-colors flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 AuraEstates Pty Ltd. ABN 12 345 678 901. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-3">
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-amber-400 transition-colors">Security & Compliance</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
