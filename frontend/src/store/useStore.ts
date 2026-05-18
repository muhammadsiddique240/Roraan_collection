import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Order, ProductStatus, OrderStatus } from '@/types';
import {
  fetchProducts,
  fetchOrders,
  fetchLatestProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrderWebsite,
  createOrderWhatsapp,
  updateOrderStatus,
  acceptOrder as acceptOrderApi,
  rejectOrder as rejectOrderApi,
  bulkUpdateOrders as bulkUpdateOrdersApi,
  fetchDashboardStats,
  fetchProfile,
  updateProfile as updateProfileApi,
} from '@/services/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  message: string;
  type: 'website_payment' | 'whatsapp_inquiry';
  orderId: string;
  timestamp: number;
}

interface StoreState {
  products: Product[];
  latestProducts: Product[];
  orders: Order[];
  cart: Product[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  dashboardStats: any;
  isAuthenticated: boolean;
  token: string | null;
  notifications: Notification[];
  user: any | null;
  initializeData: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addProduct: (payload: any) => Promise<void>;
  updateProductStatus: (id: string, status: ProductStatus) => Promise<void>;
  editProduct: (id: string, payload: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrderWebsite: (order: any) => Promise<Order>;
  addOrderWhatsapp: (order: any) => Promise<Order>;
  addOrder: (order: any) => Promise<Order>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  acceptOrder: (id: string) => Promise<void>;
  rejectOrder: (id: string) => Promise<void>;
  bulkUpdateOrders: (ids: string[], status: string) => Promise<void>;
  login: (token: string) => void;
  logout: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  updateUserProfile: (payload: any) => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      latestProducts: [],
      orders: [],
      cart: [],
      isLoading: false,
      isError: false,
      error: null,
      dashboardStats: null,
      isAuthenticated: false,
      token: null,
      notifications: [],
      user: null,

      initializeData: async () => {
        set({ isLoading: true, isError: false, error: null });
        try {
          const results = await Promise.allSettled([
            fetchProducts(),
            fetchLatestProducts(),
            fetchOrders(),
            fetchDashboardStats(),
            fetchProfile(),
          ]);

          let products = results[0].status === 'fulfilled' ? results[0].value : [];
          let latestProducts = results[1].status === 'fulfilled' ? results[1].value : [];
          const orders = results[2].status === 'fulfilled' ? results[2].value : [];
          const stats = results[3].status === 'fulfilled' ? results[3].value : null;
          const user = results[4].status === 'fulfilled' ? results[4].value : null;

          // Add dummy products if no real products found (Demo Mode)
          if (products.length === 0) {
            const dummyData = [
              {
                id: 'dummy-1',
                title: 'Nike Air Jordan 1 High',
                brand: 'Nike',
                category: 'Sneakers',
                size: { eu: '44', cm: '28' },
                condition: 'Excellent',
                price: 48500,
                images: ['/images/dummy/product1.webp'],
                status: 'AVAILABLE',
                description: 'Classic high-top sneakers in excellent condition.',
                viewCount: 154,
                isLatest: true,
                isNewArrival: true,
                isNew: false,
                createdAt: new Date().toISOString(),
              },
              {
                id: 'dummy-2',
                title: 'Adidas Forum Low',
                brand: 'Adidas',
                category: 'Sneakers',
                size: { eu: '42', cm: '26.5' },
                condition: 'Near Deadstock',
                price: 32000,
                images: ['/images/dummy/product2.webp'],
                status: 'AVAILABLE',
                description: 'Sleek white and blue Adidas Forum Low.',
                viewCount: 89,
                isLatest: true,
                isNewArrival: false,
                isNew: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: 'dummy-3',
                title: 'New Balance 550',
                brand: 'New Balance',
                category: 'Sneakers',
                size: { eu: '43', cm: '27.5' },
                condition: 'Very Good',
                price: 28000,
                images: ['/images/dummy/product3.webp'],
                status: 'AVAILABLE',
                description: 'Trendy vintage style sneakers.',
                viewCount: 210,
                isLatest: false,
                isNewArrival: true,
                isNew: false,
                createdAt: new Date().toISOString(),
              },
              {
                id: 'dummy-4',
                title: 'Vans Old Skool Pro',
                brand: 'Vans',
                category: 'Sneakers',
                size: { eu: '41', cm: '26' },
                condition: 'Good',
                price: 15000,
                images: ['/images/dummy/product4.webp'],
                status: 'AVAILABLE',
                description: 'Durable and classic skate shoes.',
                viewCount: 45,
                isLatest: false,
                isNewArrival: false,
                isNew: false,
                createdAt: new Date().toISOString(),
              }
            ];
            products = dummyData as any;
            latestProducts = dummyData.filter(d => d.isLatest) as any;
          }

          set({ products, latestProducts, orders, dashboardStats: stats, user, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, isError: true });
        }
      },

      addToCart: (product) => {
        if (get().cart.find(p => p.id === product.id)) return;
        set({ cart: [...get().cart, product] });
      },

      removeFromCart: (productId) => set({
        cart: get().cart.filter(p => p.id !== productId)
      }),

      clearCart: () => set({ cart: [] }),

      addProduct: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const created = await createProduct(formData);
          set({ products: [created, ...get().products], isLoading: false });
          toast.success('Product Added');
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          toast.error('Upload Failed');
        }
      },

