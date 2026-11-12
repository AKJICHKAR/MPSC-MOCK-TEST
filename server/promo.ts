import { db } from './db';
import { PromoCode } from '../src/types';

export interface PromoValidationResult {
  valid: boolean;
  message?: string;
  promo?: PromoCode;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export function validateAndApplyPromo(
  code: string,
  originalPrice: number,
  testId?: string,
  packageId?: string
): PromoValidationResult {
  if (!code || !code.trim()) {
    return {
      valid: false,
      message: 'Promo code is required',
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  const promo = db.findPromoCode(code);
  if (!promo) {
    return {
      valid: false,
      message: 'Invalid promo code. Please check and try again.',
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  if (!promo.is_active) {
    return {
      valid: false,
      message: 'This promo code is currently inactive.',
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  const now = new Date();
  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return {
      valid: false,
      message: 'This promo code offer has not started yet.',
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return {
      valid: false,
      message: 'This promo code has expired.',
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  if (promo.usage_limit !== null && promo.usage_limit !== undefined && promo.times_used >= promo.usage_limit) {
    return {
      valid: false,
      message: 'Promo code usage limit has been reached.',
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  if (originalPrice < promo.min_order_amount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${promo.min_order_amount} required to use this coupon.`,
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice
    };
  }

  if (testId && promo.eligible_test_ids && promo.eligible_test_ids.length > 0) {
    if (!promo.eligible_test_ids.includes(testId)) {
      return {
        valid: false,
        message: 'This promo code is not applicable for this specific item.',
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice
      };
    }
  }

  let discount = 0;
  if (promo.discount_type === 'percentage') {
    discount = (originalPrice * promo.discount_value) / 100;
    if (promo.max_discount_amount && discount > promo.max_discount_amount) {
      discount = promo.max_discount_amount;
    }
  } else if (promo.discount_type === 'fixed') {
    discount = Math.min(promo.discount_value, originalPrice);
  }

  // Round to 2 decimals
  discount = Math.round(discount * 100) / 100;
  const finalPrice = Math.max(0, Math.round((originalPrice - discount) * 100) / 100);

  return {
    valid: true,
    promo,
    originalPrice,
    discountAmount: discount,
    finalPrice
  };
}
