import { create } from 'zustand';
import { api } from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface AddressItem {
  _id: string;
  recipientName: string;
  phone: string;
  alternatePhone?: string;
  houseOrFlat: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  addresses: AddressItem[];
  initAuth: () => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  logout: () => void;
  fetchAddresses: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  addresses: [],

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('mithai_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({
        user: {
          id: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone,
          role: res.data.user.role,
        },
        token,
        isAuthenticated: true,
        addresses: res.data.addresses || [],
        isLoading: false,
      });
    } catch (err) {
      localStorage.removeItem('mithai_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('mithai_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      await get().fetchAddresses();
      return { success: true, user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  },

  register: async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const { token, user } = res.data;
      localStorage.setItem('mithai_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('mithai_token');
    set({ user: null, token: null, isAuthenticated: false, addresses: [] });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  fetchAddresses: async () => {
    try {
      const res = await api.get('/auth/addresses');
      set({ addresses: res.data });
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    set((state) => ({
      user: state.user ? { ...state.user, ...res.data } : null,
    }));
  },
}));
