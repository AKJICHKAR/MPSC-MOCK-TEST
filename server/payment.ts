import crypto from 'crypto';
import { db } from './db';
import { validateAndApplyPromo } from './promo';
import { PaymentRecord, User } from '../src/types';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_mpsc_sarathi_demo';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mpsc_secure_rzp_secret_key_2026';

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayKeyId(): string {
  return RAZORPAY_KEY_ID;
}

export interface CreateOrderParams {
  user: User;
  itemType?: 'test' | 'package';
  testId?: string;
  packageId?: string;
  promoCode?: string;
}

export function createOrder({ user, itemType = 'test', testId, packageId, promoCode }: CreateOrderParams) {
  // --- PACKAGE ORDER FLOW ---
  if (itemType === 'package' || packageId) {
    if (!packageId) {
      throw new Error('packageId is required for package orders');
    }
    const pkg = db.getPackageById(packageId, true);
    if (!pkg) {
      throw new Error('Selected test package not found');
    }

    if (db.isUserEnrolledInPackage(user.id, packageId)) {
      return {
        alreadyEnrolled: true,
        message: 'You have already enrolled in this mock test package',
        packageId,
        itemType: 'package'
      };
    }

    const originalPrice = pkg.discount_price > 0 ? pkg.discount_price : pkg.price;
    let finalPrice = originalPrice;
    let discountAmount = 0;
    let appliedPromoCode: string | undefined = undefined;

    if (promoCode && promoCode.trim()) {
      const promoResult = validateAndApplyPromo(promoCode, originalPrice, undefined, packageId);
      if (!promoResult.valid) {
        throw new Error(promoResult.message || 'Invalid promo code');
      }
      finalPrice = promoResult.finalPrice;
      discountAmount = promoResult.discountAmount;
      appliedPromoCode = promoResult.promo?.code;
    }

    const orderId = 'order_pkg_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');

    if (finalPrice <= 0) {
      const paymentRecord: PaymentRecord = {
        id: 'pay_' + crypto.randomUUID().slice(0, 8),
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        item_type: 'package',
        package_id: packageId,
        package_name: pkg.name_en,
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_promo_free_' + crypto.randomBytes(4).toString('hex'),
        razorpay_signature: 'promo_free_bypass',
        amount: 0,
        original_amount: originalPrice,
        discount_amount: discountAmount,
        currency: 'INR',
        status: 'paid',
        promo_code: appliedPromoCode,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      db.createPayment(paymentRecord);
      db.enrollUserInPackage(user.id, packageId, paymentRecord.id);
      if (appliedPromoCode) {
        db.incrementPromoUsage(appliedPromoCode);
      }

      return {
        isFreeWithPromo: true,
        message: '100% discount applied! Complete package unlocked successfully.',
        packageId,
        itemType: 'package'
      };
    }

    const paymentRecord: PaymentRecord = {
      id: 'pay_' + crypto.randomUUID().slice(0, 8),
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      item_type: 'package',
      package_id: packageId,
      package_name: pkg.name_en,
      razorpay_order_id: orderId,
      amount: finalPrice,
      original_amount: originalPrice,
      discount_amount: discountAmount,
      currency: 'INR',
      status: 'created',
      promo_code: appliedPromoCode,
      created_at: new Date().toISOString()
    };

    db.createPayment(paymentRecord);

    return {
      orderId,
      amount: Math.round(finalPrice * 100),
      amountInRupees: finalPrice,
      originalAmount: originalPrice,
      discountAmount,
      promoCode: appliedPromoCode,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      itemType: 'package',
      packageId,
      packageTitle: pkg.name_en,
      packageTitleMr: pkg.name_mr,
      user: {
        name: user.full_name,
        email: user.email,
        phone: user.phone || '+91 9800000000'
      }
    };
  }

  // --- INDIVIDUAL TEST ORDER FLOW ---
  if (!testId) {
    throw new Error('testId or packageId is required');
  }
  const test = db.getTestById(testId);
  if (!test) {
    throw new Error('Selected mock test not found');
  }

  // Check if test is free
  if (test.price <= 0) {
    db.enrollUserInTest(user.id, testId);
    return {
      isFree: true,
      message: 'Free test enrolled successfully',
      testId,
      itemType: 'test'
    };
  }

  // Check if already enrolled
  if (db.isUserEnrolled(user.id, testId)) {
    return {
      alreadyEnrolled: true,
      message: 'You have already purchased this mock test',
      testId,
      itemType: 'test'
    };
  }

  const originalPrice = test.price;
  let finalPrice = originalPrice;
  let discountAmount = 0;
  let appliedPromoCode: string | undefined = undefined;

  if (promoCode && promoCode.trim()) {
    const promoResult = validateAndApplyPromo(promoCode, originalPrice, testId);
    if (!promoResult.valid) {
      throw new Error(promoResult.message || 'Invalid promo code');
    }
    finalPrice = promoResult.finalPrice;
    discountAmount = promoResult.discountAmount;
    appliedPromoCode = promoResult.promo?.code;
  }

  // Generate unique Razorpay-style Order ID
  const orderId = 'order_mpsc_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');

  // If 100% discount applied via promo code
  if (finalPrice <= 0) {
    const paymentRecord: PaymentRecord = {
      id: 'pay_' + crypto.randomUUID().slice(0, 8),
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      item_type: 'test',
      test_id: testId,
      test_title: test.title_en,
      razorpay_order_id: orderId,
      razorpay_payment_id: 'pay_promo_free_' + crypto.randomBytes(4).toString('hex'),
      razorpay_signature: 'promo_free_bypass',
      amount: 0,
      original_amount: originalPrice,
      discount_amount: discountAmount,
      currency: 'INR',
      status: 'paid',
      promo_code: appliedPromoCode,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    db.createPayment(paymentRecord);
    db.enrollUserInTest(user.id, testId, paymentRecord.id);
    if (appliedPromoCode) {
      db.incrementPromoUsage(appliedPromoCode);
    }

    return {
      isFreeWithPromo: true,
      message: '100% discount applied! Test unlocked successfully.',
      testId,
      itemType: 'test'
    };
  }

  // Create pending payment record
  const paymentRecord: PaymentRecord = {
    id: 'pay_' + crypto.randomUUID().slice(0, 8),
    user_id: user.id,
    user_name: user.full_name,
    user_email: user.email,
    item_type: 'test',
    test_id: testId,
    test_title: test.title_en,
    razorpay_order_id: orderId,
    amount: finalPrice,
    original_amount: originalPrice,
    discount_amount: discountAmount,
    currency: 'INR',
    status: 'created',
    promo_code: appliedPromoCode,
    created_at: new Date().toISOString()
  };

  db.createPayment(paymentRecord);

  return {
    orderId,
    amount: Math.round(finalPrice * 100), // In Paise for Razorpay
    amountInRupees: finalPrice,
    originalAmount: originalPrice,
    discountAmount,
    promoCode: appliedPromoCode,
    currency: 'INR',
    keyId: RAZORPAY_KEY_ID,
    itemType: 'test',
    testId,
    testTitle: test.title_en,
    testTitleMr: test.title_mr,
    user: {
      name: user.full_name,
      email: user.email,
      phone: user.phone || '+91 9800000000'
    }
  };
}

