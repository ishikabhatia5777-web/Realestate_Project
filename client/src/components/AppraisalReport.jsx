import React from 'react';
import { 
  FileText, Printer, ShieldCheck, CheckCircle2, AlertTriangle, 
  TrendingUp, TrendingDown, Minus, Building2, MapPin, Calendar, 
  DollarSign, Info, Layers, Check, Crosshair
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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> High Confidence
      </span>
    );
  }
  if (l.includes('low')) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Low Confidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Medium Confidence
    </span>
  );
};

const getSimilarityBadge = (sim) => {
  const s = (sim || 'Medium').toLowerCase();
  if (s.includes('high')) {
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">High</span>;
  }
  if (s.includes('low')) {
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
  }
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">Medium</span>;
};

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

  return (
    <div className="appraisal-report-container space-y-8 font-sans text-slate-800 print:text-black">
      {/* 1. HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden print:bg-white print:text-black print:border-b print:border-slate-300 print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs tracking-wider uppercase mb-1 print:text-slate-600">
              <Building2 className="w-4 h-4" />
              <span>Aura Estate • Luxury Real Estate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
              {report.title || 'Property Appraisal Report'}
            </h1>
            <p className="text-slate-400 text-sm mt-1 print:text-slate-600 flex items-center gap-2 flex-wrap">
              <span><MapPin className="w-3.5 h-3.5 inline mr-1 text-sky-400" />{formatVal(subject.location, 'Location not specified')}</span>
              <span>•</span>
              <span>{formatVal(subject.property_type, 'Property')}</span>
              <span>•</span>
              <span><Calendar className="w-3.5 h-3.5 inline mr-1" />{report.generated_at ? new Date(report.generated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-AU')}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 print:hidden">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-medium rounded-full border border-sky-500/30">
                Database-First Mode
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-full border border-slate-700">
                Aura Estate DB
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:border-slate-300 print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-sky-500" />
          <span>2. Executive Summary</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {/* Estimated Range */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 print:border-slate-300">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Value Range</span>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              {formatCurrency(exec.estimated_value_range?.low)} – {formatCurrency(exec.estimated_value_range?.high)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Aura Estate Valuation Range</span>
          </div>

          {/* Most Likely Value */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-2xl border border-sky-200 print:bg-white print:border-slate-300">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Most Likely Value</span>
            <div className="text-2xl sm:text-3xl font-black text-sky-900 mt-2">
              {formatCurrency(exec.most_likely_value)}
            </div>
            <span className="text-xs text-sky-700 mt-1 block">Point-Estimate Benchmark</span>
          </div>

          {/* Confidence Level */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 print:border-slate-300">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence Level</span>
            <div className="mt-3">
              {getConfidenceBadge(exec.confidence)}
            </div>
            <span className="text-xs text-slate-500 mt-2 block">Based on local database comparables</span>
          </div>
        </div>
        
        {exec.summary && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed print:bg-white">
            <strong className="text-slate-900 font-semibold block mb-1">Executive Opinion:</strong>
            {exec.summary}
          </div>
        )}
      </div>

      {/* 3. SUBJECT PROPERTY */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-sky-500" />
          <span>3. Subject Property Record</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Property Type</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.property_type)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Listing Type</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.listing_type)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Current Asking Price</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(subject.asking_price)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Completed Sale Price</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(subject.sale_price)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Bedrooms</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.bedrooms)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Bathrooms</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.bathrooms)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Parking Spaces</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.parking_spaces)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Building Area</span>
            <span className="text-sm font-bold text-slate-900">{subject.building_area ? `${subject.building_area} m²` : 'Not available'}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Land Area</span>
            <span className="text-sm font-bold text-slate-900">{subject.land_area ? `${subject.land_area} m²` : 'Not available'}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Year Built</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.year_built)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Condition</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.condition)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-200">
            <span className="text-xs text-slate-500 block">Status</span>
            <span className="text-sm font-bold text-slate-900">{formatVal(subject.status)}</span>
          </div>
        </div>

        {subject.key_features && subject.key_features.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block mb-2">Key Features</span>
            <div className="flex flex-wrap gap-2">
              {subject.key_features.map((feat, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                  <Check className="w-3 h-3 inline mr-1 text-sky-500" />{feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. VALUATION APPROACH */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Crosshair className="w-5 h-5 text-sky-500" />
          <span>4. Valuation Approach & Methodology</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Method</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{formatVal(approach.method, 'Direct Comparison')}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Rationale</span>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">{formatVal(approach.reason)}</p>
          </div>
        </div>
        {approach.category_methodology && (
          <div className="mt-4 p-4 bg-sky-50/50 rounded-xl border border-sky-100 text-xs text-slate-700">
            <strong className="text-sky-900 font-semibold block mb-1">Category Guidelines:</strong>
            {approach.category_methodology}
          </div>
        )}
      </div>

      {/* 5. MARKET EVIDENCE METRICS */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-sky-500" />
          <span>5. Market Evidence Overview</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
            <span className="text-2xl font-black text-slate-900">{formatVal(evidence.candidate_count, '0')}</span>
            <span className="text-xs text-slate-500 block mt-1">Candidates Analyzed</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
            <span className="text-2xl font-black text-sky-600">{formatVal(evidence.selected_comparable_count, '0')}</span>
            <span className="text-xs text-slate-500 block mt-1">Selected Comparables</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
            <span className="text-xs font-bold text-slate-800 block mt-2">{formatVal(evidence.data_source, 'Aura Estate Database')}</span>
            <span className="text-xs text-slate-500 block mt-1">Authoritative Source</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
            <span className="text-xs font-bold text-emerald-600 block mt-2">
              {evidence.external_research_used ? 'Enabled' : 'Disabled (Database Only)'}
            </span>
            <span className="text-xs text-slate-500 block mt-1">External Research</span>
          </div>
        </div>
      </div>

      {/* 6. COMPARABLE PROPERTIES TABLE */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-x-auto print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-sky-500" />
          <span>6. Comparable Properties (Aura Estate Database)</span>
        </h2>

        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="py-3 px-4">Property / ID</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Price & Status</th>
              <th className="py-3 px-4">Specs</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4 text-center">Similarity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparables.length > 0 ? (
              comparables.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {c.id || `Comparable ${idx + 1}`}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{formatVal(c.location)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatVal(c.property_type)}</td>
                  <td className="py-3 px-4">
                    {c.sale_price ? (
                      <div>
                        <span className="font-extrabold text-emerald-700 block">{formatCurrency(c.sale_price)}</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Completed Sale</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-extrabold text-slate-900 block">{formatCurrency(c.asking_price || c.listing_price)}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Listing/Asking Price</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.bedrooms ?? '-'} beds • {c.bathrooms ?? '-'} baths
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.building_area ? `${c.building_area} m²` : (c.land_area ? `${c.land_area} m²` : 'Not available')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getSimilarityBadge(c.similarity)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-slate-400">No comparable properties supplied.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 7. COMPARABLE ANALYSIS */}
      {compAnalysis.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 print:bg-white print:p-0">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Info className="w-5 h-5 text-sky-500" />
            <span>7. Detailed Comparable Analysis</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compAnalysis.map((ca, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">Comparable ID: {ca.id || `#${idx + 1}`}</span>
                  {getSimilarityBadge(ca.similarity)}
                </div>
                <p className="text-xs text-slate-700"><strong>Selection Rationale:</strong> {formatVal(ca.why_selected)}</p>
                
                {ca.similarities && ca.similarities.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 block">Key Similarities:</span>
                    <ul className="list-disc list-inside text-xs text-slate-600 pl-1">
                      {ca.similarities.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {ca.differences && ca.differences.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-amber-700 block">Key Differences:</span>
                    <ul className="list-disc list-inside text-xs text-slate-600 pl-1">
                      {ca.differences.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
                {ca.effect_on_valuation && (
                  <p className="text-xs text-sky-800 bg-sky-50 p-2 rounded-lg border border-sky-100">
                    <strong>Effect on Valuation:</strong> {ca.effect_on_valuation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ADJUSTMENTS */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-sky-500" />
          <span>8. Factor Adjustments</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Factor</th>
                <th className="py-3 px-4">Comparable</th>
                <th className="py-3 px-4">Impact / Direction</th>
                <th className="py-3 px-4">Adjustment Amount</th>
                <th className="py-3 px-4">Reason & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustments.length > 0 ? (
                adjustments.map((adj, idx) => {
                  const dir = (adj.direction || 'neutral').toLowerCase();
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{formatVal(adj.factor)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatVal(adj.comparable_id)}</td>
                      <td className="py-3 px-4">
                        {dir === 'positive' && (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Positive
                          </span>
                        )}
                        {dir === 'negative' && (
                          <span className="inline-flex items-center text-xs font-bold text-rose-600">
                            <TrendingDown className="w-3.5 h-3.5 mr-1" /> Negative
                          </span>
                        )}
                        {dir === 'neutral' && (
                          <span className="inline-flex items-center text-xs font-bold text-slate-500">
                            <Minus className="w-3.5 h-3.5 mr-1" /> Neutral
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {typeof adj.adjustment_amount === 'number' ? formatCurrency(adj.adjustment_amount) : formatVal(adj.adjustment_amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{formatVal(adj.reason)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-slate-400">No specific numerical adjustments applied.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. VALUATION RECONCILIATION */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-sky-500" />
          <span>9. Valuation Reconciliation</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block uppercase">Weighting & Method</span>
            <p className="text-xs text-slate-700 mt-1 font-semibold">{formatVal(reconciliation.method, 'Weighted Comparison')}</p>
            <p className="text-xs text-slate-600 mt-1">{formatVal(reconciliation.weighting)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block uppercase">Reconciliation Rationale</span>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">{formatVal(reconciliation.reconciliation_reasoning)}</p>
          </div>
        </div>
      </div>

      {/* 10. FINAL VALUATION HIGHLIGHT */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-900 print:bg-white print:text-black print:border-2 print:border-slate-900 print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 print:text-slate-600">Final Valuation Result</span>
            <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 print:text-black">
              {formatCurrency(finalVal.most_likely || exec.most_likely_value, finalVal.currency)}
            </h3>
            <p className="text-sm text-sky-200 mt-1 print:text-slate-700">
              Estimated Range: <strong>{formatCurrency(finalVal.low || exec.estimated_value_range?.low)} – {formatCurrency(finalVal.high || exec.estimated_value_range?.high)}</strong>
            </p>
          </div>
          <div className="max-w-md text-xs text-slate-300 print:text-slate-700 leading-relaxed bg-white/5 print:bg-slate-50 p-4 rounded-xl border border-white/10 print:border-slate-200">
            <strong className="text-white print:text-black block mb-1">Valuation Summary:</strong>
            {formatVal(finalVal.reasoning || exec.summary)}
          </div>
        </div>
      </div>

      {/* 11. KEY VALUE DRIVERS */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-sky-500" />
          <span>11. Key Value Drivers</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">Positive Drivers</span>
            <ul className="space-y-1.5">
              {drivers.positive_factors && drivers.positive_factors.length > 0 ? (
                drivers.positive_factors.map((pf, i) => (
                  <li key={i} className="text-xs text-emerald-900 flex items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                    <span>{pf}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">None specified</li>
              )}
            </ul>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">Negative / Limiting Drivers</span>
            <ul className="space-y-1.5">
              {drivers.negative_factors && drivers.negative_factors.length > 0 ? (
                drivers.negative_factors.map((nf, i) => (
                  <li key={i} className="text-xs text-amber-900 flex items-start">
                    <Minus className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0 mt-0.5" />
                    <span>{nf}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">None specified</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 12. RISKS & LIMITATIONS */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>12. Risks & Evidence Limitations</span>
        </h2>
        <div className="space-y-2">
          {risks.length > 0 ? (
            risks.map((r, i) => (
              <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No critical evidence limitations identified.</p>
          )}
        </div>
      </div>

      {/* 13. CONFIDENCE ASSESSMENT */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-500" />
          <span>13. Confidence Assessment</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            {getConfidenceBadge(confidence.level || exec.confidence)}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {formatVal(confidence.explanation, 'Assessment based on quantity, quality, and proximity of Aura Estate database comparables.')}
          </p>
        </div>
      </div>

      {/* 14. DATA SOURCES & ASSUMPTIONS */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:bg-white print:p-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5 text-sky-500" />
          <span>14. Data Sources & Assumptions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Database Parameters</span>
            <p><strong>Primary Source:</strong> {formatVal(dataSources.primary_source, 'Aura Estate Database')}</p>
            <p><strong>External Web Research:</strong> {dataSources.external_sources_used ? 'Yes' : 'No (Disabled)'}</p>
            <p><strong>Candidates Analyzed:</strong> {formatVal(dataSources.candidate_count, evidence.candidate_count)}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Assumptions & Gaps</span>
            {dataSources.assumptions && dataSources.assumptions.length > 0 && (
              <div>
                <strong>Key Assumptions:</strong>
                <ul className="list-disc list-inside text-slate-600 pl-1">
                  {dataSources.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            {dataSources.missing_information && dataSources.missing_information.length > 0 && (
              <div>
                <strong>Missing Information:</strong>
                <ul className="list-disc list-inside text-slate-600 pl-1">
                  {dataSources.missing_information.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 15. DISCLAIMER */}
      <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed print:bg-white print:border-t print:p-4">
        <strong className="text-slate-700 block mb-1">Legal Disclaimer:</strong>
        {formatVal(report.disclaimer, 'This property appraisal estimate is generated automatically using Aura Estate database evidence. It does not constitute a formal sworn valuation by a licensed valuer.')}
      </div>

      {/* PRINT MEDIA CSS */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .appraisal-report-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          header, footer, nav, .print\\:hidden {
            display: none !important;
          }
          .appraisal-report-container > div {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 1.5rem !important;
            box-shadow: none !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppraisalReport;
