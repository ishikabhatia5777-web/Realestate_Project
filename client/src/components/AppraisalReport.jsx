import React from 'react';
import { 
  FileText, Printer, ShieldCheck, AlertTriangle, 
  TrendingUp, TrendingDown, Minus, Building2, MapPin, Calendar, 
  Check, Crosshair, Info, CheckCircle2, Layers
} from 'lucide-react';

const formatCurrency = (val, currency = 'AUD') => {
  if (val === null || val === undefined || isNaN(val)) return 'Not available';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(val);
};

const formatVal = (val, fallback = 'Not available') => {
  if (val === null || val === undefined || val === '') return fallback;
  return val;
};

const getConfidenceBadge = (level) => {
  const l = (level || 'Medium').toLowerCase();
  if (l.includes('high')) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> High Confidence
      </span>
    );
  }
  if (l.includes('low')) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Low Confidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-sky-500/10 text-sky-500 border border-sky-500/30">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Medium Confidence
    </span>
  );
};

const getSimilarityBadge = (sim) => {
  const s = (sim || 'Medium').toLowerCase();
  if (s.includes('high')) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">High</span>;
  }
  if (s.includes('low')) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/30">Low</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/30">Medium</span>;
};

const SectionHeading = ({ title, icon: Icon }) => (
  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
    {Icon && <Icon className="w-6 h-6 text-sky-500" />}
    <span>{title}</span>
  </h2>
);