      updateProductStatus: async (id, status) => {
        try {
          const updated = await updateProduct(id, { status });
          set({
            products: get().products.map((p) => (p.id === id ? updated : p)),
          });
          toast.success('Inventory Updated');
        } catch (error: any) {
          toast.error('Update Failed');
        }
      },

      editProduct: async (id, payload) => {
        try {
          const updated = await updateProduct(id, payload);
          set({
            products: get().products.map((p) => (p.id === id ? updated : p)),
            latestProducts: get().latestProducts.map((p) => (p.id === id ? updated : p)),
          });
          toast.success('Saved Changes');
        } catch (error: any) {
          toast.error('Save Failed');
        }
      },

      deleteProduct: async (id) => {
        try {
          await deleteProduct(id);
          set({
            products: get().products.filter((p) => p.id !== id),
            latestProducts: get().latestProducts.filter((p) => p.id !== id),
          });
          toast.success('Item Deleted');
        } catch (error: any) {
          toast.error('Delete Failed');
        }
      },

      addOrderWebsite: async (order) => {
        set({ isLoading: true, error: null, isError: false });
        try {
          const created = await createOrderWebsite(order);
          set({
            orders: [created, ...get().orders],
            products: get().products.map((p) =>
              p.id === created.productId ? { ...p, status: 'RESERVED' as ProductStatus } : p
            ),
            isLoading: false,
          });
          // Add notification for admin
          get().addNotification({
            message: `New Website Payment from ${order.customerName}`,
            type: 'website_payment',
            orderId: created.id,
          });
          toast.success('Payment Submitted Successfully');
          return created;
        } catch (error: any) {
          const errMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Order failed';
          set({ isLoading: false, isError: true, error: errMsg });
          if (error.response?.status === 409) {
            toast.error('Sorry, this unique item was just sold!');
          } else {
            toast.error(errMsg);
          }
          throw error;
        }
      },

      addOrderWhatsapp: async (order) => {
        set({ isLoading: true, error: null, isError: false });
        try {
          const created = await createOrderWhatsapp(order);
          set({
            orders: [created, ...get().orders],
            products: get().products.map((p) =>
              p.id === created.productId ? { ...p, status: 'RESERVED' as ProductStatus } : p
            ),
            isLoading: false,
          });
          // Add notification for admin
          get().addNotification({
            message: `New WhatsApp Inquiry for ${order.customerName}`,
            type: 'whatsapp_inquiry',
            orderId: created.id,
          });
          toast.success('Order Placed Successfully');
          return created;
        } catch (error: any) {
          const errMsg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Order failed';
          set({ isLoading: false, isError: true, error: errMsg });
          if (error.response?.status === 409) {
            toast.error('Sorry, this unique item was just sold!');
          } else {
            toast.error(errMsg);
          }
          throw error;
        }
      },

      // Legacy compat
      addOrder: async (order) => {
        return get().addOrderWhatsapp(order);
      },

      updateOrderStatus: async (id, status) => {
        try {
          const updated = await updateOrderStatus(id, status);
          set({
            orders: get().orders.map((o) => (o.id === id ? updated : o)),
          });
          toast.success('Status Updated');
        } catch (error: any) {
          set({ error: error.message });
          toast.error('Update Failed');
        }
      },

      acceptOrder: async (id) => {
        try {
          const updated = await acceptOrderApi(id);
          set({
            orders: get().orders.map((o) => (o.id === id ? updated : o)),
            products: get().products.map((p) =>
              p.id === updated.productId ? { ...p, status: 'SOLD' as ProductStatus } : p
            ),
          });
          toast.success('Order Confirmed ✅');
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Accept Failed');
        }
      },

      rejectOrder: async (id) => {
        try {
          const updated = await rejectOrderApi(id);
          set({
            orders: get().orders.map((o) => (o.id === id ? updated : o)),
            products: get().products.map((p) =>
              p.id === updated.productId ? { ...p, status: 'AVAILABLE' as ProductStatus } : p
            ),
          });
          toast.success('Order Rejected. Item back in stock.');
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Reject Failed');
        }
      },

      bulkUpdateOrders: async (ids, status) => {
        set({ isLoading: true });
        try {
          await bulkUpdateOrdersApi(ids, status);
          const orders = await fetchOrders();
          set({ orders, isLoading: false });
          toast.success(`${ids.length} Orders Updated`);
        } catch (error: any) {
          set({ isLoading: false });
          toast.error('Bulk Update Failed');
        }
      },

      login: (token) => {
        localStorage.setItem('roraan_token', token);
        set({ isAuthenticated: true, token });
      },

      logout: () => {
        localStorage.removeItem('roraan_token');
        set({ isAuthenticated: false, token: null });
      },

      addNotification: (n) => {
        const notification: Notification = {
          ...n,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set({ notifications: [notification, ...get().notifications].slice(0, 20) });
      },

      dismissNotification: (id) => {
        set({ notifications: get().notifications.filter(n => n.id !== id) });
      },

      updateUserProfile: async (payload) => {
        set({ isLoading: true });
        try {
          const updatedUser = await updateProfileApi(payload);
          set({ user: updatedUser, isLoading: false });
          toast.success('Profile Updated');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Update Failed');
          throw error;
        }
      },
    }),
    {
      name: 'roraan-archive-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        cart: state.cart,
        notifications: state.notifications,
      }),
    }
  )
);
