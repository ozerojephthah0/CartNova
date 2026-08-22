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

export type ThemeMode = 'cartnova' | 'temu' | 'light' | 'dark' | 'midnight' | 'warm-sepia' | 'cyberpunk';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  label: string;
  description: string;
  iconName: 'Sun' | 'Moon' | 'Sparkles' | 'Coffee' | 'Terminal' | 'Palette';
  badge: string;
  bgHex: string;
  accentHex: string;
}

export interface FriendSlashAssist {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  time: string;
}

export interface SlashGameItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  originalPrice: number;
  currentPrice: number;
  slashedTotal: number;
  percentageSlashed: number;
  slashesLeft: number;
  expiresAt: string;
  status: 'active' | 'completed' | 'claimed';
  assists: FriendSlashAssist[];
  product?: Product;
}

export type MysteryBoxRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface MysteryBoxPrize {
  id: string;
  title: string;
  image: string;
  retailPrice: number;
  rarity: MysteryBoxRarity;
  chance: number; // percentage
  badge?: string;
}

export interface MysteryBoxTier {
  id: string;
  name: string;
  tier: 'free' | 'cyber' | 'gamer' | 'diamond';
  tagline: string;
  price: number;
  color: string;
  boxImage: string;
  guaranteedMinRarity: MysteryBoxRarity;
  prizes: MysteryBoxPrize[];
}

export interface TeamBuyGroup {
  id: string;
  productId: string;
  product: Product;
  teamPrice: number;
  soloPrice: number;
  discountPercent: number;
  requiredMembers: number;
  currentMembers: Array<{
    id: string;
    name: string;
    avatar: string;
    joinedAt: string;
  }>;
  expiresAt: string;
  status: 'open' | 'completed';
}

export interface ProductQuestion {
  id: string;
  productId: string;
  question: string;
  askedBy: string;
  date: string;
  votes: number;
  answers: Array<{
    id: string;
    answeredBy: string;
    isSeller?: boolean;
    isVerifiedBuyer?: boolean;
    answer: string;
    date: string;
    helpfulVotes: number;
  }>;
}

export interface SubscriptionItem {
  id: string;
  productId: string;
  product: Product;
  frequencyMonths: number;
  discountPercent: number;
  pricePerDelivery: number;
  nextDeliveryDate: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
}

export type EventSeason = 'holiday' | 'national' | 'cultural' | 'shopping_festival' | 'family' | 'seasonal';
export type EventStatus = 'live_now' | 'upcoming' | 'early_access';

export interface SeasonalEvent {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  categoryType: EventSeason;
  status: EventStatus;
  discountPercent: number; // Always 20 as requested
  couponCode: string;
  dateRange: string;
  month: string;
  exactDateInfo: string;
  tagline: string;
  description: string;
  highlightPerks: string[];
  bannerImage: string;
  themeColor: {
    badgeBg: string;
    badgeText: string;
    gradient: string;
    accentColor: string;
    border: string;
  };
  targetCountdownDate: string;
  featuredCategory: string;
  curatedProductIds: string[];
  giftGuideTips: string[];
}

