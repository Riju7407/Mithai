import { IProduct } from '../models/Product';
import { ICoupon } from '../models/Coupon';
import { ISetting } from '../models/Setting';

export interface ICalculatedItem {
  product: string; // ObjectId string
  productName: string;
  variantName?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
}

export interface IPricingCalculationResult {
  items: ICalculatedItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  packagingExtra: number;
  grandTotal: number;
  advanceDepositRequired?: number;
  balanceAmountDue?: number;
}

export const resolveProductUnitPrice = (
  product: IProduct,
  variantName?: string,
  quantity: number = 1
): { unitPrice: number; unit: string; matchedVariantName?: string } => {
  // 1. If variant is selected
  if (variantName && product.variants && product.variants.length > 0) {
    const matched = product.variants.find((v) => v.name === variantName);
    if (matched) {
      const price = matched.discountedPrice !== undefined && matched.discountedPrice > 0
        ? matched.discountedPrice
        : matched.price;
      return { unitPrice: price, unit: matched.unit, matchedVariantName: matched.name };
    }
  }

  // 2. Check bulk pricing tiers if order quantity qualifies
  if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
    const tier = product.bulkPricingTiers.find((t) => {
      const minOk = quantity >= t.minQty;
      const maxOk = t.maxQty ? quantity <= t.maxQty : true;
      return minOk && maxOk;
    });

    if (tier) {
      return { unitPrice: tier.pricePerUnit, unit: tier.unit };
    }
  }

  // 3. Fallback to base final price
  return {
    unitPrice: product.finalPrice || product.basePrice,
    unit: product.weightUnit || 'kg',
  };
};

export const calculateOrderTotals = (
  calculatedItems: ICalculatedItem[],
  settings: ISetting,
  coupon?: ICoupon | null,
  deliveryMethod: 'DELIVERY' | 'TAKEAWAY' = 'DELIVERY',
  packagingExtraPrice: number = 0,
  isAdvanceBooking: boolean = false
): IPricingCalculationResult => {
  const subtotal = calculatedItems.reduce((acc, item) => acc + item.subtotal, 0);

  // Calculate discount from coupon
  let discount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (coupon && coupon.isActive) {
    const now = new Date();
    if (now >= new Date(coupon.startDate) && now <= new Date(coupon.endDate)) {
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          const rawDiscount = (subtotal * coupon.discountValue) / 100;
          discount = coupon.maxDiscountAmount
            ? Math.min(rawDiscount, coupon.maxDiscountAmount)
            : rawDiscount;
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
        appliedCouponCode = coupon.code;
      }
    }
  }

  // Delivery fee calculation
  let deliveryFee = 0;
  if (deliveryMethod === 'DELIVERY') {
    if (subtotal < settings.freeDeliveryThreshold) {
      deliveryFee = settings.standardDeliveryFee;
    }
  }

  // Tax calculation (GST)
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round((taxableAmount * (settings.gstRate || 5)) / 100);

  const packagingExtra = Math.max(0, packagingExtraPrice);

  const grandTotal = Math.max(0, taxableAmount + deliveryFee + tax + packagingExtra);

  let advanceDepositRequired = 0;
  let balanceAmountDue = 0;

  if (isAdvanceBooking) {
    const depositPct = settings.advanceDepositPercentage || 30;
    advanceDepositRequired = Math.round((grandTotal * depositPct) / 100);
    balanceAmountDue = grandTotal - advanceDepositRequired;
  }

  return {
    items: calculatedItems,
    subtotal,
    discount,
    couponCode: appliedCouponCode,
    deliveryFee,
    tax,
    packagingExtra,
    grandTotal,
    advanceDepositRequired: isAdvanceBooking ? advanceDepositRequired : undefined,
    balanceAmountDue: isAdvanceBooking ? balanceAmountDue : undefined,
  };
};
