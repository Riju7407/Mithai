import { create } from 'zustand';

export interface BookingProductItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

interface BookingState {
  step: number;
  eventType: string;
  eventName: string;
  eventDate: string;
  numberOfGuests: number;
  deliveryDate: string;
  deliverySlot: string;
  contactNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: {
    recipientName: string;
    phone: string;
    houseOrFlat: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  packagingOptionId: string;
  packagingOptionName: string;
  packagingExtraPrice: number;
  customRequirements: string;
  specialInstructions: string;
  customMessage: string;
  paymentPreference: 'DEPOSIT' | 'FULL';
  selectedItems: BookingProductItem[];
  setStep: (step: number) => void;
  updateBookingData: (data: Partial<BookingState>) => void;
  addBookingItem: (item: BookingProductItem) => void;
  updateBookingItemQty: (productId: string, quantity: number, unitPrice?: number) => void;
  removeBookingItem: (productId: string) => void;
  resetBooking: () => void;
}

const initialAddress = {
  recipientName: '',
  phone: '',
  houseOrFlat: '',
  street: '',
  landmark: '',
  city: 'Jaipur',
  state: 'Rajasthan',
  pincode: '302001',
};

export const useBookingStore = create<BookingState>((set, get) => ({
  step: 1,
  eventType: 'Wedding Celebration',
  eventName: '',
  eventDate: '',
  numberOfGuests: 100,
  deliveryDate: '',
  deliverySlot: 'Morning (09:00 AM - 11:30 AM)',
  contactNumber: '',
  customerName: '',
  customerEmail: '',
  deliveryAddress: initialAddress,
  packagingOptionId: '',
  packagingOptionName: 'Classic Heritage Box',
  packagingExtraPrice: 0,
  customRequirements: '',
  specialInstructions: '',
  customMessage: '',
  paymentPreference: 'DEPOSIT',
  selectedItems: [],

  setStep: (step) => set({ step }),

  updateBookingData: (data) => set((state) => ({ ...state, ...data })),

  addBookingItem: (item) => {
    set((state) => {
      const existing = state.selectedItems.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          selectedItems: state.selectedItems.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { selectedItems: [...state.selectedItems, item] };
    });
  },

  updateBookingItemQty: (productId, quantity, unitPrice) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          selectedItems: state.selectedItems.filter((i) => i.productId !== productId),
        };
      }
      return {
        selectedItems: state.selectedItems.map((i) =>
          i.productId === productId
            ? { ...i, quantity, ...(unitPrice ? { unitPrice } : {}) }
            : i
        ),
      };
    });
  },

  removeBookingItem: (productId) => {
    set((state) => ({
      selectedItems: state.selectedItems.filter((i) => i.productId !== productId),
    }));
  },

  resetBooking: () =>
    set({
      step: 1,
      eventType: 'Wedding Celebration',
      eventName: '',
      eventDate: '',
      numberOfGuests: 100,
      deliveryDate: '',
      contactNumber: '',
      customerName: '',
      customerEmail: '',
      deliveryAddress: initialAddress,
      packagingOptionId: '',
      packagingOptionName: 'Classic Heritage Box',
      packagingExtraPrice: 0,
      customRequirements: '',
      specialInstructions: '',
      customMessage: '',
      paymentPreference: 'DEPOSIT',
      selectedItems: [],
    }),
}));
