import axios, { AxiosError } from 'axios';
import { Order, OrderStatus, Product, ProductStatus, CheckoutMethod } from '@/types';
import { siteConfig } from '@/config/siteConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Centralized Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for global error handling and tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('roraan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('roraan_token');
    }
    return Promise.reject(error);
  }
);

// --- Type Definitions for Backend Compatibility ---

type BackendProduct = {
  id: string;
  product_code?: string;
  title: string;
  description: string;
  brand_name?: string;
  category_name?: string;
  size_eu?: string;
  size_cm?: string;
  condition: string;
  original_price?: number;
  sale_price: number;
  image?: string;
  gallery?: Array<{ image: string }>;
  status: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_new: boolean;
  is_unisex: boolean;
  view_count: number;
  reserved_until?: string | null;
  created_at: string;
};

type BackendOrder = {
  id: string;
  order_code?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  total_amount: number;
  status: string;
  checkout_method: string;
  payment_screenshot_url?: string | null;
  transaction_id?: string;
  created_at: string;
  product: { id: string; title?: string; product_code?: string };
  trust_metrics?: any;
};

// --- Mapping Helpers ---

const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/placeholder.jpg';
  return url.replace(/^http:\/\/localhost:8000/, '');
};

const statusToFrontend = (status: string): ProductStatus => {
  const s = status.toLowerCase();
  if (s === 'sold') return 'SOLD';
  if (s === 'reserved') return 'RESERVED';
  return 'AVAILABLE';
};

const orderStatusToFrontend = (status: string): OrderStatus => {
  switch (status) {
    case 'pending_verification': return 'PENDING_VERIFICATION';
    case 'confirmed': return 'CONFIRMED';
    case 'shipped': return 'SHIPPED';
    case 'delivered': return 'DELIVERED';
    case 'rejected': return 'REJECTED';
    case 'canceled': return 'CANCELED';
    case 'whatsapp_pending': return 'WHATSAPP_PENDING';
    // Legacy
    case 'pending_advance': return 'PENDING_VERIFICATION';
    case 'confirmed_advance_received': return 'CONFIRMED';
    case 'dispatched': return 'SHIPPED';
    default: return 'PENDING_VERIFICATION';
  }
};

const toProduct = (item: any): Product => {
  const brand = item.brand_name || (typeof item.brand === 'string' ? item.brand : item.brand?.name) || 'Generic';
  const category = item.category_name || (typeof item.category === 'string' ? item.category : item.category?.name) || 'Archive';

  return {
    id: item.id,
    productCode: item.product_code,
    title: item.title,
    brand: brand,
    category: category,
    size: {
      eu: item.size_eu || item.size_pk || '',
      cm: item.size_cm || '',
    },
    condition: item.condition,
    price: Number(item.sale_price),
    originalPrice: item.original_price ? Number(item.original_price) : undefined,
    buyingPrice: item.buying_price ? Number(item.buying_price) : 0,
    images: [
      ...(item.image ? [normalizeImageUrl(item.image)] : []),
      ...(item.gallery?.map((g: any) => normalizeImageUrl(g.image)) || [])
    ].length > 0 ? [
      ...(item.image ? [normalizeImageUrl(item.image)] : []),
      ...(item.gallery?.map((g: any) => normalizeImageUrl(g.image)) || [])
    ] : ['/images/placeholder.jpg'],
    status: statusToFrontend(item.status),
    description: item.description,
    viewCount: item.view_count || 0,
    reservedUntil: item.reserved_until,
    isLatest: item.is_featured,
    isNewArrival: item.is_new_arrival,
    isNew: item.is_new,
    isUnisex: item.is_unisex || false,
    createdAt: item.created_at,
  };
};

const toOrder = (item: BackendOrder): Order => ({
  id: item.id,
  orderCode: item.order_code,
  customerName: item.customer_name,
  customerContact: item.customer_phone,
  customerEmail: item.customer_email,
  customerAddress: item.address,
  city: item.city,
  productId: item.product.id,
  productTitle: item.product.title,
  productCode: item.product.product_code,
  totalAmount: Number(item.total_amount),
  status: orderStatusToFrontend(item.status),
  checkoutMethod: (item.checkout_method as CheckoutMethod) || 'whatsapp',
  paymentScreenshotUrl: item.payment_screenshot_url ? normalizeImageUrl(item.payment_screenshot_url) : null,
  transactionId: item.transaction_id || '',
  createdAt: item.created_at,
  trustMetrics: item.trust_metrics,
});

// --- API Methods ---

export const fetchProducts = async (filters?: Record<string, any>): Promise<Product[]> => {
  const { data } = await api.get<BackendProduct[]>('/products/', { params: filters });
  return data.map(toProduct);
};

export const fetchLatestProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<BackendProduct[]>('/products/', { params: { latest: 'true', limit: 4 } });
  return data.map(toProduct);
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get<BackendProduct>(`/products/${id}/`);
  return toProduct(data);
};

