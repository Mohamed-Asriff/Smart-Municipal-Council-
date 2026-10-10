import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Download, Printer } from 'lucide-react';
import { translations } from '../data/translations';
import { api } from '../services/api';

export default function PaymentPortalModal({ 
  isOpen, 
  onClose, 
  lang, 
  prefillBill = null, 
  onPaymentSuccess 
}) {
  const t = translations[lang].payments;

  const [serviceType, setServiceType] = useState('propertyTax');
  const [accountRef, setAccountRef] = useState('KMC-TAX-2026-9041');
  const [amount, setAmount] = useState('4700');
  const [payerName, setPayerName] = useState('A. Mohamed Rizwan');
  const [payerPhone, setPayerPhone] = useState('0771234567');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (prefillBill) {
      setAccountRef(prefillBill.assessmentNo || 'KMC-TAX-2026-9041');
      setAmount(String(prefillBill.amount || '4700'));
      if (prefillBill.service?.toLowerCase().includes('trade')) setServiceType('tradeLicense');
      else if (prefillBill.service?.toLowerCase().includes('waste')) setServiceType('wasteFee');
      else setServiceType('propertyTax');
    }
  }, [prefillBill]);

  if (!isOpen) return null;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const newReceipt = {
      receiptNo: 'REC-KMC-' + Math.floor(100000 + Math.random() * 900000),
      txnId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      date: new Date().toLocaleString(),
      payerName,
      payerPhone,
      accountRef,
      amount,
      serviceType:
        serviceType === 'propertyTax'
          ? t.propertyTax
          : serviceType === 'tradeLicense'
          ? t.tradeLicense
          : serviceType === 'shopLease'
          ? t.shopLease
          : t.wasteFee
    };

    // Send transaction to Spring Boot / PostgreSQL
    await api.submitPayment(newReceipt);

    setReceiptData(newReceipt);
    setIsSuccess(true);

    if (onPaymentSuccess) {
      onPaymentSuccess(newReceipt);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setReceiptData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 text-white rounded-3xl max-w-lg w-full border border-zinc-800 shadow-2xl overflow-hidden relative my-8">
        
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">{t.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <p className="text-xs text-zinc-300 mb-4">{t.subtitle}</p>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {t.selectService}
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="propertyTax">{t.propertyTax}</option>
                  <option value="tradeLicense">{t.tradeLicense}</option>
                  <option value="shopLease">{t.shopLease}</option>
                  <option value="wasteFee">{t.wasteFee}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {t.assessmentNo}
                </label>
                <input
                  type="text"
                  required
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
                  placeholder="e.g. KMC-TAX-2026-9041"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    {t.payerName}
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    {t.contactPhone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {t.amountToPay} (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-500">LKR</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-14 pr-3 py-2.5 text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  {t.gatewayGuarantee}
                </span>
                <span className="font-semibold text-white">LankaPay Verified</span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/60 transition active:scale-95"
              >
                {t.btnProceed} (LKR {Number(amount).toLocaleString()})
              </button>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-lg font-bold text-white">{t.paymentConfirmed}</h4>
                <p className="text-xs text-zinc-400">{t.eReceiptSub}</p>
              </div>

              {receiptData && (
                <div className="bg-black border border-zinc-800 rounded-2xl p-4 text-xs space-y-2 font-mono">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">RECEIPT NO</span>
                    <span className="text-white font-bold">{receiptData.receiptNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">TXN ID</span>
                    <span className="text-zinc-300">{receiptData.txnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SERVICE</span>
                    <span className="text-zinc-300">{receiptData.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ACCOUNT REF</span>
                    <span className="text-zinc-300">{receiptData.accountRef}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold">
                    <span className="text-zinc-400">TOTAL PAID</span>
                    <span className="text-emerald-400">LKR {Number(receiptData.amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => alert('Printing Official E-Receipt...')}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold py-2.5 rounded-xl border border-zinc-800 text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.btnPrint}</span>
                </button>
                <button
                  onClick={() => alert('PDF E-Receipt downloaded with municipal digital stamp.')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.btnDownload}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline"
                >
                  Make another payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
