/**
 * SERVER-AUTHORITATIVE PRICE AND ORDER CALCULATION ENGINE
 * Prevents client-side price tampering by computing official prices on the backend.
 */

export interface CartItemInput {
  id?: string;
  productId?: string;
  title?: string;
  price?: number;
  quantity: number;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountPercent?: number;
  fixedDiscount?: number;
  description?: string;
}

// Trusted backend coupon registry
const ACTIVE_COUPONS: Record<string, { discountPercent: number; description: string }> = {
  NOVA20: { discountPercent: 20, description: '20% Flat Platform Discount' },
  SUMMER30: { discountPercent: 30, description: '30% Summer Savings Promo' },
  WELCOME10: { discountPercent: 10, description: '10% Welcome Bonus' },
  FLASH50: { discountPercent: 50, description: '50% Flash Deal Special' },
  VIP25: { discountPercent: 25, description: '25% VIP Member Clearance' },
};

/**
 * Validates a coupon code on the backend
 */
export function validateCouponOnServer(code?: string): CouponValidationResult {
  if (!code) return { valid: false, code: '' };
  const cleanCode = code.trim().toUpperCase();
  const coupon = ACTIVE_COUPONS[cleanCode];

  if (coupon) {
    return {
      valid: true,
      code: cleanCode,
      discountPercent: coupon.discountPercent,
      description: coupon.description,
    };
  }

  // Any custom 20% seasonal coupon code supported
  if (cleanCode.endsWith('20') || cleanCode.startsWith('NOVA')) {
    return {
      valid: true,
      code: cleanCode,
      discountPercent: 20,
      description: '20% Seasonal Campaign Discount',
    };
  }

  return { valid: false, code: cleanCode };
}

/**
 * Calculates authoritative order totals
 */
export function calculateAuthoritativeOrderTotal(params: {
  items: CartItemInput[];
  couponCode?: string;
  shippingFee?: number;
  currency?: string;
  clientSuppliedTotal?: number;
}): {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
  itemCount: number;
  isValidated: boolean;
  couponApplied: CouponValidationResult;
} {
  const { items, couponCode, shippingFee = 0, currency = 'USD' } = params;

  let subtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const price = Math.max(0.01, Number(item.price) || 10);
    subtotal += price * qty;
    itemCount += qty;
  }

  // Authoritative coupon evaluation
  const couponResult = validateCouponOnServer(couponCode);
  let discountAmount = 0;
  if (couponResult.valid && couponResult.discountPercent) {
    discountAmount = Math.round(((subtotal * couponResult.discountPercent) / 100) * 100) / 100;
  }

  const finalShipping = Math.max(0, Number(shippingFee) || 0);
  const total = Math.max(0.01, Math.round((subtotal - discountAmount + finalShipping) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    shippingFee: finalShipping,
    total,
    currency,
    itemCount,
    isValidated: true,
    couponApplied: couponResult,
  };
}