export const createProduct = async (payload: any): Promise<Product> => {
  const fd = new FormData();
  fd.append('title', payload.title || '');
  fd.append('brand', payload.brand || '');
  fd.append('category', payload.category || '');
  fd.append('size_pk', payload.sizeEu || payload.size_pk || '');
  fd.append('size_eu', payload.sizeEu || payload.size_pk || '');
  fd.append('condition', payload.condition || '');
  fd.append('sale_price', String(payload.price ?? payload.sale_price ?? 0));
  if (payload.originalPrice != null) {
    fd.append('original_price', String(payload.originalPrice));
  }
  if (payload.buyingPrice != null) {
    fd.append('buying_price', String(payload.buyingPrice));
  }
  fd.append('description', payload.description || '');
  fd.append('is_featured', payload.isLatest ? 'true' : 'false');
  fd.append('is_new_arrival', payload.isNewArrival ? 'true' : 'false');
  fd.append('is_unisex', payload.isUnisex ? 'true' : 'false');
  if (payload.imageFile) {
    fd.append('image', payload.imageFile);
  }
  if (Array.isArray(payload.galleryFiles)) {
    payload.galleryFiles.forEach((file: File) => fd.append('gallery_images', file));
  }
  const { data } = await api.post<BackendProduct>('/products/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return toProduct(data);
};

export const updateProduct = async (id: string, payload: any): Promise<Product> => {
  const mapped: any = {};
  if (payload.title !== undefined) mapped.title = payload.title;
  if (payload.brand !== undefined) mapped.brand = payload.brand;
  if (payload.category !== undefined) mapped.category = payload.category;
  if (payload.sizeEu !== undefined) { mapped.size_pk = payload.sizeEu; mapped.size_eu = payload.sizeEu; }
  if (payload.condition !== undefined) mapped.condition = payload.condition;
  if (payload.price !== undefined) mapped.sale_price = payload.price;
  if (payload.salePrice !== undefined) mapped.sale_price = payload.salePrice;
  if (payload.originalPrice !== undefined) mapped.original_price = payload.originalPrice;
  if (payload.original_price !== undefined) mapped.original_price = payload.original_price;
  if (payload.buyingPrice !== undefined) mapped.buying_price = payload.buyingPrice;
  if (payload.description !== undefined) mapped.description = payload.description;
  if (payload.isLatest !== undefined) mapped.is_featured = payload.isLatest;
  if (payload.isNewArrival !== undefined) mapped.is_new_arrival = payload.isNewArrival;
  if (payload.isUnisex !== undefined) mapped.is_unisex = payload.isUnisex;
  if (payload.status !== undefined) mapped.status = payload.status;
  const { data } = await api.patch<BackendProduct>(`/products/${id}/`, mapped);
  return toProduct(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}/`);
};

export const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<BackendOrder[]>('/orders/');
  return data.map(toOrder);
};

// --- Dual-Payment Order Creation ---

export const createOrderWebsite = async (orderData: {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  customerAddress: string;
  city: string;
  transactionId: string;
  paymentScreenshot: File;
}): Promise<Order> => {
  const fd = new FormData();
  fd.append('product', orderData.productId);
  fd.append('customer_name', orderData.customerName);
  fd.append('customer_email', orderData.customerEmail || '');
  fd.append('customer_phone', orderData.customerContact);
  fd.append('address', orderData.customerAddress);
  fd.append('city', orderData.city);
  fd.append('checkout_method', 'website');
  fd.append('transaction_id', orderData.transactionId);
  fd.append('payment_screenshot', orderData.paymentScreenshot);

  const { data } = await api.post<BackendOrder>('/orders/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return toOrder(data);
};

export const createOrderWhatsapp = async (orderData: {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  customerAddress: string;
  city: string;
}): Promise<Order> => {
  const { data } = await api.post<BackendOrder>('/orders/', {
    product: orderData.productId,
    customer_name: orderData.customerName,
    customer_email: orderData.customerEmail || '',
    customer_phone: orderData.customerContact,
    address: orderData.customerAddress,
    city: orderData.city,
    checkout_method: 'whatsapp',
  });
  return toOrder(data);
};

// Legacy createOrder for backward compat
export const createOrder = createOrderWhatsapp;

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const { data } = await api.patch<BackendOrder>(`/orders/${id}/status/`, { status });
  return toOrder(data);
};

export const acceptOrder = async (id: string): Promise<Order> => {
  const { data } = await api.post<BackendOrder>(`/orders/${id}/accept/`);
  return toOrder(data);
};

export const rejectOrder = async (id: string): Promise<Order> => {
  const { data } = await api.post<BackendOrder>(`/orders/${id}/reject/`);
  return toOrder(data);
};

export const bulkUpdateOrders = async (orderIds: string[], status: string): Promise<void> => {
  await api.patch('/orders/bulk_status_update/', { order_ids: orderIds, status });
};

export const fetchDashboardStats = async () => {
  const { data } = await api.get('/stats/dashboard/');
  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get('/auth/profile/');
  return data;
};

export const updateProfile = async (payload: {
  name?: string;
  current_password?: string;
  new_password?: string;
  avatar?: File;
}) => {
  const fd = new FormData();
  if (payload.name) fd.append('name', payload.name);
  if (payload.current_password) fd.append('current_password', payload.current_password);
  if (payload.new_password) fd.append('new_password', payload.new_password);
  if (payload.avatar) fd.append('avatar', payload.avatar);

  const { data } = await api.patch('/auth/profile/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export default api;
