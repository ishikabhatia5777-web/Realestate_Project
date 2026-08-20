import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-900 pt-16 pb-12 text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Building2 className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                AURA<span className="brand-gradient-text">ESTATES</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Australia's premier luxury real estate marketplace powered by next-generation AI property valuation, interactive 3D maps, and instant buyer-agent connectivity.
            </p>
          </div>

          {/* Col 2: Popular Suburbs */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Top Suburbs</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?suburb=Point Piper" className="hover:text-sky-500 transition-colors">Point Piper, NSW</Link></li>
              <li><Link to="/properties?suburb=Barangaroo" className="hover:text-sky-500 transition-colors">Barangaroo, Sydney</Link></li>
              <li><Link to="/properties?suburb=South Yarra" className="hover:text-sky-500 transition-colors">South Yarra, VIC</Link></li>
              <li><Link to="/properties?suburb=Sanctuary Cove" className="hover:text-sky-500 transition-colors">Sanctuary Cove, QLD</Link></li>
              <li><Link to="/properties?suburb=Manly" className="hover:text-sky-500 transition-colors">Manly Beach, NSW</Link></li>
            </ul>
          </div>

          {/* Col 3: Property Types */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Property Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?propertyType=Villa" className="hover:text-sky-500 transition-colors">Luxury Waterfront Villas</Link></li>
              <li><Link to="/properties?propertyType=Apartment" className="hover:text-sky-500 transition-colors">Sky Penthouses</Link></li>
              <li><Link to="/properties?propertyType=Townhouse" className="hover:text-sky-500 transition-colors">Modern Townhouses</Link></li>
              <li><Link to="/properties?propertyType=Commercial" className="hover:text-sky-500 transition-colors">Commercial Offices</Link></li>
              <li><Link to="/properties?propertyType=Land" className="hover:text-sky-500 transition-colors">Development Land</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Contact */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Headquarters</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                <span>Level 42, 100 Barangaroo Ave, Sydney NSW 2000</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span>+61 (02) 9000 8888</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span>concierge@auraestates.com.au</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
