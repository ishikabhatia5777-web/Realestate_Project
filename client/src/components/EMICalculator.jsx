import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

const EMICalculator = ({ defaultPrice = 1200000 }) => {
  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.2);
  const [loanTermYears, setLoanTermYears] = useState(30);

  const downPayment = (propertyPrice * downPaymentPercent) / 100;
  const principal = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  const monthlyRepayment =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : principal / totalMonths;

  const totalPayment = monthlyRepayment * totalMonths;
  const totalInterest = totalPayment - principal;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-sky-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Mortgage & EMI Calculator</h3>
          <p className="text-xs text-slate-500">Estimate your monthly property loan repayments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sliders Input */}
        <div className="space-y-4 text-xs">
          
          {/* Property Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Property Price</span>
              <span className="text-sky-500 font-bold">${propertyPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="200000"
              max="20000000"
              step="50000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Deposit Percent */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Down Payment ({downPaymentPercent}%)</span>
              <span className="text-sky-500 font-bold">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Interest Rate</span>
              <span className="text-sky-500 font-bold">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="12.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Loan Term */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Loan Term</span>
              <span className="text-sky-500 font-bold">{loanTermYears} Years</span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

        </div>

        {/* Repayment Summary Box */}
        <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Repayment</span>
            <p className="text-3xl font-extrabold brand-gradient-text tracking-tight mt-1">
              ${Math.round(monthlyRepayment).toLocaleString()}<span className="text-sm font-normal text-slate-500"> / month</span>
            </p>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
            <div className="flex justify-between text-slate-500">
              <span>Principal Amount:</span>
              <span className="text-slate-900 font-semibold">${principal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total Interest Payable:</span>
              <span className="text-slate-900 font-semibold">${Math.round(totalInterest).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total Payment:</span>
              <span className="text-slate-900 font-semibold">${Math.round(totalPayment).toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EMICalculator;
