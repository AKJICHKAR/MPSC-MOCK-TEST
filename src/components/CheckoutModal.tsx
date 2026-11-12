import React, { useState } from 'react';
import { MockTest, TestPackage } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, ShieldCheck, Tag, Loader2, ArrowRight, Layers, BookOpen } from 'lucide-react';

interface CheckoutModalProps {
  test?: MockTest | null;
  packageItem?: TestPackage | null;
  language: 'en' | 'mr';
  onClose: () => void;
  onSuccess: (id: string, itemType: 'test' | 'package') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  test,
  packageItem,
  language,
  onClose,
  onSuccess
}) => {
  const isMr = language === 'mr';
  const isPackage = Boolean(packageItem);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pricing setup
  const basePrice = isPackage
    ? (packageItem!.discount_price > 0 ? packageItem!.discount_price : packageItem!.price)
    : (test ? test.price : 0);

  const strikePrice = isPackage && packageItem!.price > basePrice ? packageItem!.price : null;
  const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const finalPrice = appliedPromo ? appliedPromo.final_price : basePrice;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await api.validatePromo(
        promoCode.trim(),
        isPackage ? { packageId: packageItem!.id } : { testId: test!.id }
      );
      if (res.valid) {
        setAppliedPromo(res);
      } else {
        setPromoError(res.message || 'Invalid coupon');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Failed to apply coupon');
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Step 1: Create server-side order
      const orderData = await api.createPaymentOrder({
        itemType: isPackage ? 'package' : 'test',
        packageId: packageItem?.id,
        testId: test?.id,
        promoCode: appliedPromo?.code
      });

      // If unlocked directly (free with promo or already enrolled)
      if (orderData.isFree || orderData.isFreeWithPromo || orderData.alreadyEnrolled) {
        triggerConfetti();
        onSuccess(isPackage ? packageItem!.id : test!.id, isPackage ? 'package' : 'test');
        return;
      }

      // Step 2: In web environment, if window.Razorpay exists and real live keys are present, open popup.
      const win = window as any;
      if (win.Razorpay && orderData.keyId && !orderData.keyId.includes('demo')) {
        const rzpOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MPSC Sarathi',
          description: isPackage ? packageItem!.name_en : test!.title_en,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // Server-side verification
              await api.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              triggerConfetti();
              onSuccess(isPackage ? packageItem!.id : test!.id, isPackage ? 'package' : 'test');
            } catch (err: any) {
              setErrorMessage(err.message || 'Verification failed on server');
            }
          },
          prefill: {
            name: orderData.user?.name,
            email: orderData.user?.email,
            contact: orderData.user?.phone
          },
          theme: {
            color: '#d97706'
          }
        };

        const rzp = new win.Razorpay(rzpOptions);
        rzp.open();
      } else {
        // High-security sandbox simulation: Calls server route that calculates and tests HMAC SHA256 signature
        const verifyRes = await api.simulatePaymentSuccess(orderData.orderId);
        if (verifyRes.success) {
          triggerConfetti();
          onSuccess(isPackage ? packageItem!.id : test!.id, isPackage ? 'package' : 'test');
        } else {
          setErrorMessage('Payment verification rejected by server.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              {isPackage ? <Layers className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isPackage
                  ? (isMr ? 'संपूर्ण पॅकेज खरेदी (Razorpay)' : 'Complete Package Checkout')
                  : (isMr ? 'सुरक्षित पेमेंट गेटवे' : 'Razorpay Secure Checkout')}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr ? 'सर्व्हर-व्हेरिफाइड डिजिटल पेमेंट' : 'Server-side verified transaction'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Item Info Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            {isPackage ? (
              <>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isMr ? 'मॉक टेस्ट महा-पॅकेज' : 'Mock Test Series Package'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug font-marathi">
                  {isMr ? packageItem!.name_mr : packageItem!.name_en}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {packageItem!.test_count || packageItem!.test_ids?.length || 0} {isMr ? 'सराव चाचण्या' : 'Mock Tests'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{packageItem!.validity_days} {isMr ? 'दिवस प्रवेश वैधता' : 'Days Validity'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isMr ? 'अमर्याद सराव' : 'Unlimited Attempts'}</span>
                </div>
              </>
            ) : (
              <>
                <h4 className="text-sm font-bold text-slate-900 leading-snug font-marathi">
                  {isMr ? test!.title_mr : test!.title_en}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>{test!.duration_minutes} {isMr ? 'मिनिटे' : 'mins'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{test!.total_marks} {isMr ? 'गुण' : 'marks'}</span>
                  <span aria-hidden="true">·</span>
                  <span>1/4 {isMr ? 'निगेटिव्ह मार्किंग' : 'negative marking'}</span>
                </div>
              </>
            )}
          </div>

          {/* Promo Code Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              {isMr ? 'सूट कूपन / प्रोमो कोड' : 'Have a Promo Code?'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isMr ? 'उदा. MPSC2026 किंवा TOPPER50' : 'e.g. MPSC2026 or TOPPER50'}
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                disabled={Boolean(appliedPromo)}
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase tracking-wider font-mono"
              />
              {appliedPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isMr ? 'काढा' : 'Remove'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={validatingPromo || !promoCode.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                >
                  {validatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isMr ? 'लागू करा' : 'Apply'}
                </button>
              )}
            </div>

            {promoError && (
              <p className="text-xs text-rose-600 mt-1">{promoError}</p>
            )}

            {appliedPromo && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isMr
                    ? `कूपन '${appliedPromo.code}' लागू झाले! ₹${appliedPromo.discount_amount} अतिरिक्त सूट.`
                    : `Coupon '${appliedPromo.code}' applied! Saved ₹${appliedPromo.discount_amount}.`}
                </span>
              </div>
            )}

            {/* Quick Promo Suggestions */}
            {!appliedPromo && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <span>{isMr ? 'सक्रिय कोड्स:' : 'Active coupons:'}</span>
                <button
                  type="button"
                  onClick={() => setPromoCode('MPSC2026')}
                  className="px-1.5 py-0.5 font-mono text-amber-700 bg-amber-50 hover:bg-amber-100 rounded cursor-pointer transition-colors"
                >
                  MPSC2026 (20% Off)
                </button>
                <button
                  type="button"
                  onClick={() => setPromoCode('TOPPER50')}
                  className="px-1.5 py-0.5 font-mono text-amber-700 bg-amber-50 hover:bg-amber-100 rounded cursor-pointer transition-colors"
                >
                  TOPPER50 (50% Off)
                </button>
              </div>
            )}
          </div>

          {/* Pricing Ledger */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            {strikePrice && (
              <div className="flex justify-between text-slate-400 line-through text-xs">
                <span>{isMr ? 'मूळ पॅकेज मूल्य' : 'Package MRP'}</span>
                <span className="font-mono tabular-nums">₹{strikePrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{isMr ? 'ऑफर मूल्य' : 'Base Price'}</span>
              <span className="font-mono tabular-nums">₹{basePrice.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>{isMr ? 'कूपन सूट' : 'Coupon Discount'}</span>
                <span className="font-mono tabular-nums">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200/80 pt-2">
              <span>{isMr ? 'एकूण देय रक्कम' : 'Total Payable'}</span>
              <span className="font-mono tabular-nums text-amber-600">₹{finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isMr ? 'व्हेरिफाय होत आहे...' : 'Verifying with Server...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {isPackage
                      ? (isMr
                          ? `Razorpay द्वारे ₹${finalPrice.toFixed(2)} भरा व संपूर्ण पॅकेज अनलॉक करा`
                          : `Pay ₹${finalPrice.toFixed(2)} via Razorpay & Unlock Package`)
                      : (isMr
                          ? `Razorpay द्वारे ₹${finalPrice.toFixed(2)} भरा व अनलॉक करा`
                          : `Pay ₹${finalPrice.toFixed(2)} via Razorpay & Unlock`)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isMr
                  ? 'सुरक्षित २२४-बिट एन्क्रिप्टेड पेमेंट · त्वरित सर्व चाचण्या अनलॉक'
                  : 'HMAC SHA-256 Server Signature Verification · Instant Test Access'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