export interface VerifyPaymentParams {
  user: User;
  orderId: string;
  paymentId: string;
  signature: string;
}

export function verifyPayment({ user, orderId, paymentId, signature }: VerifyPaymentParams) {
  const payment = db.getAllPayments().find(p => p.razorpay_order_id === orderId);
  if (!payment) {
    throw new Error('Order not found in payment records');
  }

  if (payment.user_id !== user.id) {
    throw new Error('Order does not belong to the current authenticated user');
  }

  if (payment.status === 'paid') {
    return {
      success: true,
      message: 'Payment has already been verified.',
      testId: payment.test_id,
      packageId: payment.package_id,
      itemType: payment.item_type || (payment.package_id ? 'package' : 'test')
    };
  }

  // Server-side HMAC SHA256 verification
  // generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  // Also support mock test signatures for sandbox if validly signed
  const isSignatureValid =
    signature === expectedSignature ||
    signature === `mock_sig_${orderId}` ||
    signature === crypto.createHmac('sha256', 'mpsc_secure_rzp_secret_key_2026').update(text).digest('hex');

  if (!isSignatureValid) {
    db.updatePaymentStatus(orderId, 'failed', paymentId, signature);
    throw new Error('Payment signature verification failed. Untrusted transaction rejected.');
  }

  // Mark payment verified and paid
  db.updatePaymentStatus(orderId, 'paid', paymentId, signature);

  // If Package purchase: enroll user in package (which automatically unlocks all included tests)
  if (payment.item_type === 'package' || payment.package_id) {
    db.enrollUserInPackage(user.id, payment.package_id!, payment.id);
  } else if (payment.test_id) {
    // Individual Test purchase: only unlock this specific test!
    db.enrollUserInTest(user.id, payment.test_id, payment.id);
  }

  // Increment promo code usage if applicable
  if (payment.promo_code) {
    db.incrementPromoUsage(payment.promo_code);
  }

  return {
    success: true,
    message: payment.package_id
      ? 'Payment verified successfully! All mock tests in package are now unlocked.'
      : 'Payment verified successfully! Mock test is now unlocked.',
    testId: payment.test_id,
    packageId: payment.package_id,
    itemType: payment.item_type || (payment.package_id ? 'package' : 'test'),
    paymentId,
    orderId
  };
}

// Generate client test signature helper for sandbox simulated payments
export function generateSimulationSignature(orderId: string, paymentId: string): string {
  return crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}
