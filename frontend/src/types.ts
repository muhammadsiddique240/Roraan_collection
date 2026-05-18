export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface Product {
  id: string;
  productCode?: string;
  title: string;
  brand: string;
  category: string;
  size: {
    eu: string;
    cm?: string;
    us?: string;
    uk?: string;
  };
  condition: string;
  price: number;
  originalPrice?: number;
  buyingPrice?: number; // Admin only
  images: string[];
  status: ProductStatus;
  description: string;
  viewCount: number;
  reservedUntil?: string | null;
  tags?: string[];
  isLatest?: boolean;
  isNewArrival?: boolean;
  isNew?: boolean;
  isUnisex?: boolean;
  createdAt: string;
}

export type CheckoutMethod = 'website' | 'whatsapp';

export type OrderStatus =
  | 'PENDING_VERIFICATION'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELED'
  | 'WHATSAPP_PENDING'
  // Legacy compat
  | 'PENDING'
  | 'PENDING_ADVANCE'
  | 'CONFIRMED_ADVANCE'
  | 'DISPATCHED';

export interface Order {
  id: string;
  orderCode?: string;
  customerName: string;
  customerContact: string;
  customerAddress: string;
  city: string;
  customerEmail?: string;
  productId: string;
  productTitle?: string;
  productCode?: string;
  totalAmount: number;
  status: OrderStatus;
  checkoutMethod: CheckoutMethod;
  paymentScreenshotUrl?: string | null;
  transactionId?: string;
  createdAt: string;
  trustMetrics?: {
    total_orders: number;
    delivered_count: number;
    canceled_count: number;
    trust_score: number;
  };
}

export interface DashboardStats {
  total_in_stock: number;
  total_sold: number;
  total_categories: number;
  total_revenue: number;
  total_profit: number;
  most_viewed: Array<{
    id: string;
    title: string;
    views: number;
    image: string;
  }>;
  order_counts: Record<string, number>;
}
