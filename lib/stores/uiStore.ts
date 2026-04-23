import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Modal {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface UIState {
  toasts: Toast[];
  modals: Modal[];
  isLoading: boolean;
  loadingMessage: string;

  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal actions
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  clearModals: () => void;

  // Loading state
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  modals: [],
  isLoading: false,
  loadingMessage: '',

  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: `toast-${Date.now()}`,
        },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  openModal: (modal) =>
    set((state) => ({
      modals: [
        ...state.modals,
        {
          ...modal,
          id: `modal-${Date.now()}`,
        },
      ],
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),

  clearModals: () => set({ modals: [] }),

  setLoading: (isLoading, message = '') =>
    set({ isLoading, loadingMessage: message }),
}));
