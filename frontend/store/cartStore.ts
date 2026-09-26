import { create } from 'zustand';

export interface CartItem {
  productId: string;
  slug: string;
  productName: string;
  variantName?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  dietary?: 'VEG' | 'NON_VEG';
  isSugarFree?: boolean;
  availableForInstant: boolean;
  availableForAdvance: boolean;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  orderType: 'INSTANT' | 'ADVANCE_BOOKING';
  couponCode: string | null;
  couponDiscount: number;
  setOrderType: (type: 'INSTANT' | 'ADVANCE_BOOKING') => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, variantName: string | undefined, delta: number) => void;
  setQuantity: (productId: string, variantName: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantName?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'INSTANT',
  couponCode: null,
  couponDiscount: 0,

  setOrderType: (type) => set({ orderType: type }),

  addItem: (item, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantName === item.variantName
      );

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += quantity;
        return { items: newItems };
      }

      return {
        items: [...state.items, { ...item, quantity }],
      };
    });
  },

  updateQuantity: (productId, variantName, delta) => {
    set((state) => {
      const newItems = state.items
        .map((i) => {
          if (i.productId === productId && i.variantName === variantName) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];

      return { items: newItems };
    });
  },

  setQuantity: (productId, variantName, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantName === variantName)
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.productId === productId && i.variantName === variantName
            ? { ...i, quantity }
            : i
        ),
      };
    });
  },

  removeItem: (productId, variantName) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.productId === productId && i.variantName === variantName)
      ),
    }));
  },

  clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

  applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

  removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

  getItemCount: () => {
    return get().items.reduce((acc, i) => acc + i.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  },
}));
