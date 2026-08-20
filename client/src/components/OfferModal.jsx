import React, { useState } from 'react';
import { X, DollarSign, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { createOffer } from '../services/api';

const OfferModal = ({ property, isOpen, onClose }) => {
  const [offerAmount, setOfferAmount] = useState(property?.price || 1500000);
  const [depositAmount, setDepositAmount] = useState(20000);
  const [conditions, setConditions] = useState('Subject to finance approval & pest inspection within 14 days');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return;
    setLoading(true);

    try {
      const res = await createOffer({
        propertyId: property._id,
        offerAmount: Number(offerAmount),
        depositAmount: Number(depositAmount),
        conditions
      });

      if (res.data && res.data.success) {
        if (res.data.emailError) {
          setError(`Offer submitted, but email failed: ${res.data.emailError}`);
          setSuccess(false);
        } else {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 2500);
        }
      }
    } catch (err) {
      console.error('Offer failed:', err);
      setError(err.response?.data?.message || err.response?.data?.emailError || 'Failed to submit offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-200 shadow-2xl relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900">Purchase Offer Submitted!</h3>
            <p className="text-xs text-slate-600">
              Your binding offer of <span className="text-sky-500 font-bold">${Number(offerAmount).toLocaleString()}</span> has been securely transmitted to the listing agent and owner.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Make a Formal Offer</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-500 truncate">{property.title}</p>
            </div>

            {/* Offer Price Input */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Offer Amount (AUD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:border-sky-500"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500">Listing Price: ${property.price?.toLocaleString() || 'POA'}</p>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Proposed Initial Deposit (AUD)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
              />
            </div>

            {/* Contract Special Conditions */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Special Contract Conditions</label>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
              />
            </div>

            {/* Digital Agreement Terms */}
            <div className="flex items-start space-x-2 text-xs text-slate-500 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-amber-500"
                required
              />
              <label htmlFor="terms">
                I confirm this offer is accurate and authorize AuraEstates to submit this proposal to the seller.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-sky-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Offer...' : 'Submit Digital Offer'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default OfferModal;
