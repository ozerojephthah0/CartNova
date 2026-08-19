export type UserRole = 'customer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status?: 'active' | 'suspended';
  authProvider?: 'email' | 'google';
  createdAt?: string;
  storeName?: string;
  storeBio?: string;
  rating?: number;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export type User = UserProfile;

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  brand: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashDeal?: boolean;
  flashDealEndsAt?: string;
  claimedPercentage?: number;
  sellerId: string;
  sellerName: string;
  tags: string[];
  specs: Record<string, string>;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selected?: boolean;
  selectedVariant?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'cod';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  sellerId: string;
  sellerName: string;
  selectedVariant?: Record<string, string>;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: PaymentMethod;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingSpeed: 'standard' | 'express' | 'overnight';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
  ratingsBreakdown?: {
    quality?: number;
    value?: number;
    shipping?: number;
  };
  sellerReply?: {
    message: string;
    date: string;
    sellerName: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  bannerImage: string;
  itemCount: number;
  accentColor: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  minOrderAmount?: number;
  description: string;
  isActive?: boolean;
  expiresAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  minDiscount: number;
  freeShippingOnly: boolean;
  featuredOnly: boolean;
  sellerId: string;
  sortBy:
    | 'featured'
    | 'relevance'
    | 'price-asc'
    | 'price-desc'
    | 'rating'
    | 'reviews'
    | 'discount'
    | 'newest'
    | 'name-asc'
    | 'name-desc';
}

export type NotificationType =
  | 'order'
  | 'deal'
  | 'price_drop'
  | 'stock'
  | 'system'
  | 'security'
  | 'review';

export interface CustomerNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
  actionType?: 'order' | 'product' | 'flash_deals' | 'wishlist' | 'profile' | 'category';
  actionId?: string;
  actionPayload?: string;
  image?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export type SupportCategory =
  | 'order_issue'
  | 'delivery_delay'
  | 'refund_return'
  | 'damaged_item'
  | 'payment_billing'
  | 'account_security'
  | 'general_inquiry';

export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SupportStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system' | 'bot';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  attachments?: string[];
  suggestedActions?: Array<{
    label: string;
    actionType: 'view_order' | 'open_ticket' | 'faq' | 'contact_agent' | 'refund';
    payload?: string;
  }>;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  orderId?: string;
  orderNumber?: string;
  productName?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  assignedAgent?: {
    name: string;
    title: string;
    avatar: string;
    rating: number;
  };
  resolutionNote?: string;
}

export interface FaqItem {
  id: string;
  category: 'orders_shipping' | 'returns_refunds' | 'payments_promos' | 'account_security' | 'products_warranty';
  question: string;
  answer: string;
  helpfulCount: number;
  tags: string[];
}

