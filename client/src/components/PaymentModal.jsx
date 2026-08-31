import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, DollarSign, Lock, QrCode, Smartphone, Copy, Check, Sparkles } from 'lucide-react';
import { checkoutStripePackage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BUYER_PACKAGES = [
  { title: 'Holding Deposit', price: 5000, desc: 'Reserve Property' }
];

const SELLER_AGENT_PACKAGES = [
  { title: 'Featured Listing', price: 99, desc: '30 Days Spotlight' },
  { title: 'Premium Listing', price: 249, desc: 'Top Feed + Gold Badge' }
];

const PaymentModal = ({ isOpen, onClose, defaultPackage = 'Featured Listing', defaultAmount = 99, propertyId = null, onPaymentSuccess }) => {
  const { user } = useAuth();
  
  // Determine role-based package availability
  const isBuyer = user?.role === 'buyer' || (defaultPackage === 'Holding Deposit' && user?.role !== 'seller' && user?.role !== 'agent' && user?.role !== 'agency');
  const availablePackages = isBuyer ? BUYER_PACKAGES : SELLER_AGENT_PACKAGES;

  const [packageType, setPackageType] = useState(defaultPackage);
  const [amount, setAmount] = useState(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  // Card form fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');

  // UPI fields
  const [upiRefId, setUpiRefId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const match = availablePackages.find((p) => p.title === defaultPackage);
      if (match) {
        setPackageType(match.title);
        setAmount(match.price);
      } else {
        setPackageType(availablePackages[0].title);
        setAmount(availablePackages[0].price);
      }
      setError('');
      setSuccessData(null);
    }
  }, [isOpen, defaultPackage, defaultAmount, user?.role]);

  if (!isOpen) return null;

  const handlePackageChange = (pkg, amt) => {
    setPackageType(pkg);
    setAmount(amt);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('auraestates@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await checkoutStripePackage({
        propertyId,
        packageType,
        amount: Number(amount),
        paymentMethod,
        transactionNotes: paymentMethod === 'Online NetBanking / UPI' ? `UPI Ref: ${upiRefId || 'QR Scan'}` : 'Stripe Card Checkout'
      });

      if (res.data && res.data.success) {
        if (res.data.emailError) {
          setError(`Payment successful, but email failed: ${res.data.emailError}`);
          setSuccessData(res.data.transaction);
        } else {
          setSuccessData(res.data.transaction);
          setTimeout(() => {
            if (onPaymentSuccess) onPaymentSuccess(res.data.transaction);
          }, 1500);
        }
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.emailError || 'Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exchangeRateAUDToINR = 55; // 1 AUD ≈ 55 INR
  const inrAmount = Math.round(amount * exchangeRateAUDToINR);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=auraestates@icici&pn=AuraEstates&am=${inrAmount}&cu=INR&tn=${encodeURIComponent(packageType)}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <CreditCard className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Secure Checkout</h2>
              <p className="text-xs text-slate-500">Encrypted payment gateway powered by Stripe & UPI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success View */}
        {successData ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500">Transaction ID: <span className="font-mono text-sky-500">{successData.stripePaymentIntentId || successData._id}</span></p>
              <p className="text-sm font-bold text-emerald-400 mt-2">AUD ${successData.amount} • {successData.packageType}</p>
            </div>
            <p className="text-xs text-slate-500">Your account and database record have been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Package Selection */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-600">Select Purpose / Package</label>
              <div className={`grid ${availablePackages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}>
                {availablePackages.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handlePackageChange(item.title, item.price)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      packageType === item.title
                        ? 'bg-sky-500/10 border-sky-500 text-sky-500'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                    <div className="text-[11px] text-sky-500 font-extrabold mt-0.5">AUD ${item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    paymentMethod === 'Credit Card'
                      ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-md'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Online NetBanking / UPI')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    paymentMethod === 'Online NetBanking / UPI'
                      ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-md'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR Scan</span>
                </button>
              </div>
            </div>

            {/* Stripe Credit Card Form */}
            {paymentMethod === 'Credit Card' && (
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Stripe Encrypted Card Checkout</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">256-Bit SSL</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">CVC / CVV</label>
                    <input
                      type="password"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI QR Code Scanner Section */}
            {paymentMethod === 'Online NetBanking / UPI' && (
              <div className="space-y-4 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-center">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 text-sm flex items-center justify-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-sky-500" />
                    <span>Scan QR Code to Pay</span>
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Open Google Pay, PhonePe, Paytm, BHIM, or any UPI App and scan below
                  </p>
                </div>

                {/* QR Image */}
                <div className="inline-block p-3 rounded-2xl bg-white border border-slate-300 shadow-xl my-1">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-44 h-44 mx-auto rounded-lg"
                  />
                  <span className="text-[11px] text-slate-900 font-black block mt-1.5 uppercase tracking-wider">
                    SCAN TO PAY: ₹{inrAmount.toLocaleString('en-IN')} INR
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold block">
                    (AUD ${amount} converted @ ₹55/AUD)
                  </span>
                </div>

                {/* UPI VPA ID */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                  <span className="text-slate-500 font-medium">UPI VPA ID:</span>
                  <span className="font-mono text-sky-500 font-bold">auraestates@icici</span>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="p-1 rounded bg-slate-100 text-slate-600 hover:text-slate-900"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Optional Ref UTR Input */}
                <div className="space-y-1 text-left">
                  <label className="font-bold text-slate-500 text-[11px]">UPI Transaction / Ref UTR Number (Optional)</label>
                  <input
                    type="text"
                    value={upiRefId}
                    onChange={(e) => setUpiRefId(e.target.value)}
                    placeholder="e.g. 420918239102"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Total Amount Banner & Submit */}
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-t border-slate-200 text-xs mb-3">
                <span className="font-bold text-slate-500">Total Payable:</span>
                <span className="text-lg font-extrabold text-sky-500">AUD ${amount}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Processing Transaction...' : `Confirm & Pay AUD $${amount} Now`}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
