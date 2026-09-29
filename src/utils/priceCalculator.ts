import { Product, BulkPriceAdjustmentParams } from '../types';

/**
 * Apply rounding rule to a price amount
 */
export function applyRoundingRule(
  amount: number,
  rule: BulkPriceAdjustmentParams['roundingRule'] = 'none'
): number {
  if (amount <= 0) return 100; // minimum floor

  switch (rule) {
    case 'nearest_10':
      return Math.round(amount / 10) * 10;
    case 'nearest_100':
      return Math.round(amount / 100) * 100;
    case 'nearest_1000':
      return Math.round(amount / 1000) * 1000;
    case 'end_in_99': {
      const floored = Math.floor(amount / 100) * 100;
      return Math.max(99, floored + 99);
    }
    case 'end_in_990': {
      const floored = Math.floor(amount / 1000) * 1000;
      return Math.max(990, floored + 990);
    }
    case 'none':
    default:
      return Math.round(amount);
  }
}

export interface CalculatedProductPrice {
  id: string;
  title: string;
  brand: string;
  category: string;
  image: string;
  currentPrice: number;
  currentOriginalPrice?: number;
  currentDiscountPercentage?: number;
  newPrice: number;
  newOriginalPrice?: number;
  newDiscountPercentage?: number;
  differenceAmount: number;
  differencePercentage: number;
  isExcluded?: boolean;
}

/**
 * Calculate the projected new price for a single product based on bulk parameters
 */
export function calculateNewProductPrice(
  product: Product,
  params: BulkPriceAdjustmentParams
): {
  newPrice: number;
  newOriginalPrice?: number;
  newDiscountPercentage?: number;
} {
  const currentPrice = Number(product.price) || 100;
  const currentOrigPrice = Number(product.originalPrice) || currentPrice;
  const val = Number(params.value) || 0;

  let computedPrice = currentPrice;
  let computedOrigPrice = currentOrigPrice;

  switch (params.mode) {
    case 'percentage_increase': {
      const multiplier = 1 + val / 100;
      computedPrice = currentPrice * multiplier;
      if (params.updateOriginalPrice === 'scale_proportionally') {
        computedOrigPrice = currentOrigPrice * multiplier;
      } else if (params.updateOriginalPrice === 'set_to_old_price') {
        computedOrigPrice = currentPrice;
      }
      break;
    }

    case 'percentage_decrease': {
      const multiplier = Math.max(0.01, 1 - val / 100);
      computedPrice = currentPrice * multiplier;
      if (params.updateOriginalPrice === 'set_to_old_price') {
        computedOrigPrice = currentPrice;
      } else if (params.updateOriginalPrice === 'scale_proportionally') {
        computedOrigPrice = currentOrigPrice * multiplier;
      }
      break;
    }

    case 'fixed_increase': {
      computedPrice = currentPrice + val;
      if (params.updateOriginalPrice === 'scale_proportionally') {
        computedOrigPrice = currentOrigPrice + val;
      } else if (params.updateOriginalPrice === 'set_to_old_price') {
        computedOrigPrice = currentPrice;
      }
      break;
    }

    case 'fixed_decrease': {
      computedPrice = Math.max(100, currentPrice - val);
      if (params.updateOriginalPrice === 'set_to_old_price') {
        computedOrigPrice = currentPrice;
      } else if (params.updateOriginalPrice === 'scale_proportionally') {
        computedOrigPrice = Math.max(computedPrice, currentOrigPrice - val);
      }
      break;
    }

    case 'set_fixed': {
      computedPrice = Math.max(100, val);
      if (params.updateOriginalPrice === 'set_to_old_price') {
        computedOrigPrice = currentPrice;
      }
      break;
    }

    case 'set_discount_from_msrp': {
      // Treats current originalPrice (or price) as MSRP and applies X% discount to determine new price
      const baseMsrp = currentOrigPrice > currentPrice ? currentOrigPrice : currentPrice;
      const discountRatio = Math.min(0.95, Math.max(0.01, val / 100));
      computedOrigPrice = baseMsrp;
      computedPrice = baseMsrp * (1 - discountRatio);
      break;
    }

    case 'reset_to_msrp': {
      // Revert price to originalPrice (removes any discount)
      computedPrice = currentOrigPrice;
      computedOrigPrice = currentOrigPrice;
      break;
    }
  }

  // Apply rounding
  const finalPrice = Math.max(100, applyRoundingRule(computedPrice, params.roundingRule));
  let finalOrigPrice = Math.max(finalPrice, applyRoundingRule(computedOrigPrice, params.roundingRule));

  if (params.updateOriginalPrice === 'clear' || params.mode === 'reset_to_msrp') {
    finalOrigPrice = finalPrice;
  }

  let newDiscountPercentage: number | undefined;
  if (finalOrigPrice > finalPrice) {
    newDiscountPercentage = Math.round(((finalOrigPrice - finalPrice) / finalOrigPrice) * 100);
  }

  return {
    newPrice: finalPrice,
    newOriginalPrice: finalOrigPrice > finalPrice ? finalOrigPrice : undefined,
    newDiscountPercentage: newDiscountPercentage && newDiscountPercentage > 0 ? newDiscountPercentage : undefined,
  };
}

/**
 * Generate preview list for all products matching filter/target criteria
 */
export function generateBulkPricePreview(
  products: Product[],
  params: BulkPriceAdjustmentParams,
  excludedIds: Set<string> = new Set()
): CalculatedProductPrice[] {
  // Filter targets
  const targetProducts = products.filter((p) => {
    if (params.productIds && params.productIds.length > 0) {
      return params.productIds.includes(p.id);
    }
    if (params.category && params.category !== 'ALL' && p.category.toLowerCase() !== params.category.toLowerCase()) {
      return false;
    }
    if (params.sellerId && params.sellerId !== 'ALL' && p.sellerId !== params.sellerId) {
      return false;
    }
    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase().trim();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return targetProducts.map((prod) => {
    const isExcluded = excludedIds.has(prod.id);
    if (isExcluded) {
      return {
        id: prod.id,
        title: prod.title,
        brand: prod.brand,
        category: prod.category,
        image: prod.images[0] || '',
        currentPrice: prod.price,
        currentOriginalPrice: prod.originalPrice,
        currentDiscountPercentage: prod.discountPercentage,
        newPrice: prod.price,
        newOriginalPrice: prod.originalPrice,
        newDiscountPercentage: prod.discountPercentage,
        differenceAmount: 0,
        differencePercentage: 0,
        isExcluded: true,
      };
    }

    const { newPrice, newOriginalPrice, newDiscountPercentage } = calculateNewProductPrice(prod, params);
    const diffAmount = newPrice - prod.price;
    const diffPercent = prod.price > 0 ? (diffAmount / prod.price) * 100 : 0;

    return {
      id: prod.id,
      title: prod.title,
      brand: prod.brand,
      category: prod.category,
      image: prod.images[0] || '',
      currentPrice: prod.price,
      currentOriginalPrice: prod.originalPrice,
      currentDiscountPercentage: prod.discountPercentage,
      newPrice,
      newOriginalPrice,
      newDiscountPercentage,
      differenceAmount: diffAmount,
      differencePercentage: diffPercent,
      isExcluded: false,
    };
  });
}