const AppraisalReport = ({ reportData }) => {
  if (!reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const report = reportData;
  const exec = report.executive_summary || {};
  const subject = report.subject_property || {};
  const approach = report.valuation_approach || {};
  const evidence = report.market_evidence || {};
  const comparables = report.comparables || [];
  const compAnalysis = report.comparable_analysis || [];
  const adjustments = report.adjustments || [];
  const reconciliation = report.valuation_reconciliation || {};
  const finalVal = report.final_valuation || {};
  const drivers = report.key_value_drivers || {};
  const risks = report.risks_and_limitations || [];
  const confidence = report.confidence_assessment || {};
  const dataSources = report.data_sources_and_assumptions || {};

  const mostLikelyValue = finalVal.most_likely || exec.most_likely_value;
  const rangeLow = finalVal.low || exec.estimated_value_range?.low;
  const rangeHigh = finalVal.high || exec.estimated_value_range?.high;

  return (
    <div id="appraisal-report" className="space-y-6 font-sans text-slate-900 print:text-black">
      
      {/* HEADER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Aura Estate • Luxury Real Estate
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{report.title || 'Property Appraisal Report'}</h1>
            <p className="text-sm text-slate-500 flex items-center space-x-1.5 mt-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>{formatVal(subject.location, 'Location not specified')}</span>
              <span className="mx-1">•</span>
              <Building2 className="w-4 h-4 text-sky-500" />
              <span>{formatVal(subject.property_type, 'Property')}</span>
              <span className="mx-1">•</span>
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>{report.generated_at ? new Date(report.generated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-AU')}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-md no-print print:hidden whitespace-nowrap"
          >
            <Printer className="w-4 h-4 mr-2" /> Download PDF
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <SectionHeading title="Executive Summary" icon={FileText} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 lg:col-span-6 space-y-6 min-w-0">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Most Likely Value</span>
              <div className="text-[clamp(2rem,4vw,2.5rem)] font-extrabold brand-gradient-text tracking-tight leading-none break-words">
                {formatCurrency(mostLikelyValue, finalVal.currency)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Estimated Value Range</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 break-words">
                {formatCurrency(rangeLow)} – {formatCurrency(rangeHigh)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Confidence Level</span>
              {getConfidenceBadge(confidence.level || exec.confidence)}
            </div>
          </div>
          <div className="md:col-span-7 lg:col-span-6 space-y-4">
             <div className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap bg-white/50 p-6 rounded-2xl border border-slate-100 h-full">
                <strong className="text-slate-900 font-bold block mb-2">Appraisal Opinion</strong>
                {formatVal(finalVal.reasoning || exec.summary)}
             </div>
          </div>
        </div>
      </div>

      {/* PROPERTY DETAILS */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <SectionHeading title="Property Details" icon={Building2} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[
            { label: 'Bedrooms', value: formatVal(subject.bedrooms) },
            { label: 'Bathrooms', value: formatVal(subject.bathrooms) },
            { label: 'Parking', value: formatVal(subject.parking_spaces) },
            { label: 'Building Area', value: subject.building_area ? `${subject.building_area} m²` : 'Not available' },
            { label: 'Land Area', value: subject.land_area ? `${subject.land_area} m²` : 'Not available' },
            { label: 'Year Built', value: formatVal(subject.year_built) },
            { label: 'Condition', value: formatVal(subject.condition) },
            { label: 'Property Type', value: formatVal(subject.property_type) },
            { label: 'Listing Type', value: formatVal(subject.listing_type) },
            { label: 'Status', value: formatVal(subject.status) }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</span>
              <span className="text-sm font-bold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
        {subject.key_features && subject.key_features.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Key Features</span>
            <div className="flex flex-wrap gap-2">
              {subject.key_features.map((feat, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-sky-500 mr-1.5" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COMPARABLE PROPERTIES */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 overflow-x-auto">
        <SectionHeading title="Comparable Properties" icon={Layers} />
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="py-3 pr-4 font-bold">Property / Location</th>
              <th className="py-3 px-4 font-bold">Type</th>
              <th className="py-3 px-4 font-bold">Price</th>
              <th className="py-3 px-4 font-bold">Specs</th>
              <th className="py-3 px-4 font-bold">Size</th>
              <th className="py-3 pl-4 font-bold text-right">Similarity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparables.length > 0 ? (
              comparables.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-slate-900">{c.id || `Comparable ${idx + 1}`}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{formatVal(c.location)}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{formatVal(c.property_type)}</td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{formatCurrency(c.sale_price || c.asking_price || c.listing_price)}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5 font-semibold">{c.sale_price ? 'Sale Price' : 'Asking Price'}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {c.bedrooms ?? '-'} bed, {c.bathrooms ?? '-'} bath
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {c.building_area ? `${c.building_area} m²` : (c.land_area ? `${c.land_area} m²` : '-')}
                  </td>
                  <td className="py-4 pl-4 text-right">
                    {getSimilarityBadge(c.similarity)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">No comparable properties found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VALUATION ANALYSIS */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <SectionHeading title="Valuation Analysis" icon={Crosshair} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Approach & Methodology</span>
              <p className="text-sm font-bold text-slate-900 mb-2">{formatVal(approach.method, 'Direct Comparison')}</p>
              <p className="text-slate-600 text-sm leading-relaxed">{formatVal(approach.reason)}</p>
            </div>
            {reconciliation.reconciliation_reasoning && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Reconciliation Rationale</span>
                <p className="text-slate-600 text-sm leading-relaxed">{formatVal(reconciliation.reconciliation_reasoning)}</p>
              </div>
            )}
          </div>
          <div className="space-y-6 bg-white/50 p-6 rounded-2xl border border-slate-100">
            {drivers.positive_factors && drivers.positive_factors.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Positive Value Factors</span>
                <ul className="space-y-2">
                  {drivers.positive_factors.map((pf, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start font-medium">
                      <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                      {pf}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {drivers.negative_factors && drivers.negative_factors.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Limiting Factors</span>
                <ul className="space-y-2">
                  {drivers.negative_factors.map((nf, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start font-medium">
                      <Minus className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                      {nf}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADJUSTMENTS & LIMITATIONS */}
      {(adjustments.length > 0 || risks.length > 0) && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
          <SectionHeading title="Adjustments & Risk Factors" icon={TrendingUp} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {adjustments.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 block">Key Adjustments</span>
                <div className="space-y-4">
                  {adjustments.map((adj, idx) => (
                    <div key={idx} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-sm">{formatVal(adj.factor)}</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {typeof adj.adjustment_amount === 'number' ? formatCurrency(adj.adjustment_amount) : formatVal(adj.adjustment_amount)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{formatVal(adj.reason)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {risks.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 block">Risks & Limitations</span>
                <ul className="space-y-3">
                  {risks.map((r, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start font-medium bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER / DISCLAIMER */}
      <div className="p-6 sm:p-8 text-xs text-slate-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="font-bold text-slate-700 mb-1">Data Sources</p>
            <p className="mb-0.5">Primary Source: {formatVal(dataSources.primary_source, 'Aura Estate Database')}</p>
            <p>Candidates Analyzed: {formatVal(dataSources.candidate_count, evidence.candidate_count)}</p>
          </div>
          <div>
            <p className="font-bold text-slate-700 mb-1">Confidence Assessment</p>
            <p>{formatVal(confidence.explanation, 'Assessment based on quantity, quality, and proximity of Aura Estate database comparables.')}</p>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-200">
          <strong className="text-slate-700 font-bold">Disclaimer:</strong> {formatVal(report.disclaimer, 'This property appraisal estimate is generated automatically using Aura Estate database evidence. It does not constitute a formal sworn valuation by a licensed valuer.')}
        </div>
      </div>
      
      {/* PRINT MEDIA CSS OVERRIDES */}
      <style>{`
        @media print {
          #appraisal-report {
            display: block !important;
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppraisalReport;
