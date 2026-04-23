import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookingState {
  // Step 1: Date & Vehicle Selection
  vehicleId: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  durationDays: number;
  estimatedPrice: number;
  promoCode: string | null;

  // Step 2: Delivery Options
  deliveryType: 'store' | 'hotel' | 'airport' | null;
  deliveryAddress: string;

  // Step 3: Add-ons (skipped - all free)
  // Step 4: Customer Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  pickupNotes: string;

  // Step 5: Deposit/Document
  depositMethod: 'cash' | 'passport' | null;
  passportCopy: File | null;

  // Step 6: Payment Method
  paymentMethod: 'maya' | 'gcash' | 'cash_on_delivery' | null;

  // Step 7: Confirmation
  bookingReference: string | null;

  // UI State
  currentStep: number;

  // Actions
  setVehicle: (vehicleId: string, price: number) => void;
  setDates: (pickupDate: string, returnDate: string) => void;
  setDelivery: (type: 'store' | 'hotel' | 'airport', address?: string) => void;
  setPromoCode: (code: string | null) => void;
  setCustomerInfo: (info: Partial<BookingState>) => void;
  setDepositMethod: (method: 'cash' | 'passport', file?: File) => void;
  setPaymentMethod: (method: 'maya' | 'gcash' | 'cash_on_delivery') => void;
  setConfirmation: (reference: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  vehicleId: null,
  pickupDate: null,
  returnDate: null,
  durationDays: 0,
  estimatedPrice: 0,
  promoCode: null,
  deliveryType: null,
  deliveryAddress: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationality: '',
  pickupNotes: '',
  depositMethod: null,
  passportCopy: null,
  paymentMethod: null,
  bookingReference: null,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,

      setVehicle: (vehicleId, price) =>
        set({ vehicleId, estimatedPrice: price }),

      setDates: (pickupDate, returnDate) => {
        const days = Math.ceil(
          (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        set({ pickupDate, returnDate, durationDays: days });
      },

      setDelivery: (type, address = '') =>
        set({ deliveryType: type, deliveryAddress: address }),

      setPromoCode: (code) =>
        set({ promoCode: code }),

      setCustomerInfo: (info) => set(info),

      setDepositMethod: (method, file) =>
        set({ depositMethod: method, passportCopy: file || null }),

      setPaymentMethod: (method) => set({ paymentMethod: method }),

      setConfirmation: (reference) =>
        set({ bookingReference: reference }),

      nextStep: () =>
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 7) })),

      prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      goToStep: (step) => set({ currentStep: step }),

      reset: () => set(initialState),
    }),
    {
      name: 'booking-store',
      partialize: (state) => ({
        vehicleId: state.vehicleId,
        pickupDate: state.pickupDate,
        returnDate: state.returnDate,
        durationDays: state.durationDays,
        estimatedPrice: state.estimatedPrice,
        promoCode: state.promoCode,
        deliveryType: state.deliveryType,
        deliveryAddress: state.deliveryAddress,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        nationality: state.nationality,
        pickupNotes: state.pickupNotes,
      }),
    }
  )
);
