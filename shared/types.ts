export type UserRole = 'CUSTOMER' | 'ADMIN';

export type DietaryType = 'VEG' | 'NON_VEG';

export type OrderType = 'INSTANT' | 'ADVANCE_BOOKING';

export type InstantOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type AdvanceBookingStatus =
  | 'Received'
  | 'Advance Confirmed'
  | 'Scheduled'
  | 'In Production'
  | 'Dispatched'
  | 'Fulfilled'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending'
  | 'Partial'
  | 'Paid'
  | 'Failed'
  | 'Refunded';

export type PaymentType = 'FULL' | 'DEPOSIT' | 'BALANCE';

export interface IBulkPricingTier {
  minQty: number; // e.g. 10
  maxQty?: number; // e.g. 25, or null for unbounded
  pricePerUnit: number; // e.g. 750
  unit: string; // e.g. 'kg'
}

export interface IProductVariant {
  name: string; // e.g. '1 Kg', '500 gm', '250 gm', '1 Box'
  weightOrPieces: number; // e.g. 1, 0.5, 0.25
  unit: string; // 'kg' | 'gm' | 'pc' | 'box'
  price: number;
  discountedPrice?: number;
  isDefault?: boolean;
}

export interface IPackagingOption {
  _id?: string;
  name: string;
  description: string;
  extraPrice: number;
  imageUrl?: string;
  isDefault?: boolean;
}

export interface IEventType {
  _id?: string;
  name: string;
  description?: string;
  iconName?: string;
  active: boolean;
}

export interface IDeliverySlot {
  _id?: string;
  title: string; // e.g. "09:00 AM - 11:00 AM"
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  maxCapacity: number; // e.g. 20
  active: boolean;
  orderType: 'ALL' | 'INSTANT' | 'ADVANCE_BOOKING';
}

export type FoodCategory =
  | 'All'
  | 'Royal Thalis'
  | 'Starters & Kebabs'
  | 'Main Course'
  | 'Biryani & Rice'
  | 'Tandoor & Breads'
  | 'Chaats & Street Food'
  | 'Beverages & Lassi'
  | 'Desserts';

export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy' | 'None';

export interface IRestaurantSettings {
  restaurantName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  currency: string;
  currencySymbol: string;
  gstRate: number; // percentage, e.g. 5
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
  minAdvanceBookingDays: number; // e.g. 3
  maxAdvanceBookingDays: number; // e.g. 60
  advanceDepositPercentage: number; // e.g. 30 (30% deposit)
  instantOrderCutoffTime: string; // e.g. "21:00"
  enableRazorpayTestMode: boolean;
}

