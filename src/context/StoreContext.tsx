import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Category,
  UserProfile,
  UserRole,
  CartItem,
  Order,
  OrderStatus,
  Review,
  Coupon,
  FilterState,
  ToastNotification,
  CustomerNotification,
  NotificationType,
  SupportTicket,
  SupportMessage,
  SupportCategory,
  SupportPriority,
  SupportStatus,
  FaqItem,
  ThemeMode,
  ThemeOption,
  SlashGameItem,
  FriendSlashAssist,
  MysteryBoxTier,
  MysteryBoxPrize,
  TeamBuyGroup,
  ProductQuestion,
  SubscriptionItem,
  SeasonalEvent,
  SpinWheelPrize,
  ClaimedSpinReward,
  ReferralStats,
  SimulatedTransaction,
  SimulatedPaymentStatus,
  SimulatedPaymentConfig,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_FAQS,
  THEME_OPTIONS,
  INITIAL_SLASH_ITEMS,
  INITIAL_MYSTERY_BOXES,
  INITIAL_PRODUCT_QUESTIONS,
  INITIAL_SUBSCRIPTIONS,
  SEASONAL_EVENTS,
  INITIAL_SPIN_PRIZES,
} from '../data/initialData';

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  name: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: { code: 'NGN', symbol: '₦', rate: 1, name: 'Nigerian Naira' },
  USD: { code: 'USD', symbol: '$', rate: 1 / 1500, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 / 1500, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 / 1500, name: 'British Pound' },
};

interface StoreContextType {
  // Current user & role
  currentUser: UserProfile;
  activeRole: UserRole;
  allUsers: UserProfile[];
  switchRole: (role: UserRole, userId?: string) => void;

  // Authentication & Access Control
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  authModalRole: UserRole;
  setAuthModalRole: (role: UserRole) => void;
  openAuthModal: (mode?: 'login' | 'signup', role?: UserRole) => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password?: string, preferredRole?: UserRole) => Promise<{ success: boolean; message: string }>;
  signupWithEmail: (name: string, email: string, password?: string, preferredRole?: UserRole) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (googleAccount?: { name?: string; email?: string; avatar?: string }, preferredRole?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  toggleUserStatus: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addUser: (userData: Partial<UserProfile>) => void;

  // Catalog & categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFeaturedProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: Record<string, string>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelectCartItem: (cartItemId: string) => void;
  selectAllCartItems: (select: boolean) => void;
  removeSelectedFromCart: () => void;
  moveSelectedToWishlist: () => void;
  selectedCartItems: CartItem[];
  selectedCartCount: number;
  selectedCartSubtotal: number;
  cartCount: number;
  cartSubtotal: number;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Recently Viewed & Recommended Products
  recentlyViewedIds: string[];
  recentlyViewedProducts: Product[];
  addToRecentlyViewed: (productId: string) => void;
  removeFromRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
  recommendedProducts: Product[];
  getRecommendationsForProduct: (product: Product, limit?: number) => Product[];
  getFrequentlyBoughtTogether: (product: Product) => { items: Product[]; bundleDiscount: number; bundlePrice: number; originalPrice: number };

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateOrderTracking: (orderId: string, carrier: string, trackingNumber: string) => void;
  cancelOrder: (orderId: string) => void;

  // Reviews & Moderation
  reviews: Review[];
  addReview: (
    productId: string,
    rating: number,
    title: string,
    comment: string,
    images?: string[],
    ratingsBreakdown?: { quality?: number; value?: number; shipping?: number }
  ) => void;
  voteHelpfulReview: (reviewId: string) => void;
  replyToReview: (reviewId: string, message: string) => void;
  addSellerReplyToReview: (reviewId: string, message: string) => void;
  deleteReview: (id: string) => void;
  toggleReviewApproval: (id: string) => void;
  replyToReviewAsAdmin: (reviewId: string, message: string, moderatorName?: string) => void;

  // Sellers & Storefronts
  verifySeller: (sellerId: string, isVerified: boolean) => void;
  updateSellerCommission: (sellerId: string, rate: number) => void;
  selectedSellerId: string | null;
  setSelectedSellerId: (id: string | null) => void;
  viewSellerStore: (sellerId: string) => void;

  // Search & Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredProducts: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  recentSearches: string[];
  popularSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  executeSearch: (query: string, category?: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Referrals & Rewards
  referralData: ReferralStats;
  claimDailyStreakReward: () => { points: number; bonusMessage: string; newStreak: number };
  redeemRewardPoints: (pointsCost: number, rewardType: 'wallet' | 'coupon' | 'shipping') => { success: boolean; message: string };

  // Active Modals & Views
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  viewProductDetail: (productOrId: string | Product) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  activeCustomerTab: 'shop' | 'product-detail' | 'orders' | 'wishlist' | 'profile' | 'notifications' | 'support' | 'slash-game' | 'mystery-box' | 'prime-hub' | 'seasonal-events' | 'referrals' | 'seller-store';
  setActiveCustomerTab: (tab: 'shop' | 'product-detail' | 'orders' | 'wishlist' | 'profile' | 'notifications' | 'support' | 'slash-game' | 'mystery-box' | 'prime-hub' | 'seasonal-events' | 'referrals' | 'seller-store') => void;

  // Seasonal Events & Shopping Campaigns Feature (20% OFF)
  seasonalEvents: SeasonalEvent[];
  selectedSeasonalEvent: SeasonalEvent | null;
  setSelectedSeasonalEvent: (event: SeasonalEvent | null) => void;
  isSeasonalEventModalOpen: boolean;
  setIsSeasonalEventModalOpen: (open: boolean) => void;
  activateSeasonalEventDiscount: (event: SeasonalEvent) => void;

  // Slash It to ₦0 Feature (Temu Price Slash)
  slashItems: SlashGameItem[];
  activeSlashItem: SlashGameItem | null;
  setActiveSlashItem: (item: SlashGameItem | null) => void;
  slashPrice: (slashId: string) => { amount: number; remaining: number; completed: boolean };
  simulateFriendSlash: (slashId: string) => void;
  claimSlashedItem: (slashId: string) => void;
  isSlashModalOpen: boolean;
  setIsSlashModalOpen: (open: boolean) => void;

  // Mystery Box / Blind Box Feature
  mysteryBoxes: MysteryBoxTier[];
  isMysteryBoxOpen: boolean;
  setIsMysteryBoxOpen: (open: boolean) => void;
  openMysteryBox: (boxTierId: string) => Promise<MysteryBoxPrize>;
  unboxedPrizes: MysteryBoxPrize[];
  claimMysteryPrize: (prize: MysteryBoxPrize) => void;

  // Amazon Prime / Nova+ Membership Feature
  isNovaPrime: boolean;
  setIsNovaPrime: (isMember: boolean) => void;
  toggleNovaPrime: () => void;
  isNovaPrimeModalOpen: boolean;
  setIsNovaPrimeModalOpen: (open: boolean) => void;

  // Amazon 1-Click Buy Feature
  oneClickBuy: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  openOneClickBuyModal: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  oneClickBuySuccessOrder: Order | null;
  setOneClickBuySuccessOrder: (order: Order | null) => void;

  // Live Delivery Tracking Modal (Amazon Style)
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  trackingOrder: Order | null;
  setTrackingOrder: (order: Order | null) => void;

  // Product Q&A Community
  productQuestions: ProductQuestion[];
  askProductQuestion: (productId: string, question: string) => void;
  answerProductQuestion: (questionId: string, answer: string) => void;
  voteHelpfulAnswer: (questionId: string, answerId: string) => void;

  // Subscribe & Save (Amazon Style)
  subscriptions: SubscriptionItem[];
  addSubscription: (productId: string, frequencyMonths: number) => void;
  cancelSubscription: (subId: string) => void;

  // Customer Notifications
  notifications: CustomerNotification[];
  userNotifications: CustomerNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<CustomerNotification, 'id' | 'timestamp' | 'read'>) => void;
  broadcastNotification: (title: string, message: string, type?: NotificationType, priority?: 'low' | 'normal' | 'high') => void;
  isNotificationPopoverOpen: boolean;
  setIsNotificationPopoverOpen: (open: boolean) => void;
  handleNotificationAction: (notification: CustomerNotification) => void;

  // Customer Support & Help Center
  supportTickets: SupportTicket[];
  activeTicketId: string | null;
  setActiveTicketId: (id: string | null) => void;
  activeTicket: SupportTicket | null;
  faqs: FaqItem[];
  isLiveSupportOpen: boolean;
  setIsLiveSupportOpen: (open: boolean) => void;
  supportChatMessages: SupportMessage[];
  openSupportTicket: (ticketId?: string) => void;
  createSupportTicket: (
    data: {
      subject: string;
      category: SupportCategory;
      priority: SupportPriority;
      orderId?: string;
      orderNumber?: string;
      productName?: string;
      customerPhone?: string;
    },
    initialMessage: string
  ) => SupportTicket;
  addMessageToSupportTicket: (ticketId: string, text: string, sender?: 'customer' | 'agent') => void;
  updateTicketStatus: (ticketId: string, status: SupportStatus, note?: string) => void;
  sendLiveSupportChatMessage: (text: string, orderContextId?: string) => Promise<void>;
  prefillSupportForOrder: (order: Order, category?: SupportCategory) => void;
  voteFaq: (faqId: string, isHelpful: boolean) => void;
  submitOrderDisputeOrRefund: (
    orderId: string,
    itemIds: string[],
    reason: string,
    refundMethod: 'wallet' | 'card' | 'replacement',
    details?: string
  ) => { success: boolean; rmaNumber: string; ticket: SupportTicket };
  approveRefundDispute: (ticketId: string, orderId: string, refundAmount?: number, resolutionNote?: string) => void;
  rejectRefundDispute: (ticketId: string, reasonNote?: string) => void;

  // Free Spins & Lucky Spin Wheel Rewards (Money, Products, Food, Passes)
  freeSpinsLeft: number;
  setFreeSpinsLeft: React.Dispatch<React.SetStateAction<number>>;
  replenishFreeSpins: (count?: number) => void;
  decrementFreeSpins: () => void;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  creditWallet: (amount: number, reason?: string) => void;
  debitWallet: (amount: number) => boolean;
  claimedSpinRewards: ClaimedSpinReward[];
  setClaimedSpinRewards: React.Dispatch<React.SetStateAction<ClaimedSpinReward[]>>;
  spinWheelPrizes: SpinWheelPrize[];
  claimSpinReward: (prize: SpinWheelPrize) => { success: boolean; message: string; addedToWallet?: number; addedToCart?: boolean };
  claimFreePrizeProductToCart: (productInfo: { id: string; title: string; image: string; originalPrice: number; category: string; description: string }) => void;
  isSpinWheelOpen: boolean;
  setIsSpinWheelOpen: (open: boolean) => void;
  openSpinWheel: () => void;
  closeSpinWheel: () => void;

  // Currency
  currentCurrency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;

  // Theme Engine
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeOptions: ThemeOption[];

  // Toasts
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Simulated Payment & Gmail Alert System (DEMO MODE)
  simulatedTransactions: SimulatedTransaction[];
  simulatedPaymentConfig: SimulatedPaymentConfig;
  selectedSimulatedTxn: SimulatedTransaction | null;
  setSelectedSimulatedTxn: (txn: SimulatedTransaction | null) => void;
  isSimulatedAlertModalOpen: boolean;
  setIsSimulatedAlertModalOpen: (open: boolean) => void;
  recordSimulatedPayment: (data: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    items: Array<{ id: string; title: string; price: number; quantity: number; image?: string }>;
    initialStatus?: SimulatedPaymentStatus;
  }) => Promise<SimulatedTransaction | null>;
  updateSimulatedTxnStatus: (id: string, status: SimulatedPaymentStatus, note?: string) => Promise<void>;
  resendSimulatedTxnAlert: (id: string) => Promise<void>;
  updateSimulatedConfig: (newConfig: Partial<SimulatedPaymentConfig>) => Promise<void>;
  triggerManualTestEmailAlert: (params?: {
    adminEmail?: string;
    amount?: number;
    customerName?: string;
    paymentMethod?: string;
  }) => Promise<{ success: boolean; message: string; transaction?: SimulatedTransaction }>;
  fetchSimulatedTransactions: () => Promise<void>;

  // Utilities
  resetStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'cartnova_products_v2',
  CART: 'cartnova_cart_v2',
  WISHLIST: 'cartnova_wishlist_v2',
  ORDERS: 'cartnova_orders_v2',
  REVIEWS: 'cartnova_reviews_v2',
  NOTIFICATIONS: 'cartnova_notifications_v2',
  SUPPORT_TICKETS: 'cartnova_support_tickets_v2',
  FAQS: 'cartnova_faqs_v2',
  SUPPORT_CHAT: 'cartnova_support_chat_v2',
  ACTIVE_USER: 'cartnova_active_user_v2',
  ACTIVE_ROLE: 'cartnova_active_role_v2',
  ALL_USERS: 'cartnova_all_users_v2',
  IS_LOGGED_IN: 'cartnova_is_logged_in_v2',
  CURRENCY: 'cartnova_currency_v2',
  SEARCH_HISTORY: 'cartnova_search_history_v2',
  RECENTLY_VIEWED: 'cartnova_recently_viewed_v2',
  THEME: 'cartnova_theme_mode_v2',
  SLASH_ITEMS: 'cartnova_slash_items_v2',
  MYSTERY_PRIZES: 'cartnova_mystery_prizes_v2',
  NOVA_PRIME: 'cartnova_nova_prime_v2',
  QUESTIONS: 'cartnova_questions_v2',
  SUBSCRIPTIONS: 'cartnova_subscriptions_v2',
  SEASONAL_EVENTS: 'cartnova_seasonal_events_v2',
  FREE_SPINS: 'cartnova_free_spins_v3',
  WALLET_BALANCE: 'cartnova_wallet_balance_v3',
  CLAIMED_SPIN_REWARDS: 'cartnova_claimed_spin_rewards_v3',
  SIMULATED_TRANSACTIONS: 'cartnova_simulated_transactions_v2',
  SIMULATED_CONFIG: 'cartnova_simulated_config_v2',
};

const DEFAULT_POPULAR_SEARCHES = [
  'Televisions',
  'Samsung Refrigerator',
  'LG Washing Machine',
  'Microwave Oven',
  'Air Conditioners',
  'Dyson Fan',
  'Bluetooth Speaker',
  'Home Theater System',
  'DVD Player',
  'Electric Kettle',
  'Ninja Blender',
  'Steam Iron',
  'PS5',
  'iPhone 17 Pro Max',
  'Infinix Hot 50',
  'Samsung Galaxy XCover 4s',
  'Ninja Turtle toys',
  'PS4 Pads',
  'Game Box Patch',
  'Football Boots',
  'EV Charger',
  'OBD2 Diagnostic Scanner',
  'Basmati Rice',
  'Shea Butter Soap',
  'Spalding Basketball',
  'Chelsea Boots',
  'Adjustable Dumbbells',
];

export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Customer',
  email: '',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial persistent states
  const [products, setProducts] = useState<Product[]>(() => {
    const DELETED_PRODUCT_IDS = new Set(['prod-1', 'prod-head-3']);
    const isDeleted = (p: { id: string; images?: string[]; title?: string }) => {
      if (DELETED_PRODUCT_IDS.has(p.id)) return true;
      if (p.images?.some((img) => typeof img === 'string' && (img.includes('headset-blue-bg') || img.includes('headset-yellow')))) return true;
      if (p.title && (p.title.includes('NovaSound Pro ANC Wireless Headphones') || p.title.includes('AeroSpatial 7.1 Surround Pro Gaming Headset'))) return true;
      return false;
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
        const updated = parsed
          .filter((p) => !isDeleted(p))
          .map((p) => {
            const init = initialMap.get(p.id);
            if (init) {
              return {
                ...p,
                price: init.price,
                originalPrice: init.originalPrice,
                discountPercentage: init.discountPercentage,
                images: init.images,
                category: init.category,
                tags: init.tags || p.tags,
              };
            }
            // Sanitize any legacy product categories to Phones & Tablets
            if (p.category && (p.category.toLowerCase().includes('mobile') || p.category.toLowerCase() === 'phones')) {
              return { ...p, category: 'Phones & Tablets' };
            }
            return p;
          });
        const existingIds = new Set(updated.map((p) => p.id));
        const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id) && !isDeleted(p));
        const merged = [...updated, ...missing].filter((p) => !isDeleted(p));
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
        } catch {
          // Ignore storage quota errors
        }
        return merged;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('cartnova_categories');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const initialMap = new Map(INITIAL_CATEGORIES.map((c) => [c.slug, c]));
        // Normalize any legacy categories (e.g., phones-mobile) to phones-tablets
        const sanitized = parsed.map((c) => {
          if (c.slug === 'phones-mobile' || c.name.toLowerCase().includes('phones & mobile')) {
            return initialMap.get('phones-tablets') || c;
          }
          return initialMap.get(c.slug) || c;
        });
        const existingSlugs = new Set(sanitized.map((c) => c.slug));
        const missing = INITIAL_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));
        const merged = [...sanitized, ...missing];
        try {
          localStorage.setItem('cartnova_categories', JSON.stringify(merged));
        } catch {
          // Ignore storage quota errors
        }
        return merged;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole) || 'customer';
    } catch {
      return 'customer';
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (saved) return JSON.parse(saved);
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  // Theme Engine State
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      if (saved && ['cartnova', 'temu', 'light', 'dark', 'midnight', 'warm-sepia', 'cyberpunk'].includes(saved)) {
        return saved;
      }
      return 'cartnova';
    } catch {
      return 'cartnova';
    }
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch {}
    document.documentElement.setAttribute('data-theme', mode);
    if (mode === 'dark' || mode === 'midnight' || mode === 'cyberpunk') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    if (themeMode === 'dark' || themeMode === 'midnight' || themeMode === 'cyberpunk') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');

  const openAuthModal = (mode: 'login' | 'signup' = 'login', role?: UserRole) => {
    setAuthModalMode(mode);
    if (role) {
      setAuthModalRole(role);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.filter((item) => item.productId !== 'prod-1' && item.productId !== 'prod-head-3');
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      const list: string[] = saved ? JSON.parse(saved) : ['prod-gadg-iphone17promax', 'prod-3'];
      return list.filter((id) => id !== 'prod-1' && id !== 'prod-head-3');
    } catch {
      return ['prod-gadg-iphone17promax', 'prod-3'];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (saved) {
        const parsed: Review[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((r) => r.id));
        const missing = INITIAL_REVIEWS.filter((r) => !existingIds.has(r.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(merged));
          } catch {
            // Ignore storage quota errors
          }
          return merged;
        }
        return parsed;
      }
      return INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved && (saved in CURRENCIES)) {
        return saved as CurrencyCode;
      }
      return 'NGN';
    } catch {
      return 'NGN';
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('cartnova_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Search History State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return saved ? JSON.parse(saved) : ['Noise Cancelling Headphones', 'MacBook M3', 'Chelsea Boots', 'Mechanical Keyboard'];
    } catch {
      return ['Noise Cancelling Headphones', 'MacBook M3', 'Chelsea Boots', 'Mechanical Keyboard'];
    }
  });

  const [popularSearches] = useState<string[]>(DEFAULT_POPULAR_SEARCHES);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  };

  const executeSearch = (query: string, category?: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      addRecentSearch(trimmed);
    }
    // Detect if query is a direct category name match or specific gadget search
    let targetCategory = category !== undefined ? category : undefined;
    const qLower = trimmed.toLowerCase();

    // If searching for specific devices like iPhone, reset category if it was previously filtering another category
    if (qLower.includes('iphone') || qLower.includes('apple') || qLower.includes('galaxy') || qLower.includes('phone')) {
      if (targetCategory && !targetCategory.toLowerCase().includes('phone') && !targetCategory.toLowerCase().includes('gadget') && !targetCategory.toLowerCase().includes('all')) {
        targetCategory = 'all';
      }
    }

    if (targetCategory === undefined || targetCategory === 'all') {
      const qNorm = trimmed.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
      if (qNorm) {
        const foundCat = categories.find((c) => {
          const cNorm = c.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
          const sNorm = c.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
          return qNorm === cNorm || qNorm === sNorm;
        });
        if (foundCat) {
          targetCategory = foundCat.name;
        }
      }
    }

    setFilters((prev) => ({
      ...prev,
      searchQuery: trimmed,
      subcategory: '',
      category: targetCategory !== undefined ? targetCategory : (qLower.includes('iphone') ? 'all' : prev.category),
    }));
    setActiveCustomerTab('shop');
    setIsSearchModalOpen(false);

    // Smooth scroll to products section
    setTimeout(() => {
      const catalog = document.getElementById('product-catalog-section');
      if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Modals & Navigation state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [activeCustomerTab, setActiveCustomerTab] = useState<
    'shop' | 'product-detail' | 'orders' | 'wishlist' | 'profile' | 'notifications' | 'support' | 'slash-game' | 'mystery-box' | 'prime-hub' | 'seasonal-events' | 'referrals' | 'seller-store'
  >('shop');

  // Slash It to ₦0 state (Temu Price Slash)
  const [slashItems, setSlashItems] = useState<SlashGameItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLASH_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_SLASH_ITEMS;
    } catch {
      return INITIAL_SLASH_ITEMS;
    }
  });
  const [activeSlashItem, setActiveSlashItem] = useState<SlashGameItem | null>(() => INITIAL_SLASH_ITEMS[0] || null);
  const [isSlashModalOpen, setIsSlashModalOpen] = useState(false);

  // Mystery Box state
  const [mysteryBoxes] = useState<MysteryBoxTier[]>(INITIAL_MYSTERY_BOXES);
  const [isMysteryBoxOpen, setIsMysteryBoxOpen] = useState(false);
  const [unboxedPrizes, setUnboxedPrizes] = useState<MysteryBoxPrize[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MYSTERY_PRIZES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Nova+ Prime state (Amazon Prime equivalent)
  const [isNovaPrime, setIsNovaPrimeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.NOVA_PRIME) === 'true';
    } catch {
      return false;
    }
  });
  const [isNovaPrimeModalOpen, setIsNovaPrimeModalOpen] = useState(false);

  // 1-Click Buy state
  const [oneClickBuySuccessOrder, setOneClickBuySuccessOrder] = useState<Order | null>(null);

  // Live Tracking Modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Q&A Community state
  const [productQuestions, setProductQuestions] = useState<ProductQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCT_QUESTIONS;
    } catch {
      return INITIAL_PRODUCT_QUESTIONS;
    }
  });

  // Subscribe & Save state
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  // Seasonal Events & Shopping Campaigns state
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEASONAL_EVENTS);
      if (saved) {
        const parsed: SeasonalEvent[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEASONAL_EVENTS;
    } catch {
      return SEASONAL_EVENTS;
    }
  });

  const [selectedSeasonalEvent, setSelectedSeasonalEvent] = useState<SeasonalEvent | null>(() => {
    return SEASONAL_EVENTS[0] || null;
  });

  const [isSeasonalEventModalOpen, setIsSeasonalEventModalOpen] = useState(false);

  // Customer Notifications state
  const [notifications, setNotifications] = useState<CustomerNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed: CustomerNotification[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((n) => n.id));
        const missing = INITIAL_NOTIFICATIONS.filter((n) => !existingIds.has(n.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return parsed;
      }
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false);

  // Customer Support State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SUPPORT_TICKETS;
    } catch {
      return INITIAL_SUPPORT_TICKETS;
    }
  });

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAQS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  });

  const [isLiveSupportOpen, setIsLiveSupportOpen] = useState(false);

  // Simulated Payment & Gmail Alert System (DEMO MODE)
  const [simulatedTransactions, setSimulatedTransactions] = useState<SimulatedTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIMULATED_TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [simulatedPaymentConfig, setSimulatedPaymentConfig] = useState<SimulatedPaymentConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIMULATED_CONFIG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      adminEmail: 'ozerojephthah0@gmail.com',
      enableAutoAlerts: true,
      enableFiveMinuteWindow: true,
      autoExpireSeconds: 300,
      simulationSpeed: 'realtime',
      demoBannerEnabled: true,
      smtpConfigured: false,
    };
  });

  const [selectedSimulatedTxn, setSelectedSimulatedTxn] = useState<SimulatedTransaction | null>(null);
  const [isSimulatedAlertModalOpen, setIsSimulatedAlertModalOpen] = useState(false);

  const [supportChatMessages, setSupportChatMessages] = useState<SupportMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT_CHAT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'chat-welcome-1',
        sender: 'bot',
        senderName: 'Nova Support Concierge',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: "👋 Hi there! I'm Nova, your 24/7 CartNova Customer Support Concierge. How can I help you today? Ask me about order tracking, refunds & returns, delivery updates, or speak directly with an agent.",
        timestamp: new Date().toISOString(),
        suggestedActions: [
          { label: '📦 Track My Active Order', actionType: 'view_order' },
          { label: '🔄 Request Return / Refund', actionType: 'refund' },
          { label: '🎫 Open Support Ticket', actionType: 'open_ticket' },
          { label: '❓ Browse Help FAQs', actionType: 'faq' },
        ],
      },
    ];
  });

  const activeTicket = useMemo(() => {
    if (!activeTicketId) return null;
    return supportTickets.find((t) => t.id === activeTicketId) || null;
  }, [supportTickets, activeTicketId]);

  // Recently Viewed Products State
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((id) => id !== 'prod-1' && id !== 'prod-head-3');
        }
      }
      return ['prod-gadg-iphone17promax', 'prod-2', 'prod-4'];
    } catch {
      return ['prod-gadg-iphone17promax', 'prod-2', 'prod-4'];
    }
  });

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewedIds, products]);

  const addToRecentlyViewed = useCallback((productId: string) => {
    if (!productId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => {
      const updated = prev.filter((id) => id !== productId);
      try {
        localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
    } catch {}
    addToast('info', 'Browsing History Cleared', 'Your recently viewed products history has been reset');
  }, []);

  // Algorithmic Recommendations based on user behavior, cart, wishlist, and affinity
  const recommendedProducts = useMemo(() => {
    const viewedCategories = new Set(recentlyViewedProducts.map((p) => p.category));
    const cartCategories = new Set(cart.map((c) => c.product.category));
    const wishlistCategories = new Set(
      wishlist.map((id) => products.find((p) => p.id === id)?.category).filter(Boolean)
    );

    const userInterestCategories = new Set([...viewedCategories, ...cartCategories, ...wishlistCategories]);

    return products
      .slice()
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (userInterestCategories.has(a.category)) scoreA += 30;
        if (userInterestCategories.has(b.category)) scoreB += 30;

        if (a.isFeatured) scoreA += 15;
        if (b.isFeatured) scoreB += 15;

        scoreA += (a.rating || 0) * 8;
        scoreB += (b.rating || 0) * 8;

        if (a.discountPercentage) scoreA += Math.min(a.discountPercentage, 15);
        if (b.discountPercentage) scoreB += Math.min(b.discountPercentage, 15);

        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [products, recentlyViewedProducts, cart, wishlist]);

  const getRecommendationsForProduct = useCallback(
    (targetProduct: Product, limit = 4): Product[] => {
      if (!targetProduct) return products.slice(0, limit);
      return products
        .filter((p) => p.id !== targetProduct.id)
        .sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Category match
          if (a.category === targetProduct.category) scoreA += 50;
          if (b.category === targetProduct.category) scoreB += 50;

          // Brand match
          if (a.brand === targetProduct.brand) scoreA += 25;
          if (b.brand === targetProduct.brand) scoreB += 25;

          // Tag overlap
          const tagsA = a.tags.filter((t) => targetProduct.tags.includes(t)).length;
          const tagsB = b.tags.filter((t) => targetProduct.tags.includes(t)).length;
          scoreA += tagsA * 12;
          scoreB += tagsB * 12;

          // Price range similarity (within 40%)
          const priceRatioA = Math.abs(a.price - targetProduct.price) / (targetProduct.price || 1);
          const priceRatioB = Math.abs(b.price - targetProduct.price) / (targetProduct.price || 1);
          if (priceRatioA < 0.4) scoreA += 15;
          if (priceRatioB < 0.4) scoreB += 15;

          // Rating
          scoreA += (a.rating || 0) * 6;
          scoreB += (b.rating || 0) * 6;

          return scoreB - scoreA;
        })
        .slice(0, limit);
    },
    [products]
  );

  const getFrequentlyBoughtTogether = useCallback(
    (product: Product) => {
      const candidates = products.filter((p) => p.id !== product.id);
      // Try finding an accessory or complementary category, else same category or high rated
      const accessory = candidates.find(
        (p) => p.category === product.category || p.category === 'Accessories' || p.category === 'Electronics'
      );
      const companion = candidates.find(
        (p) => p.id !== accessory?.id && (p.brand === product.brand || p.rating >= 4.7)
      );

      const items = [accessory, companion].filter((p): p is Product => Boolean(p));
      const allBundleItems = [product, ...items];
      const originalPrice = allBundleItems.reduce((acc, curr) => acc + curr.price, 0);
      const bundleDiscount = 12; // 12% off bundle
      const bundlePrice = (originalPrice * (100 - bundleDiscount)) / 100;

      return {
        items,
        bundleDiscount,
        bundlePrice,
        originalPrice,
      };
    },
    [products]
  );

  const viewProductDetail = (productOrId: string | Product) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;
    setSelectedProductId(id);
    addToRecentlyViewed(id);
    setQuickViewProduct(null);
    setActiveCustomerTab('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter State
  const initialFilters: FilterState = {
    searchQuery: '',
    category: 'all',
    subcategory: '',
    brands: [],
    minPrice: 0,
    maxPrice: 5000000,
    minRating: 0,
    inStockOnly: false,
    onSaleOnly: false,
    minDiscount: 0,
    freeShippingOnly: false,
    featuredOnly: false,
    sellerId: 'all',
    sortBy: 'featured',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, activeRole);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(currentUser));
  }, [activeRole, currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(supportTickets));
    } catch {}
  }, [supportTickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
    } catch {}
  }, [faqs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPORT_CHAT, JSON.stringify(supportChatMessages));
    } catch {}
  }, [supportChatMessages]);

  // Sync simulated state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATED_TRANSACTIONS, JSON.stringify(simulatedTransactions));
    } catch {}
  }, [simulatedTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATED_CONFIG, JSON.stringify(simulatedPaymentConfig));
    } catch {}
  }, [simulatedPaymentConfig]);

  // Fetch simulated transactions and configuration from backend
  const fetchSimulatedTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/simulated-transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && Array.isArray(data.transactions)) {
          setSimulatedTransactions(data.transactions);
        }
        if (data.config) {
          setSimulatedPaymentConfig(data.config);
        }
      }
    } catch {
      // Backend request fallback to local state
    }
  }, []);

  useEffect(() => {
    fetchSimulatedTransactions();
    const interval = setInterval(fetchSimulatedTransactions, 10000);
    return () => clearInterval(interval);
  }, [fetchSimulatedTransactions]);

  // Record simulated payment and dispatch admin Gmail alert
  const recordSimulatedPayment = async (data: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    items: Array<{ id: string; title: string; price: number; quantity: number; image?: string }>;
    initialStatus?: SimulatedPaymentStatus;
  }): Promise<SimulatedTransaction | null> => {
    try {
      const res = await fetch('/api/simulated-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          currency: data.currency || currencyCode,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.transaction) {
          setSimulatedTransactions((prev) => [result.transaction, ...prev.filter((t) => t.id !== result.transaction.id)]);
          addToast(
            'success',
            '📧 TEST PAYMENT ALERT SENT',
            `Simulated payment recorded for #${data.orderNumber} & alert dispatched to ${simulatedPaymentConfig.adminEmail} [DEMO MODE]`
          );
          return result.transaction;
        }
      }
    } catch (err) {
      console.error('Simulated transaction error:', err);
    }

    // Local fallback
    const fallbackTxn: SimulatedTransaction = {
      id: `TEST-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      currency: data.currency || currencyCode,
      paymentMethod: data.paymentMethod || 'TEST_CARD',
      status: data.initialStatus || 'TEST_RECEIVED',
      items: data.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      isTestMode: true,
      emailAlert: {
        recipient: simulatedPaymentConfig.adminEmail,
        sent: true,
        sentAt: new Date().toISOString(),
        subject: `CartNova — TEST PAYMENT ALERT — Order #${data.orderNumber} [SIMULATED TRANSACTION]`,
        status: 'SIMULATED_DISPATCH',
        messageId: `<sim-local-${Date.now()}@cartnova.dev>`,
      },
      timeline: [
        {
          status: 'TEST_PENDING',
          timestamp: new Date().toISOString(),
          note: 'Customer initiated test checkout',
        },
        {
          status: data.initialStatus || 'TEST_RECEIVED',
          timestamp: new Date().toISOString(),
          note: `Test payment alert dispatched to admin (${simulatedPaymentConfig.adminEmail})`,
        },
      ],
    };
    setSimulatedTransactions((prev) => [fallbackTxn, ...prev]);
    return fallbackTxn;
  };

  const updateSimulatedTxnStatus = async (
    id: string,
    status: SimulatedPaymentStatus,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/simulated-transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.transaction) {
          setSimulatedTransactions((prev) =>
            prev.map((t) => (t.id === id ? result.transaction : t))
          );
          if (selectedSimulatedTxn?.id === id) {
            setSelectedSimulatedTxn(result.transaction);
          }
        }
      }
    } catch {
      setSimulatedTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status,
                updatedAt: new Date().toISOString(),
                timeline: [
                  ...t.timeline,
                  {
                    status,
                    timestamp: new Date().toISOString(),
                    note: note || `Status updated to ${status} in DEMO mode`,
                  },
                ],
              }
            : t
        )
      );
    }
    addToast('info', 'Simulated Status Updated', `Test Transaction status set to ${status}`);
  };

  const resendSimulatedTxnAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/simulated-transactions/${id}/resend-alert`, {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        if (result.transaction) {
          setSimulatedTransactions((prev) =>
            prev.map((t) => (t.id === id ? result.transaction : t))
          );
          if (selectedSimulatedTxn?.id === id) {
            setSelectedSimulatedTxn(result.transaction);
          }
        }
      }
    } catch (err) {
      console.error('Error resending alert:', err);
    }
    addToast('success', '📧 Test Email Alert Dispatched', `Test notification re-sent to ${simulatedPaymentConfig.adminEmail}`);
  };

  const updateSimulatedConfig = async (newConfig: Partial<SimulatedPaymentConfig>) => {
    try {
      const res = await fetch('/api/admin/test-email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.config) {
          setSimulatedPaymentConfig(result.config);
        }
      }
    } catch {
      setSimulatedPaymentConfig((prev) => ({ ...prev, ...newConfig }));
    }
    addToast('success', 'Settings Saved', 'Simulated payment & admin email alert preferences updated.');
  };

  const triggerManualTestEmailAlert = async (params?: {
    adminEmail?: string;
    amount?: number;
    customerName?: string;
    paymentMethod?: string;
  }) => {
    try {
      const res = await fetch('/api/admin/test-email-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.transaction) {
          setSimulatedTransactions((prev) => [result.transaction, ...prev]);
        }
        addToast(
          'success',
          '⚡ TEST PAYMENT ALERT FIRED',
          `Simulated alert successfully dispatched to ${params?.adminEmail || simulatedPaymentConfig.adminEmail}`
        );
        return {
          success: true,
          message: result.message || 'Alert dispatched',
          transaction: result.transaction,
        };
      }
    } catch (err: any) {
      addToast('error', 'Dispatch Error', err.message || 'Failed to dispatch test email');
      return { success: false, message: err.message };
    }
    return { success: false, message: 'Server did not return transaction' };
  };

  // Toast notification helper
  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Authentication Handlers (Customer, Seller, or Admin)
  const loginWithEmail = async (email: string, password?: string, preferredRole?: UserRole): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      addToast('error', 'Login Failed', 'Please provide a valid email address');
      return { success: false, message: 'Email is required' };
    }

    const targetRole = preferredRole || (cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('seller') ? 'seller' : 'customer');

    const existingUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      const updatedUser: UserProfile = {
        ...existingUser,
        role: preferredRole ? preferredRole : existingUser.role,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      setActiveRole(targetRole);
      setIsLoggedIn(true);
      addToast(
        'success',
        targetRole === 'admin' ? '🛡️ Admin Access Granted' : targetRole === 'seller' ? '🏪 Merchant Portal Ready' : 'Welcome Back',
        `Logged in as ${updatedUser.name} (${targetRole.toUpperCase()})`
      );
      closeAuthModal();
      return { success: true, message: 'Login successful' };
    }

    // Auto-create user profile if email not yet registered
    const nameFromEmail = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: UserProfile = {
      id: (targetRole === 'admin' ? 'admin-' : targetRole === 'seller' ? 'seller-' : 'cust-') + Date.now(),
      name: nameFromEmail || (targetRole === 'admin' ? 'Admin Manager' : targetRole === 'seller' ? 'Marketplace Merchant' : 'Customer'),
      email: cleanEmail,
      role: targetRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameFromEmail || cleanEmail)}`,
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      phone: '+234 800 000 0000',
      storeName: targetRole === 'seller' ? `${nameFromEmail} Official Store` : undefined,
      isVerifiedSeller: targetRole === 'seller' ? true : undefined,
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setActiveRole(targetRole);
    setIsLoggedIn(true);
    addToast(
      'success',
      targetRole === 'admin' ? '🛡️ Admin Account Created' : targetRole === 'seller' ? '🏪 Merchant Account Created' : 'Account Created & Signed In',
      `Welcome to CartNova, ${newUser.name}! Accessing as ${targetRole.toUpperCase()}`
    );
    closeAuthModal();
    return { success: true, message: 'Welcome to CartNova' };
  };

  const signupWithEmail = async (name: string, email: string, password?: string, preferredRole?: UserRole): Promise<{ success: boolean; message: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const targetRole = preferredRole || (cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('seller') ? 'seller' : 'customer');

    if (!cleanName || !cleanEmail) {
      addToast('error', 'Sign Up Failed', 'Full name and email are required');
      return { success: false, message: 'Missing required fields' };
    }

    const existingUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      const updatedExisting: UserProfile = {
        ...existingUser,
        name: cleanName || existingUser.name,
        role: targetRole,
        storeName: targetRole === 'seller' ? (existingUser.storeName || `${cleanName} Official Store`) : existingUser.storeName,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === updatedExisting.id ? updatedExisting : u)));
      setCurrentUser(updatedExisting);
      setActiveRole(targetRole);
      setIsLoggedIn(true);
      addToast(
        'info',
        targetRole === 'admin' ? '🛡️ Admin Account Updated' : targetRole === 'seller' ? '🏪 Merchant Portal Synced' : 'Account Exists',
        `Signed in as ${cleanName} (${targetRole.toUpperCase()})`
      );
      closeAuthModal();
      return { success: true, message: 'Signed in with existing account' };
    }

    const newUser: UserProfile = {
      id: (targetRole === 'admin' ? 'admin-' : targetRole === 'seller' ? 'seller-' : 'cust-') + Date.now(),
      name: cleanName,
      email: cleanEmail,
      role: targetRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      phone: '+234 800 123 4567',
      storeName: targetRole === 'seller' ? `${cleanName} Official Store` : undefined,
      isVerifiedSeller: targetRole === 'seller' ? true : undefined,
      commissionRate: targetRole === 'seller' ? 0.08 : undefined,
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setActiveRole(targetRole);
    setIsLoggedIn(true);
    addToast(
      'success',
      targetRole === 'admin' ? '🛡️ Admin Account Registered' : targetRole === 'seller' ? '🏪 Merchant Store Registered' : 'Registration Complete',
      `Welcome to CartNova, ${cleanName}! Acting as ${targetRole.toUpperCase()}`
    );
    closeAuthModal();
    return { success: true, message: 'Account created successfully' };
  };

  const loginWithGoogle = async (googleAccount?: { name?: string; email?: string; avatar?: string }, preferredRole?: UserRole): Promise<{ success: boolean; message: string }> => {
    const targetEmail = (googleAccount?.email || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      addToast('error', 'Sign-In Failed', 'Please provide a valid Gmail or email address');
      return { success: false, message: 'Invalid email address' };
    }

    const targetRole = preferredRole || (targetEmail.includes('admin') ? 'admin' : targetEmail.includes('seller') ? 'seller' : 'customer');
    const autoName = targetEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const targetName = googleAccount?.name?.trim() || autoName || (targetRole === 'admin' ? 'Google Admin' : targetRole === 'seller' ? 'Google Merchant' : 'Google Customer');
    const targetAvatar = googleAccount?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}`;

    const existingUser = allUsers.find((u) => u.email.toLowerCase() === targetEmail);
    if (existingUser) {
      const updatedUser: UserProfile = {
        ...existingUser,
        name: googleAccount?.name?.trim() || existingUser.name || targetName,
        avatar: existingUser.avatar || targetAvatar,
        role: targetRole,
        authProvider: 'google',
        storeName: targetRole === 'seller' ? (existingUser.storeName || `${targetName} Official Store`) : existingUser.storeName,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      setActiveRole(targetRole);
      setIsLoggedIn(true);
      addToast(
        'success',
        targetRole === 'admin' ? '🛡️ Google Admin Connected' : targetRole === 'seller' ? '🏪 Merchant Google Connected' : 'Google Sign-In Successful',
        `Welcome back, ${updatedUser.name} (${targetRole.toUpperCase()})`
      );
      closeAuthModal();
      return { success: true, message: 'Google sign in successful' };
    }

    const newGoogleUser: UserProfile = {
      id: (targetRole === 'admin' ? 'admin-google-' : targetRole === 'seller' ? 'seller-google-' : 'google-user-') + Date.now(),
      name: targetName,
      email: targetEmail,
      role: targetRole,
      avatar: targetAvatar,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      phone: '+234 800 000 0000',
      storeName: targetRole === 'seller' ? `${targetName} Official Store` : undefined,
      isVerifiedSeller: targetRole === 'seller' ? true : undefined,
      commissionRate: targetRole === 'seller' ? 0.08 : undefined,
      address: {
        street: 'Main Street',
        city: 'Lagos',
        state: 'Lagos',
        zip: '100001',
        country: 'Nigeria',
      },
    };

    setAllUsers((prev) => [newGoogleUser, ...prev]);
    setCurrentUser(newGoogleUser);
    setActiveRole(targetRole);
    setIsLoggedIn(true);
    addToast(
      'success',
      targetRole === 'admin' ? '🛡️ Google Admin Provisioned' : targetRole === 'seller' ? '🏪 Google Merchant Onboarded' : 'Google Sign-In Successful',
      `Connected as ${targetName} (${targetRole.toUpperCase()})`
    );
    closeAuthModal();
    return { success: true, message: 'Google sign in successful' };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(GUEST_USER);
    setActiveRole('customer');
    addToast('info', 'Logged Out', 'You have been signed out of your account.');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    const currentId = currentUser.id;
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setAllUsers((prev) => {
      const updatedList = prev.map((u) => (u.id === currentId ? { ...u, ...updates } : u));
      try {
        localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    addToast('success', 'Profile Updated', 'Your profile details have been saved successfully.');
  };

  // Role switching
  const switchRole = (newRole: UserRole, targetUserId?: string) => {
    setActiveRole(newRole);
    if (targetUserId) {
      const match = allUsers.find((u) => u.id === targetUserId);
      if (match) {
        setCurrentUser(match);
        setIsLoggedIn(true);
        addToast('info', 'Profile Switched', `Now acting as ${match.name} (${match.role.toUpperCase()})`);
        return;
      }
    }
    const defaultForRole = allUsers.find((u) => u.role === newRole) || allUsers[0];
    setCurrentUser(defaultForRole);
    setIsLoggedIn(true);
    addToast('info', 'Role Changed', `Switched view to ${newRole.toUpperCase()} mode`);
  };

  // Product CRUD
  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    if (activeRole !== 'admin' && activeRole !== 'seller') {
      addToast('error', 'Access Denied', 'Admin or Seller privileges are required to create products.');
      return;
    }
    const newProduct: Product = {
      ...newProdData,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('success', 'Product Published', `"${newProduct.title}" is now live on CartNova`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (activeRole !== 'admin' && activeRole !== 'seller') {
      addToast('error', 'Access Denied', 'Admin or Seller privileges are required to modify products.');
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast('success', 'Product Updated', 'Product details saved successfully');
  };

  const deleteProduct = (id: string) => {
    if (activeRole !== 'admin' && activeRole !== 'seller') {
      addToast('error', 'Access Denied', 'Admin or Seller privileges are required to delete products.');
      return;
    }
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Product Removed', `"${target?.title || 'Item'}" was deleted`);
  };

  const toggleFeaturedProduct = (id: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to feature products.');
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedVariant?: Record<string, string>) => {
    if (product.stock <= 0) {
      addToast('error', 'Out of Stock', 'This item is currently unavailable');
      return;
    }

    setCart((prev) => {
      const variantKey = selectedVariant ? JSON.stringify(selectedVariant) : '';
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedVariant || {}) === variantKey
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          addToast('warning', 'Stock Limit', `Maximum available quantity is ${product.stock}`);
          updated[existingIndex].quantity = product.stock;
        } else {
          updated[existingIndex].quantity = newQty;
          addToast('success', 'Cart Updated', `Updated quantity for ${product.title}`);
        }
        updated[existingIndex].selected = true;
        return updated;
      } else {
        const newItem: CartItem = {
          id: 'cart-' + Date.now() + Math.random().toString(36).substring(2, 5),
          productId: product.id,
          product,
          quantity: Math.min(quantity, product.stock),
          selected: true,
          selectedVariant,
        };
        addToast('success', 'Added to Cart', `${product.title} was added to your cart`);
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    addToast('info', 'Item Removed', 'Item removed from your cart');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const clamped = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const toggleSelectCartItem = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          return { ...item, selected: item.selected === false ? true : false };
        }
        return item;
      })
    );
  };

  const selectAllCartItems = (select: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const removeSelectedFromCart = () => {
    const selectedItems = cart.filter((i) => i.selected !== false);
    if (selectedItems.length === 0) return;
    setCart((prev) => prev.filter((item) => item.selected === false));
    addToast('info', 'Items Removed', `Removed ${selectedItems.length} selected item(s) from cart`);
  };

  const moveSelectedToWishlist = () => {
    const selectedItems = cart.filter((i) => i.selected !== false);
    if (selectedItems.length === 0) return;
    selectedItems.forEach((item) => {
      if (!wishlist.includes(item.productId)) {
        setWishlist((prev) => [...prev, item.productId]);
      }
    });
    setCart((prev) => prev.filter((item) => item.selected === false));
    addToast('success', 'Saved to Wishlist', `Moved ${selectedItems.length} item(s) to your wishlist`);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const selectedCartItems = useMemo(() => {
    return cart.filter((item) => item.selected !== false);
  }, [cart]);

  const selectedCartCount = useMemo(() => {
    return selectedCartItems.reduce((total, item) => total + item.quantity, 0);
  }, [selectedCartItems]);

  const selectedCartSubtotal = useMemo(() => {
    return selectedCartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [selectedCartItems]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    const prod = products.find((p) => p.id === productId);
    if (isSaved) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      addToast('info', 'Removed from Wishlist', `${prod?.title || 'Item'} removed from favorites`);
    } else {
      setWishlist((prev) => [...prev, productId]);
      addToast('success', 'Saved to Wishlist', `${prod?.title || 'Item'} added to favorites`);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders
  const createOrder = (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>
  ): Order => {
    const orderNumber = 'CN-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          title: 'Order Confirmed',
          description: `Payment received via ${orderData.paymentMethod.replace('_', ' ').toUpperCase()}. Routing to sellers for fulfillment.`,
        },
      ],
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = orderData.items.find((item) => item.productId === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    // Remove ordered items from cart (keeping unselected items)
    setCart((prev) =>
      prev.filter(
        (c) =>
          !orderData.items.some(
            (it) =>
              it.productId === c.productId &&
              JSON.stringify(it.selectedVariant || {}) === JSON.stringify(c.selectedVariant || {})
          )
      )
    );
    setAppliedCoupon(null);
    addToast('success', 'Order Placed!', `Order #${orderNumber} confirmed. Thank you!`);

    // Auto-create customer notification
    const firstItem = orderData.items[0];
    const newNotif: CustomerNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id || 'user-cust-1',
      title: `Order #${orderNumber} Confirmed`,
      message: `Your payment was confirmed and order #${orderNumber} with ${orderData.items.length} item(s) is being prepared for dispatch.`,
      type: 'order',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      actionType: 'order',
      actionId: newOrder.id,
      image: firstItem?.productImage,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Dispatch Simulated Payment Alert to configured Admin Gmail
    recordSimulatedPayment({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      amount: newOrder.totalAmount,
      currency: currentCurrency.code,
      paymentMethod: newOrder.paymentMethod,
      items: newOrder.items.map((it) => ({
        id: it.productId,
        title: (it as any).title || (it as any).productTitle || 'CartNova Store Item',
        price: (it as any).price || (it as any).unitPrice || 0,
        quantity: it.quantity,
        image: (it as any).productImage || (it as any).image,
      })),
      initialStatus: 'TEST_RECEIVED',
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const statusLabels: Record<OrderStatus, { title: string; desc: string }> = {
            pending: { title: 'Order Pending', desc: 'Order received and awaiting processing.' },
            processing: { title: 'Packaging & Prep', desc: 'Item inspected and securely packed.' },
            shipped: { title: 'Shipped with Courier', desc: note || 'Dispatched with tracking assigned.' },
            delivered: { title: 'Delivered', desc: note || 'Package delivered to recipient address.' },
            cancelled: { title: 'Order Cancelled', desc: note || 'Order was cancelled and payment reversed.' },
          };

          const event: Order['timeline'][0] = {
            status,
            timestamp: new Date().toISOString(),
            title: statusLabels[status].title,
            description: note || statusLabels[status].desc,
          };

          // Generate notification
          const statusNotif: CustomerNotification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            userId: ord.customerId || 'all',
            title: `Order #${ord.orderNumber}: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: note || statusLabels[status].desc,
            type: 'order',
            timestamp: new Date().toISOString(),
            read: false,
            priority: status === 'delivered' || status === 'shipped' ? 'high' : 'normal',
            actionType: 'order',
            actionId: ord.id,
            image: ord.items[0]?.productImage,
          };
          setNotifications((prevNotifs) => [statusNotif, ...prevNotifs]);

          return {
            ...ord,
            status,
            paymentStatus: status === 'cancelled' ? 'refunded' : ord.paymentStatus,
            timeline: [...ord.timeline, event],
          };
        }
        return ord;
      })
    );
    addToast('info', 'Order Updated', `Status changed to ${status.toUpperCase()}`);
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled', 'Cancelled by customer request');
  };

  // Customer Notifications filtering & management
  const userNotifications = useMemo(() => {
    return notifications.filter(
      (n) =>
        n.userId === 'all' ||
        n.userId === currentUser.id ||
        (!isLoggedIn && (n.userId === 'user-cust-1' || n.userId === 'guest'))
    );
  }, [notifications, currentUser.id, isLoggedIn]);

  const unreadNotificationsCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read).length;
  }, [userNotifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        const isUserNotif =
          n.userId === 'all' ||
          n.userId === currentUser.id ||
          (!isLoggedIn && (n.userId === 'user-cust-1' || n.userId === 'guest'));
        if (isUserNotif) {
          return { ...n, read: true };
        }
        return n;
      })
    );
    addToast('info', 'Notifications', 'All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) =>
      prev.filter(
        (n) =>
          !(
            n.userId === 'all' ||
            n.userId === currentUser.id ||
            (!isLoggedIn && (n.userId === 'user-cust-1' || n.userId === 'guest'))
          )
      )
    );
    addToast('info', 'Notifications', 'All notifications cleared');
  };

  const addNotification = (
    notificationData: Omit<CustomerNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotif: CustomerNotification = {
      ...notificationData,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleNotificationAction = (notification: CustomerNotification) => {
    markNotificationAsRead(notification.id);
    setIsNotificationPopoverOpen(false);

    if (notification.actionType === 'order') {
      setActiveCustomerTab('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (notification.actionType === 'product' && notification.actionId) {
      viewProductDetail(notification.actionId);
    } else if (notification.actionType === 'flash_deals') {
      setActiveCustomerTab('shop');
      setTimeout(() => {
        const el = document.getElementById('flash-deals-section') || document.getElementById('product-catalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (notification.actionType === 'wishlist') {
      setActiveCustomerTab('wishlist');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (notification.actionType === 'profile') {
      setActiveCustomerTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (notification.actionType === 'category' && notification.actionPayload) {
      executeSearch('', notification.actionPayload);
    }
  };

  // Reviews
  const addReview = (
    productId: string,
    rating: number,
    title: string,
    comment: string,
    images?: string[],
    ratingsBreakdown?: { quality?: number; value?: number; shipping?: number }
  ) => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      title,
      comment,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
      helpfulCount: 0,
      images: images && images.length > 0 ? images : undefined,
      ratingsBreakdown: ratingsBreakdown || {
        quality: rating,
        value: rating,
        shipping: 5,
      },
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate product rating & count
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const productReviews = [newRev, ...reviews.filter((r) => r.productId === productId)];
          const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
          return {
            ...p,
            rating: Math.round(avg * 10) / 10,
            reviewCount: productReviews.length,
          };
        }
        return p;
      })
    );

    addToast('success', 'Review Published', 'Thank you for your valuable feedback!');
  };

  const voteHelpfulReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpfulCount: (r.helpfulCount || 0) + 1,
          };
        }
        return r;
      })
    );
    addToast('info', 'Helpful Vote Recorded', 'Thank you for rating this review');
  };

  const replyToReview = (reviewId: string, message: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            sellerReply: {
              message,
              date: new Date().toISOString().split('T')[0],
              sellerName: currentUser.storeName || currentUser.name,
            },
          };
        }
        return r;
      })
    );
    addToast('success', 'Reply Sent', 'Your response to the customer has been posted');
  };

  // Coupon handling
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const match = coupons.find((c) => c.code === clean);
    if (!match) {
      return { success: false, message: 'Invalid promo code' };
    }
    if (cartSubtotal < (match.minSpend || match.minOrderAmount || 0)) {
      const minRequired = match.minSpend || match.minOrderAmount || 0;
      return {
        success: false,
        message: `Minimum spend of ${formatPrice(minRequired)} required for code ${match.code}`,
      };
    }
    setAppliedCoupon(match);
    addToast('success', 'Promo Code Applied', match.description);
    return { success: true, message: `Applied ${match.code}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('info', 'Promo Removed', 'Coupon was removed from order');
  };

  // Customer Support Handlers
  const openSupportTicket = (ticketId?: string) => {
    if (ticketId) {
      setActiveTicketId(ticketId);
    }
    setActiveCustomerTab('support');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createSupportTicket = (
    data: {
      subject: string;
      category: SupportCategory;
      priority: SupportPriority;
      orderId?: string;
      orderNumber?: string;
      productName?: string;
      customerPhone?: string;
    },
    initialMessage: string
  ): SupportTicket => {
    const ticketNum = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: 'tkt-' + Date.now(),
      ticketNumber: ticketNum,
      customerId: currentUser.id,
      customerName: currentUser.name || 'Customer',
      customerEmail: currentUser.email || 'customer@example.com',
      customerPhone: data.customerPhone || currentUser.phone,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: 'open',
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      productName: data.productName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAgent: {
        name: 'Chioma Adebayo',
        title: 'Customer Success Specialist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        rating: 4.9,
      },
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'customer',
          senderName: currentUser.name || 'Customer',
          senderAvatar: currentUser.avatar,
          text: initialMessage,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    setActiveTicketId(newTicket.id);

    // Auto-generate notification
    addNotification({
      userId: currentUser.id,
      title: `Support Ticket #${ticketNum} Logged`,
      message: `Your inquiry "${data.subject}" is now recorded and assigned to our Customer Care team.`,
      type: 'system',
      priority: data.priority === 'urgent' || data.priority === 'high' ? 'high' : 'normal',
    });

    addToast('success', 'Ticket Submitted', `Ticket #${ticketNum} is now open`);
    return newTicket;
  };

  const addMessageToSupportTicket = (
    ticketId: string,
    text: string,
    sender: 'customer' | 'agent' = 'customer'
  ) => {
    if (!text.trim()) return;

    const newMessage: SupportMessage = {
      id: 'msg-' + Date.now(),
      sender,
      senderName: sender === 'customer' ? currentUser.name : 'Chioma Adebayo',
      senderAvatar:
        sender === 'customer'
          ? currentUser.avatar
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setSupportTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: sender === 'customer' ? 'in_progress' : 'waiting_user',
            updatedAt: new Date().toISOString(),
            messages: [...ticket.messages, newMessage],
          };
        }
        return ticket;
      })
    );

    // If customer sent a message, simulate specialist update after brief delay
    if (sender === 'customer') {
      setTimeout(() => {
        const agentReply: SupportMessage = {
          id: 'msg-reply-' + Date.now(),
          sender: 'agent',
          senderName: 'Chioma Adebayo',
          senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          text: `Thank you for your update! We have noted your message on ticket #${ticketId.replace(
            'tkt-',
            'TKT-'
          )}. Our support team is actively working with warehouse dispatch to resolve this.`,
          timestamp: new Date().toISOString(),
        };

        setSupportTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  messages: [...t.messages, agentReply],
                }
              : t
          )
        );
      }, 2500);
    }
  };

  const updateTicketStatus = (ticketId: string, status: SupportStatus, note?: string) => {
    setSupportTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status,
            updatedAt: new Date().toISOString(),
            resolutionNote: note || ticket.resolutionNote,
          };
        }
        return ticket;
      })
    );
    addToast('info', 'Ticket Updated', `Status changed to ${status.replace('_', ' ').toUpperCase()}`);
  };

  const sendLiveSupportChatMessage = async (text: string, orderContextId?: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userMsg: SupportMessage = {
      id: 'chat-user-' + Date.now(),
      sender: 'customer',
      senderName: currentUser.name || 'Customer',
      senderAvatar: currentUser.avatar,
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    setSupportChatMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/customer-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          customerName: currentUser.name || 'Customer',
          orders: orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            total: o.total,
            items: o.items,
            createdAt: o.createdAt,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Support API offline');
      }

      const data = await response.json();
      const botMsg: SupportMessage = {
        id: 'chat-bot-' + Date.now(),
        sender: 'bot',
        senderName: data.agentName || 'Nova Support Concierge',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: data.reply || "I'm checking that for you right away!",
        timestamp: new Date().toISOString(),
        suggestedActions: data.suggestedActions || [],
      };

      setSupportChatMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: SupportMessage = {
        id: 'chat-bot-fallback-' + Date.now(),
        sender: 'bot',
        senderName: 'Nova Support Concierge',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: `Hello ${currentUser.name}! I have received your message. You can manage and track all your active shipments in your Orders tab, or create an escalated support ticket with our specialist team.`,
        timestamp: new Date().toISOString(),
        suggestedActions: [
          { label: '📦 Track My Orders', actionType: 'view_order' },
          { label: '🎫 Open Support Ticket', actionType: 'open_ticket' },
          { label: '🔄 Request Return / Refund', actionType: 'refund' },
        ],
      };
      setSupportChatMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const prefillSupportForOrder = (order: Order, category: SupportCategory = 'order_issue') => {
    setActiveCustomerTab('support');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('info', 'Order Support Context Loaded', `Ready to help with Order #${order.orderNumber}`);
  };

  const voteFaq = (faqId: string, isHelpful: boolean) => {
    setFaqs((prev) =>
      prev.map((f) => {
        if (f.id === faqId) {
          return {
            ...f,
            helpfulCount: isHelpful ? f.helpfulCount + 1 : Math.max(0, f.helpfulCount - 1),
          };
        }
        return f;
      })
    );
    addToast('success', 'Feedback Recorded', 'Thank you for helping us improve our FAQ answers!');
  };

  const submitOrderDisputeOrRefund = (
    orderId: string,
    itemIds: string[],
    reason: string,
    refundMethod: 'wallet' | 'card' | 'replacement',
    details?: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const orderNum = targetOrder ? targetOrder.orderNumber : 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const rmaNumber = 'RMA-' + Math.floor(100000 + Math.random() * 900000);

    const ticketSubject = `Refund / Return Request [${rmaNumber}] for Order #${orderNum}`;
    const initialMsg = `Customer requested ${refundMethod.toUpperCase()} resolution for Order #${orderNum}. Reason: ${reason}. ${
      details ? `Additional Details: ${details}` : ''
    }`;

    const newTicket = createSupportTicket(
      {
        subject: ticketSubject,
        category: 'refund_return',
        priority: 'high',
        orderId,
        orderNumber: orderNum,
        productName: targetOrder?.items[0]?.title || 'Order Items',
      },
      initialMsg
    );

    addNotification({
      userId: currentUser.id,
      title: `Return Authorized: ${rmaNumber}`,
      message: `Your return request for Order #${orderNum} has been received. RMA tracking code ${rmaNumber} is active.`,
      type: 'order',
      priority: 'high',
    });

    addToast('success', 'Return Request Submitted', `RMA Code: ${rmaNumber}`);
    return { success: true, rmaNumber, ticket: newTicket };
  };

  const approveRefundDispute = (
    ticketId: string,
    orderId: string,
    refundAmount?: number,
    resolutionNote?: string
  ) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to authorize refunds.');
      return;
    }
    const targetOrder = orders.find((o) => o.id === orderId);
    const targetTicket = supportTickets.find((t) => t.id === ticketId);
    const amountToCredit = refundAmount || targetOrder?.totalAmount || 0;

    if (amountToCredit > 0) {
      creditWallet(amountToCredit, `Refund for Order #${targetOrder?.orderNumber || orderId}`);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'refunded', status: 'cancelled' } : o))
    );

    const resolutionMsg: SupportMessage = {
      id: 'msg-approved-' + Date.now(),
      sender: 'agent',
      senderName: 'CartNova Finance & Refunds Desk',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: `Your refund of ₦${amountToCredit.toLocaleString()} has been approved and credited to your CartNova Wallet immediately! ${resolutionNote || ''}`,
      timestamp: new Date().toISOString(),
    };

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'resolved',
              updatedAt: new Date().toISOString(),
              resolutionNote: resolutionNote || 'Refund approved and wallet credited',
              messages: [...t.messages, resolutionMsg],
            }
          : t
      )
    );

    addNotification({
      userId: targetTicket?.customerId || currentUser.id,
      title: 'Refund Approved & Deposited',
      message: `₦${amountToCredit.toLocaleString()} has been credited to your CartNova Wallet for Order #${targetOrder?.orderNumber || orderId}.`,
      type: 'order',
      priority: 'high',
    });

    addToast('success', 'Refund Approved', `₦${amountToCredit.toLocaleString()} credited to customer wallet.`);
  };

  const rejectRefundDispute = (ticketId: string, reasonNote?: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to moderate dispute tickets.');
      return;
    }
    const targetTicket = supportTickets.find((t) => t.id === ticketId);
    const rejectionMsg: SupportMessage = {
      id: 'msg-reject-' + Date.now(),
      sender: 'agent',
      senderName: 'CartNova Compliance Desk',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: `Return/Refund request has been reviewed and declined. Reason: ${reasonNote || 'Item does not meet return policy criteria.'}`,
      timestamp: new Date().toISOString(),
    };

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'closed',
              updatedAt: new Date().toISOString(),
              resolutionNote: reasonNote || 'Dispute rejected by administration',
              messages: [...t.messages, rejectionMsg],
            }
          : t
      )
    );

    addNotification({
      userId: targetTicket?.customerId || currentUser.id,
      title: 'Refund Request Update',
      message: `Your return request on Ticket #${targetTicket?.ticketNumber || ticketId} was declined. Reason: ${reasonNote || 'Policy criteria not met.'}`,
      type: 'order',
      priority: 'normal',
    });

    addToast('info', 'Dispute Rejected', 'Ticket status updated to Closed.');
  };

  const broadcastNotification = (
    title: string,
    message: string,
    type: NotificationType = 'system',
    priority: 'low' | 'normal' | 'high' = 'normal'
  ) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to broadcast notifications.');
      return;
    }
    const newNotifId = 'notif-bc-' + Date.now();
    const created: CustomerNotification = {
      id: newNotifId,
      userId: 'all',
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
    };

    setNotifications((prev) => [created, ...prev]);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([created, ...notifications]));
    } catch {}

    addToast('success', 'Broadcast Sent', `Notification "${title}" delivered to all users.`);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to modify user roles.');
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
      setActiveRole(newRole);
    }
    addToast('success', 'Role Updated', `User role modified to ${newRole.toUpperCase()}`);
  };

  // Currency
  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES.NGN;
  const setCurrency = (code: CurrencyCode) => setCurrencyCode(code);

  const formatPrice = (amountInUSD: number) => {
    if (amountInUSD === undefined || amountInUSD === null || isNaN(amountInUSD)) {
      return `${currentCurrency.symbol}0`;
    }
    const converted = amountInUSD * currentCurrency.rate;
    if (currentCurrency.code === 'NGN') {
      return `${currentCurrency.symbol}${Math.round(converted).toLocaleString('en-NG')}`;
    }
    return `${currentCurrency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtered products list with smart relevance ranking and full filter/sort matrix
  const filteredProducts = useMemo(() => {
    const rawQuery = filters.searchQuery.trim().toLowerCase();
    // Normalize rawQuery: replace & with and, filter out stop words
    const rawQueryClean = rawQuery.replace(/&/g, 'and');
    const tokens = rawQuery
      ? rawQueryClean
          .split(/[\s,/-]+/)
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t && t !== 'and' && t !== 'the' && t !== 'for')
      : [];

    const normalizeCat = (s: string) =>
      (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

    const scored = products
      .map((p) => {
        let relevanceScore = 0;

        if (tokens.length > 0) {
          const title = (p.title || '').toLowerCase();
          const desc = `${p.description || ''} ${p.shortDescription || ''}`.toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          const category = (p.category || '').toLowerCase();
          const tags = (p.tags || []).map((t) => t.toLowerCase());
          const specs = Object.entries(p.specs || {})
            .map(([k, v]) => `${k} ${v}`.toLowerCase())
            .join(' ');
          const seller = (p.sellerName || '').toLowerCase();
          const searchable = `${title} ${brand} ${category} ${tags.join(' ')} ${specs} ${seller} ${desc}`;

          // All tokens must match somewhere in searchable text or category name
          const matchesAllTokens = tokens.every((tok) => {
            const cleanTok = tok.endsWith('s') && tok.length > 4 ? tok.slice(0, -1) : tok;
            return searchable.includes(tok) || searchable.includes(cleanTok);
          });
          if (!matchesAllTokens) return null;

          // Exact full phrase bonus
          if (title.includes(rawQuery)) relevanceScore += 50;
          if (title.startsWith(rawQuery)) relevanceScore += 30;
          if (brand.includes(rawQuery)) relevanceScore += 25;
          if (category.includes(rawQuery) || normalizeCat(category).includes(normalizeCat(rawQuery))) relevanceScore += 35;

          // Per-token weights
          tokens.forEach((tok) => {
            if (title.includes(tok)) relevanceScore += 15;
            if (brand.includes(tok)) relevanceScore += 10;
            if (tags.some((t) => t.includes(tok))) relevanceScore += 8;
            if (category.includes(tok)) relevanceScore += 12;
            if (specs.includes(tok)) relevanceScore += 4;
            if (desc.includes(tok)) relevanceScore += 2;
          });
        }

        // Category filter (support category name, category slug, and normalized variations case-insensitively)
        if (filters.category !== 'all') {
          const catFilter = filters.category.toLowerCase().trim();
          const pCat = (p.category || '').toLowerCase().trim();
          const catObj = categories.find(
            (c) =>
              c.slug.toLowerCase() === catFilter ||
              c.name.toLowerCase() === catFilter ||
              normalizeCat(c.name) === normalizeCat(catFilter) ||
              normalizeCat(c.slug) === normalizeCat(catFilter)
          );
          const targetName = catObj ? catObj.name.toLowerCase() : catFilter;
          const targetSlug = catObj ? catObj.slug.toLowerCase() : catFilter;

          const catFilterNorm = normalizeCat(catFilter);
          const pCatNorm = normalizeCat(pCat);
          const targetNameNorm = normalizeCat(targetName);
          const targetSlugNorm = normalizeCat(targetSlug);

          const matchCat =
            pCat === catFilter ||
            pCat === targetName ||
            pCat === targetSlug ||
            pCatNorm === catFilterNorm ||
            pCatNorm === targetNameNorm ||
            pCatNorm === targetSlugNorm ||
            // Phones & Tablets alias matching
            ((catFilterNorm.includes('phone') || catFilterNorm.includes('tablet') || catFilterNorm.includes('mobile')) &&
              (pCatNorm.includes('phone') || pCatNorm.includes('tablet') || pCatNorm.includes('mobile'))) ||
            (catFilter === 'electronics' && (pCat.includes('electron') || pCat.includes('appliance') || pCat.includes('tv'))) ||
            ((catFilter === 'games & toys' || catFilter === 'games-toys' || catFilter === 'toys-games' || catFilterNorm.includes('gamestoy') || catFilterNorm.includes('toysgame')) &&
              (pCat.includes('game') || pCat.includes('toy'))) ||
            (catFilter === 'automotive' && pCat.includes('auto')) ||
            (catFilter === 'gadgets' && pCat.includes('gadget')) ||
            (catFilter === 'books' && pCat.includes('book')) ||
            (catFilter === 'accessories' && pCat.includes('accessor')) ||
            (catFilter === 'groceries' && (pCat.includes('grocer') || pCat.includes('food'))) ||
            ((catFilter === 'sports & fitness' || catFilter === 'sports-fitness' || catFilterNorm.includes('sportsfitness')) &&
              (pCat.includes('sport') || pCat.includes('fitness')));

          if (!matchCat) return null;
        }

        // Subcategory filter
        if (filters.subcategory && filters.subcategory.trim() !== '') {
          const subFilter = filters.subcategory.toLowerCase().trim();
          const cleanSub = subFilter.endsWith('s') ? subFilter.slice(0, -1) : subFilter;
          const subWords = subFilter.split(/[\s,&/-]+/).filter((w) => w.length > 2);
          const pTags = (p.tags || []).map((t) => t.toLowerCase());
          const pTitle = (p.title || '').toLowerCase();
          const pShort = (p.shortDescription || '').toLowerCase();
          const pDesc = (p.description || '').toLowerCase();
          const pSpecs = Object.entries(p.specs || {}).map(([k, v]) => `${k} ${v}`.toLowerCase()).join(' ');

          const matchesSub =
            pTags.some((t) => t.includes(subFilter) || t.includes(cleanSub) || (cleanSub.length > 3 && t.includes(cleanSub))) ||
            pTitle.includes(subFilter) ||
            pTitle.includes(cleanSub) ||
            pShort.includes(subFilter) ||
            pShort.includes(cleanSub) ||
            pDesc.includes(subFilter) ||
            pSpecs.includes(subFilter) ||
            (subWords.length > 0 && subWords.every((w) => pTitle.includes(w) || pTags.some((t) => t.includes(w)) || pShort.includes(w) || pDesc.includes(w) || pSpecs.includes(w)));
          if (!matchesSub) return null;
        }

        // Brands filter (multi-select)
        if (filters.brands && filters.brands.length > 0) {
          const matchBrand = filters.brands.some(
            (b) => b.toLowerCase() === (p.brand || '').toLowerCase()
          );
          if (!matchBrand) return null;
        }

        // Price range
        if (p.price < filters.minPrice || p.price > filters.maxPrice) return null;

        // Rating filter
        if (filters.minRating > 0 && p.rating < filters.minRating) return null;

        // In stock
        if (filters.inStockOnly && p.stock <= 0) return null;

        // Calculate discount percentage
        const discountPct =
          p.discount ||
          (p.originalPrice && p.originalPrice > p.price
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
            : 0);

        // On sale only filter
        if (filters.onSaleOnly && discountPct <= 0) return null;

        // Minimum discount filter
        if (filters.minDiscount > 0 && discountPct < filters.minDiscount) return null;

        // Free shipping filter
        if (filters.freeShippingOnly) {
          const isFreeShipping =
            p.shippingFee === 0 ||
            p.freeShipping === true ||
            p.tags?.some((t) => t.toLowerCase().includes('free shipping'));
          if (!isFreeShipping) return null;
        }

        // Featured only filter
        if (filters.featuredOnly && !p.isFeatured) return null;

        // Seller filter
        if (filters.sellerId !== 'all' && p.sellerId !== filters.sellerId) return null;

        return { product: p, score: relevanceScore, discountPct };
      })
      .filter((item): item is { product: Product; score: number; discountPct: number } => item !== null);

    scored.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.product.price - b.product.price;
        case 'price-desc':
          return b.product.price - a.product.price;
        case 'rating':
          if (b.product.rating !== a.product.rating) {
            return b.product.rating - a.product.rating;
          }
          return (b.product.reviewCount || 0) - (a.product.reviewCount || 0);
        case 'reviews':
          return (b.product.reviewCount || 0) - (a.product.reviewCount || 0);
        case 'discount':
          return b.discountPct - a.discountPct;
        case 'newest':
          return new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime();
        case 'name-asc':
          return a.product.title.localeCompare(b.product.title);
        case 'name-desc':
          return b.product.title.localeCompare(a.product.title);
        case 'relevance':
          return b.score - a.score;
        case 'featured':
        default:
          // If user searched a keyword, relevance score takes priority if unequal
          if (tokens.length > 0 && Math.abs(b.score - a.score) > 0) {
            return b.score - a.score;
          }
          if (a.product.isFeatured && !b.product.isFeatured) return -1;
          if (!a.product.isFeatured && b.product.isFeatured) return 1;
          return (b.product.reviewCount || 0) - (a.product.reviewCount || 0);
      }
    });

    return scored.map((item) => item.product);
  }, [products, filters]);

  const selectedCategory = filters.category;
  const setSelectedCategory = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Nova+ Prime Handlers
  const setIsNovaPrime = (isMember: boolean) => {
    setIsNovaPrimeState(isMember);
    try {
      localStorage.setItem(STORAGE_KEYS.NOVA_PRIME, String(isMember));
    } catch {}
    if (isMember) {
      addToast('success', '👑 Nova+ Prime Activated!', 'You now enjoy Free 1-Day Express Shipping & 15% Exclusive Member Discounts');
    }
  };

  const toggleNovaPrime = () => {
    setIsNovaPrime(!isNovaPrime);
  };

  // Slash It to ₦0 Handlers
  const slashPrice = (slashId: string) => {
    let result = { amount: 0, remaining: 0, completed: false };
    setSlashItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== slashId || item.status === 'completed' || item.status === 'claimed') return item;

        const cut = Math.min(item.currentPrice, Math.floor(Math.random() * 1200) + 600);
        const newCurrent = Math.max(0, item.currentPrice - cut);
        const newTotalSlashed = item.slashedTotal + cut;
        const newPercentage = Number(((newTotalSlashed / item.originalPrice) * 100).toFixed(1));
        const newSlashesLeft = Math.max(0, item.slashesLeft - 1);
        const isNowDone = newCurrent === 0 || newSlashesLeft === 0;

        const assistEntry: FriendSlashAssist = {
          id: `ast-${Date.now()}`,
          name: currentUser?.name || 'You',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          amount: cut,
          time: 'Just now',
        };

        const newItem: SlashGameItem = {
          ...item,
          currentPrice: newCurrent,
          slashedTotal: newTotalSlashed,
          percentageSlashed: isNowDone ? 100 : Math.min(99.9, newPercentage),
          slashesLeft: newSlashesLeft,
          status: isNowDone ? 'completed' : 'active',
          assists: [assistEntry, ...item.assists],
        };

        result = { amount: cut, remaining: newCurrent, completed: isNowDone };
        if (activeSlashItem?.id === slashId) {
          setActiveSlashItem(newItem);
        }
        return newItem;
      });

      try {
        localStorage.setItem(STORAGE_KEYS.SLASH_ITEMS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return result;
  };

  const simulateFriendSlash = (slashId: string) => {
    const friendNames = [
      { name: 'Kelechi Okafor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { name: 'Bolanle Adeyemi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { name: 'Emeka Eze', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    ];

    setSlashItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== slashId) return item;
        const newAssists = friendNames.map((f, i) => ({
          id: `friend-${Date.now()}-${i}`,
          name: f.name,
          avatar: f.avatar,
          amount: Math.floor(item.currentPrice / friendNames.length) + (i === 0 ? item.currentPrice % friendNames.length : 0),
          time: 'Just now',
        }));

        const newItem: SlashGameItem = {
          ...item,
          currentPrice: 0,
          slashedTotal: item.originalPrice,
          percentageSlashed: 100,
          slashesLeft: 0,
          status: 'completed',
          assists: [...newAssists, ...item.assists],
        };

        if (activeSlashItem?.id === slashId) {
          setActiveSlashItem(newItem);
        }
        return newItem;
      });

      try {
        localStorage.setItem(STORAGE_KEYS.SLASH_ITEMS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addToast('success', '🎉 100% Slashed to ₦0!', 'Your friends helped slash the price down to ₦0! Claim your free item now.');
  };

  const claimSlashedItem = (slashId: string) => {
    const slashItem = slashItems.find((s) => s.id === slashId);
    if (!slashItem) return;

    const targetProduct: Product = products.find((p) => p.id === slashItem.productId) || {
      id: slashItem.productId,
      title: slashItem.title,
      slug: `slashed-${slashItem.id}`,
      description: 'Exclusive 100% Free Slash Reward Prize',
      shortDescription: 'Free Slashed Reward Item',
      price: 0,
      originalPrice: slashItem.originalPrice,
      discountPercentage: 100,
      category: 'Electronics & Gadgets',
      brand: 'CartNova Free Rewards',
      images: [slashItem.image],
      rating: 5.0,
      reviewCount: 999,
      stock: 50,
      sellerId: 'cartnova-direct',
      sellerName: 'CartNova Direct Warehouse',
      tags: ['free item', 'price slash', 'reward'],
      specs: { 'Status': '100% Slashed Free Gift', 'Delivery': 'Express Priority Free' },
      createdAt: new Date().toISOString(),
    };

    addToCart({ ...targetProduct, price: 0, originalPrice: slashItem.originalPrice }, 1);

    setSlashItems((prev) => {
      const updated = prev.map((s) => (s.id === slashId ? { ...s, status: 'claimed' as const } : s));
      try {
        localStorage.setItem(STORAGE_KEYS.SLASH_ITEMS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addToast('success', '🎁 Free Item Added to Cart!', `${slashItem.title} added for ₦0. Complete checkout to dispatch!`);
    setIsSlashModalOpen(false);
    setIsCartOpen(true);
  };

  // Mystery Box Handlers
  const openMysteryBox = async (boxTierId: string): Promise<MysteryBoxPrize> => {
    const tier = mysteryBoxes.find((b) => b.id === boxTierId) || mysteryBoxes[0];
    const rand = Math.random() * 100;
    let accumulated = 0;
    let selectedPrize = tier.prizes[0];
    for (const prize of tier.prizes) {
      accumulated += prize.chance;
      if (rand <= accumulated) {
        selectedPrize = prize;
        break;
      }
    }

    setUnboxedPrizes((prev) => {
      const updated = [selectedPrize, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MYSTERY_PRIZES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return selectedPrize;
  };

  const claimMysteryPrize = (prize: MysteryBoxPrize) => {
    if (prize.title.toLowerCase().includes('coupon') || prize.title.toLowerCase().includes('pass')) {
      applyCoupon('CARTNOVA100');
      addToast('success', '🎟️ Voucher Activated!', `${prize.title} applied to your account.`);
    } else {
      const prizeProduct: Product = {
        id: `mystery-${prize.id}-${Date.now()}`,
        title: `[MYSTERY BOX PRIZE] ${prize.title}`,
        slug: `mystery-prize-${prize.id}`,
        description: `Exclusive unboxed ${prize.rarity} mystery box treasure prize!`,
        shortDescription: `${prize.rarity} Mystery Item`,
        price: 0,
        originalPrice: prize.retailPrice,
        discountPercentage: 100,
        category: 'Electronics & Gadgets',
        brand: 'CartNova Mystery Drop',
        images: [prize.image],
        rating: 5.0,
        reviewCount: 340,
        stock: 100,
        sellerId: 'cartnova-vault',
        sellerName: 'CartNova Mystery Vault',
        tags: ['mystery box', 'free gift', 'unboxed'],
        specs: { 'Rarity': prize.rarity, 'Retail Value': `₦${prize.retailPrice.toLocaleString()}` },
        createdAt: new Date().toISOString(),
      };
      addToCart(prizeProduct, 1);
      addToast('success', '🎁 Mystery Prize Added for ₦0!', `${prize.title} added to cart.`);
    }
  };

  // 1-Click Buy Handler
  const oneClickBuy = (product: Product, quantity = 1, selectedVariants?: Record<string, string>) => {
    const unitPrice = isNovaPrime && product.discountPercentage ? Math.floor(product.price * 0.9) : product.price;
    const subtotal = unitPrice * quantity;
    const shippingFee = 0;
    const newOrder: Order = {
      id: `ord-1click-${Date.now()}`,
      orderNumber: `CN-1CLICK-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone || '+234 801 234 5678',
      items: [
        {
          productId: product.id,
          productTitle: product.title,
          productImage: product.images[0] || '',
          quantity,
          unitPrice,
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          selectedVariant: selectedVariants || {},
        },
      ],
      subtotal,
      tax: 0,
      shippingFee,
      discountAmount: isNovaPrime ? Math.floor(product.price * 0.1 * quantity) : 0,
      totalAmount: subtotal,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      shippingAddress: currentUser.address || {
        fullName: currentUser.name,
        street: '14 Marina Boulevard, Victoria Island',
        city: 'Lagos',
        state: 'Lagos State',
        zip: '101241',
        country: 'Nigeria',
      },
      shippingSpeed: isNovaPrime ? 'overnight' : 'express',
      trackingNumber: `CNTRK${Math.floor(100000000 + Math.random() * 900000000)}`,
      carrier: isNovaPrime ? 'CartNova Prime Express 1-Day' : 'CartNova Direct Courier',
      estimatedDelivery: 'Tomorrow by 2:00 PM',
      timeline: [
        {
          status: 'processing',
          timestamp: new Date().toISOString(),
          title: 'Order Placed with 1-Click Buy',
          description: 'Payment authorized instantly via default 1-Click Card. Preparing dispatch.',
        },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() + 3600000).toISOString(),
          title: 'Dispatched from CartNova Hub',
          description: 'Package sorted and handed to express carrier.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setOneClickBuySuccessOrder(newOrder);
    addToast('success', '⚡ 1-Click Buy Success!', `Order #${newOrder.orderNumber} placed for ${product.title}`);

    // Dispatch Simulated Payment Alert for 1-Click Buy
    recordSimulatedPayment({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      amount: newOrder.totalAmount,
      currency: currentCurrency.code,
      paymentMethod: 'ONE_CLICK_CARD',
      items: [
        {
          id: product.id,
          title: product.title,
          price: unitPrice,
          quantity,
          image: product.images[0] || '',
        },
      ],
      initialStatus: 'TEST_RECEIVED',
    });
  };

  // Product Q&A Handlers
  const askProductQuestion = (productId: string, question: string) => {
    if (!question.trim()) return;
    const newQ: ProductQuestion = {
      id: `q-${Date.now()}`,
      productId,
      question: question.trim(),
      askedBy: currentUser.name,
      date: 'Just now',
      votes: 1,
      answers: [],
    };
    setProductQuestions((prev) => {
      const updated = [newQ, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('success', 'Question Posted!', 'Your question was submitted to the community and seller.');
  };

  const answerProductQuestion = (questionId: string, answer: string) => {
    if (!answer.trim()) return;
    setProductQuestions((prev) => {
      const updated = prev.map((q) => {
        if (q.id !== questionId) return q;
        const newAns = {
          id: `ans-${Date.now()}`,
          answeredBy: currentUser.name,
          isSeller: activeRole === 'seller',
          isVerifiedBuyer: true,
          answer: answer.trim(),
          date: 'Just now',
          helpfulVotes: 1,
        };
        return { ...q, answers: [...q.answers, newAns] };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('success', 'Answer Submitted!', 'Thank you for helping fellow shoppers.');
  };

  const voteHelpfulAnswer = (questionId: string, answerId: string) => {
    setProductQuestions((prev) => {
      const updated = prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: q.answers.map((a) => (a.id === answerId ? { ...a, helpfulVotes: a.helpfulVotes + 1 } : a)),
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('info', 'Helpful Vote Recorded', 'Thank you for your feedback.');
  };

  // Subscriptions Handlers
  const addSubscription = (productId: string, frequencyMonths: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const discount = 15;
    const pricePerDelivery = Math.floor(prod.price * (1 - discount / 100));
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + frequencyMonths);

    const newSub: SubscriptionItem = {
      id: `sub-${Date.now()}`,
      productId,
      product: prod,
      frequencyMonths,
      discountPercent: discount,
      pricePerDelivery,
      nextDeliveryDate: nextDate.toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setSubscriptions((prev) => {
      const updated = [newSub, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addToast('success', '🔄 Subscribe & Save Active!', `Subscribed with 15% discount every ${frequencyMonths} month(s).`);
  };

  const cancelSubscription = (subId: string) => {
    setSubscriptions((prev) => {
      const updated = prev.filter((s) => s.id !== subId);
      try {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('info', 'Subscription Cancelled', 'Your auto-delivery subscription was removed.');
  };

  // Free Spins & Lucky Spin Wheel State & Logic
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FREE_SPINS);
      return saved ? Math.max(0, parseInt(saved, 10)) : 5;
    } catch {
      return 5;
    }
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALLET_BALANCE);
      return saved ? Math.max(0, parseInt(saved, 10)) : 50000;
    } catch {
      return 50000;
    }
  });

  const [claimedSpinRewards, setClaimedSpinRewards] = useState<ClaimedSpinReward[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMED_SPIN_REWARDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState<boolean>(false);
  const openSpinWheel = () => setIsSpinWheelOpen(true);
  const closeSpinWheel = () => setIsSpinWheelOpen(false);

  const replenishFreeSpins = (count = 3) => {
    setFreeSpinsLeft((prev) => {
      const updated = prev + count;
      try {
        localStorage.setItem(STORAGE_KEYS.FREE_SPINS, updated.toString());
      } catch {}
      return updated;
    });
    addToast('success', '🎰 Free Spins Reloaded!', `+${count} Free Spins added to your balance! Spin to win real cash, tech products & gourmet food.`);
  };

  const decrementFreeSpins = () => {
    setFreeSpinsLeft((prev) => {
      const updated = Math.max(0, prev - 1);
      try {
        localStorage.setItem(STORAGE_KEYS.FREE_SPINS, updated.toString());
      } catch {}
      return updated;
    });
  };

  const creditWallet = (amount: number, reason?: string) => {
    if (amount <= 0) return;
    setWalletBalance((prev) => {
      const updated = prev + amount;
      try {
        localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, updated.toString());
      } catch {}
      return updated;
    });
    addToast('success', '💰 Wallet Credited!', `₦${amount.toLocaleString()} deposited to your CartNova Wallet. ${reason || ''}`);
  };

  const debitWallet = (amount: number): boolean => {
    if (walletBalance < amount) return false;
    setWalletBalance((prev) => {
      const updated = prev - amount;
      try {
        localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, updated.toString());
      } catch {}
      return updated;
    });
    return true;
  };

  const claimFreePrizeProductToCart = (productInfo: { id: string; title: string; image: string; originalPrice: number; category: string; description: string }) => {
    const prizeProduct: Product = {
      id: `free-spin-win-${productInfo.id}-${Date.now()}`,
      title: `[FREE PRIZE WIN] ${productInfo.title}`,
      slug: `free-spin-${productInfo.id}`,
      description: productInfo.description || 'Exclusive Free Spin Wheel Won Reward with 100% Free Claim & Shipping',
      shortDescription: 'Free Spin Wheel Winner Reward Item',
      price: 0,
      originalPrice: productInfo.originalPrice,
      discountPercentage: 100,
      category: productInfo.category || 'Special Free Gifts',
      brand: 'CartNova Lucky Spin',
      images: [productInfo.image],
      rating: 5.0,
      reviewCount: 780,
      stock: 100,
      sellerId: 'seller-cartnova-rewards',
      sellerName: 'CartNova Free Prize Hub',
      tags: ['free spin reward', 'lucky winner', 'food', 'product', 'prize'],
      specs: { 'Prize Status': '100% Free Prize', 'Dispatch': 'Instant Zero-Cost Priority Shipping' },
      createdAt: new Date().toISOString(),
    };
    addToCart(prizeProduct, 1);
    addToast('success', '🎁 Free Prize Added to Cart!', `${productInfo.title} has been added to your shopping cart for ₦0.00!`);
    setIsCartOpen(true);
  };

  const claimSpinReward = (prize: SpinWheelPrize) => {
    const newReward: ClaimedSpinReward = {
      id: `reward-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      prizeId: prize.id,
      category: prize.category,
      title: prize.label,
      description: prize.discountDescription,
      amount: prize.amount,
      code: prize.code,
      productInfo: prize.productInfo || prize.foodInfo,
      claimedAt: new Date().toISOString(),
      isRedeemed: true,
    };

    setClaimedSpinRewards((prev) => {
      const updated = [newReward, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.CLAIMED_SPIN_REWARDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (prize.category === 'money' && prize.amount) {
      creditWallet(prize.amount, `Won on Free Spin Wheel (${prize.label})!`);
      return { success: true, message: `₦${prize.amount.toLocaleString()} credited directly to your CartNova Wallet!`, addedToWallet: prize.amount };
    }

    if (prize.category === 'product' && prize.productInfo) {
      claimFreePrizeProductToCart(prize.productInfo);
      return { success: true, message: `${prize.productInfo.title} added to your cart for ₦0.00!`, addedToCart: true };
    }

    if (prize.category === 'food' && prize.foodInfo) {
      claimFreePrizeProductToCart(prize.foodInfo);
      return { success: true, message: `${prize.foodInfo.title} added to your cart for ₦0.00!`, addedToCart: true };
    }

    if (prize.category === 'coupon' && prize.code) {
      applyCoupon(prize.code);
      return { success: true, message: `Coupon code ${prize.code} applied to your cart!` };
    }

    return { success: true, message: 'Reward claimed successfully!' };
  };

  // Seasonal Events & Shopping Campaigns Handlers
  const activateSeasonalEventDiscount = (event: SeasonalEvent) => {
    setSelectedSeasonalEvent(event);
    applyCoupon(event.couponCode);
    addToast(
      'success',
      `🎉 20% Discount Activated for ${event.shortName}!`,
      `Coupon ${event.couponCode} applied for 20% OFF across the store. Happy Celebrations!`
    );
  };

  // Category Management Handlers
  const addCategory = (categoryData: Category) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to create categories.');
      return;
    }
    setCategories((prev) => [...prev, categoryData]);
    addToast('success', 'Category Created', `Category "${categoryData.name}" added successfully.`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to edit categories.');
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('success', 'Category Updated', 'Category details saved successfully.');
  };

  const deleteCategory = (id: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to delete categories.');
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('info', 'Category Removed', 'Category was deleted.');
  };

  // Coupon Management Handlers
  const addCoupon = (coupon: Coupon) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to publish coupons.');
      return;
    }
    setCoupons((prev) => [coupon, ...prev]);
    addToast('success', 'Coupon Created', `Promo code "${coupon.code}" is now live.`);
  };

  const toggleCouponStatus = (code: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to toggle coupon status.');
      return;
    }
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: c.isActive === false ? true : false } : c))
    );
    addToast('info', 'Coupon Updated', `Status of promo ${code} updated.`);
  };

  const deleteCoupon = (code: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to delete coupons.');
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    addToast('info', 'Coupon Deleted', `Promo code "${code}" was deleted.`);
  };

  // User Management Handlers
  const toggleUserStatus = (userId: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to suspend or activate users.');
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    addToast('info', 'User Status Updated', 'Account access status has been modified.');
  };

  const addUser = (userData: Partial<UserProfile>) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to onboard users.');
      return;
    }
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New Member',
      email: userData.email || `user${Date.now()}@cartnova.com`,
      role: userData.role || 'customer',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'User')}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      storeName: userData.storeName,
      storeBio: userData.storeBio,
      phone: userData.phone || '+234 800 123 4567',
      isVerifiedSeller: userData.role === 'seller',
      commissionRate: 10,
      ...userData,
    };
    setAllUsers((prev) => [newUser, ...prev]);
    addToast('success', 'User Created', `${newUser.name} registered as ${newUser.role}.`);
  };

  // Review Moderation Handlers
  const deleteReview = (id: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to remove reviews.');
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    addToast('info', 'Review Deleted', 'Review was removed from the store.');
  };

  const toggleReviewApproval = (id: string) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to moderate reviews.');
      return;
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: r.isApproved === false ? true : false } : r))
    );
    addToast('success', 'Review Moderated', 'Review visibility updated.');
  };

  const replyToReviewAsAdmin = (reviewId: string, replyMessage: string, moderatorName = 'CartNova Official Moderator') => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to post official moderator replies.');
      return;
    }
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            sellerReply: {
              message: replyMessage,
              date: new Date().toISOString().split('T')[0],
              sellerName: moderatorName,
            },
          };
        }
        return r;
      })
    );
    addToast('success', 'Moderator Response Posted', 'Official reply posted to the product review.');
  };

  // Seller Management & Storefront Handlers
  const verifySeller = (sellerId: string, isVerified: boolean) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to verify sellers.');
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) => (u.id === sellerId ? { ...u, isVerifiedSeller: isVerified } : u))
    );
    addToast('success', 'Merchant Verified', `Merchant verification status updated.`);
  };

  const updateSellerCommission = (sellerId: string, rate: number) => {
    if (activeRole !== 'admin') {
      addToast('error', 'Access Denied', 'Admin privileges are required to adjust seller commission.');
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) => (u.id === sellerId ? { ...u, commissionRate: rate } : u))
    );
    addToast('success', 'Commission Updated', `Seller take-rate set to ${rate}%.`);
  };

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const viewSellerStore = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setActiveCustomerTab('seller-store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order Tracking Update Handler for Admin / Seller
  const updateOrderTracking = (orderId: string, carrier: string, trackingNumber: string) => {
    if (activeRole !== 'admin' && activeRole !== 'seller') {
      addToast('error', 'Access Denied', 'Admin or Seller privileges are required to update tracking.');
      return;
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedTimeline = [
            ...o.timeline,
            {
              status: 'shipped' as OrderStatus,
              timestamp: new Date().toISOString(),
              title: `Dispatched with ${carrier}`,
              description: `Tracking code: ${trackingNumber}. Live dispatch updates enabled.`,
            },
          ];
          return {
            ...o,
            carrier,
            trackingNumber,
            status: 'shipped' as OrderStatus,
            timeline: updatedTimeline,
          };
        }
        return o;
      })
    );
    addToast('success', 'Tracking Assigned', `Carrier ${carrier} tracking ${trackingNumber} added.`);
  };

  // Referral and Rewards System
  const [referralData, setReferralData] = useState<ReferralStats>(() => {
    try {
      const saved = localStorage.getItem('cartnova_referrals_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      referralCode: 'CARTNOVA-VIP-ALEX99',
      totalInvited: 7,
      successfulPurchases: 5,
      totalEarnedBonus: 25000,
      pendingRewardBonus: 10000,
      tier: 'Gold',
      rewardPoints: 3450,
      dailyStreak: 4,
      lastCheckInDate: null,
    };
  });

  const claimDailyStreakReward = () => {
    const today = new Date().toISOString().split('T')[0];
    if (referralData.lastCheckInDate === today) {
      addToast('info', 'Already Claimed Today', 'Come back tomorrow for your next daily streak bonus!');
      return { points: 0, bonusMessage: 'Already claimed today', newStreak: referralData.dailyStreak };
    }
    const newStreak = (referralData.dailyStreak % 7) + 1;
    const pointsEarned = newStreak * 250;
    if (newStreak === 7) {
      creditWallet(5000, 'Day 7 Jackpot Streak Bonus');
    }
    const updated: ReferralStats = {
      ...referralData,
      dailyStreak: newStreak,
      lastCheckInDate: today,
      rewardPoints: referralData.rewardPoints + pointsEarned,
    };
    setReferralData(updated);
    try {
      localStorage.setItem('cartnova_referrals_v2', JSON.stringify(updated));
    } catch {}
    const bonusMsg =
      newStreak === 7
        ? '🎉 Day 7 Jackpot! +1,750 Pts & ₦5,000 Wallet Cash Deposit!'
        : `+${pointsEarned} Points added for Day ${newStreak} check-in!`;
    addToast('success', 'Daily Streak Claimed!', bonusMsg);
    return { points: pointsEarned, bonusMessage: bonusMsg, newStreak };
  };

  const redeemRewardPoints = (pointsCost: number, rewardType: 'wallet' | 'coupon' | 'shipping') => {
    if (referralData.rewardPoints < pointsCost) {
      addToast('error', 'Insufficient Points', `You need ${pointsCost.toLocaleString()} points for this reward.`);
      return { success: false, message: 'Insufficient points' };
    }
    let successMsg = '';
    if (rewardType === 'wallet') {
      const creditAmt = pointsCost === 1000 ? 5000 : pointsCost === 2000 ? 12000 : 30000;
      creditWallet(creditAmt, 'Points Redemption Reward');
      successMsg = `Redeemed ${pointsCost} pts for ₦${creditAmt.toLocaleString()} wallet funds!`;
    } else if (rewardType === 'coupon') {
      const newCode = `VIP${Math.floor(1000 + Math.random() * 9000)}`;
      addCoupon({
        code: newCode,
        discountPercent: 40,
        description: 'VIP 40% OFF Exclusive Rewards Voucher',
        expiresAt: '2026-12-31',
        isActive: true,
        minOrderAmount: 20000,
      });
      successMsg = `Redeemed voucher code ${newCode} (40% OFF)!`;
    } else {
      setIsNovaPrimeState(true);
      successMsg = `Activated 1-Month Free Express Shipping Pass!`;
    }
    const updated: ReferralStats = {
      ...referralData,
      rewardPoints: referralData.rewardPoints - pointsCost,
    };
    setReferralData(updated);
    try {
      localStorage.setItem('cartnova_referrals_v2', JSON.stringify(updated));
    } catch {}
    addToast('success', 'Reward Claimed!', successMsg);
    return { success: true, message: successMsg };
  };

  const resetStoreData = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setWishlist(['prod-gadg-iphone17promax', 'prod-3']);
    setOrders(INITIAL_ORDERS);
    setReviews(INITIAL_REVIEWS);
    setAllUsers(INITIAL_USERS);
    setIsLoggedIn(true);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveRole('customer');
    setAppliedCoupon(null);
    setFilters(initialFilters);
    setSlashItems(INITIAL_SLASH_ITEMS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setProductQuestions(INITIAL_PRODUCT_QUESTIONS);
    setIsNovaPrimeState(false);
    setFreeSpinsLeft(5);
    setWalletBalance(50000);
    setClaimedSpinRewards([]);
    addToast('info', 'Store Reset', 'Demo data reloaded to factory defaults');
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeRole,
        allUsers,
        switchRole,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authModalRole,
        setAuthModalRole,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfile,
        toggleUserStatus,
        updateUserRole,
        addUser,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFeaturedProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleSelectCartItem,
        selectAllCartItems,
        removeSelectedFromCart,
        moveSelectedToWishlist,
        selectedCartItems,
        selectedCartCount,
        selectedCartSubtotal,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        recentlyViewedIds,
        recentlyViewedProducts,
        addToRecentlyViewed,
        removeFromRecentlyViewed,
        clearRecentlyViewed,
        recommendedProducts,
        getRecommendationsForProduct,
        getFrequentlyBoughtTogether,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderTracking,
        cancelOrder,
        reviews,
        addReview,
        voteHelpfulReview,
        replyToReview,
        addSellerReplyToReview: replyToReview,
        deleteReview,
        toggleReviewApproval,
        replyToReviewAsAdmin,
        verifySeller,
        updateSellerCommission,
        selectedSellerId,
        setSelectedSellerId,
        viewSellerStore,
        filters,
        setFilters,
        resetFilters,
        filteredProducts,
        selectedCategory,
        setSelectedCategory,
        recentSearches,
        popularSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        executeSearch,
        isSearchModalOpen,
        setIsSearchModalOpen,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        referralData,
        claimDailyStreakReward,
        redeemRewardPoints,
        quickViewProduct,
        setQuickViewProduct,
        selectedProductId,
        setSelectedProductId,
        viewProductDetail,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        activeCustomerTab,
        setActiveCustomerTab,
        // Slash It to ₦0
        slashItems,
        activeSlashItem,
        setActiveSlashItem,
        slashPrice,
        simulateFriendSlash,
        claimSlashedItem,
        isSlashModalOpen,
        setIsSlashModalOpen,
        // Seasonal Events & Campaigns (20% OFF)
        seasonalEvents,
        selectedSeasonalEvent,
        setSelectedSeasonalEvent,
        isSeasonalEventModalOpen,
        setIsSeasonalEventModalOpen,
        activateSeasonalEventDiscount,
        // Mystery Box
        mysteryBoxes,
        isMysteryBoxOpen,
        setIsMysteryBoxOpen,
        openMysteryBox,
        unboxedPrizes,
        claimMysteryPrize,
        // Nova Prime
        isNovaPrime,
        setIsNovaPrime,
        toggleNovaPrime,
        isNovaPrimeModalOpen,
        setIsNovaPrimeModalOpen,
        // 1-Click Buy
        oneClickBuy,
        openOneClickBuyModal: oneClickBuy,
        oneClickBuySuccessOrder,
        setOneClickBuySuccessOrder,
        // Tracking
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        trackingOrder,
        setTrackingOrder,
        // Q&A
        productQuestions,
        askProductQuestion,
        answerProductQuestion,
        voteHelpfulAnswer,
        // Subscriptions
        subscriptions,
        addSubscription,
        cancelSubscription,
        // Free Spins & Lucky Spin Wheel Rewards
        freeSpinsLeft,
        setFreeSpinsLeft,
        replenishFreeSpins,
        decrementFreeSpins,
        walletBalance,
        setWalletBalance,
        creditWallet,
        debitWallet,
        claimedSpinRewards,
        setClaimedSpinRewards,
        spinWheelPrizes: INITIAL_SPIN_PRIZES,
        claimSpinReward,
        claimFreePrizeProductToCart,
        isSpinWheelOpen,
        setIsSpinWheelOpen,
        openSpinWheel,
        closeSpinWheel,
        // Notifications
        notifications,
        userNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        broadcastNotification,
        isNotificationPopoverOpen,
        setIsNotificationPopoverOpen,
        handleNotificationAction,
        supportTickets,
        activeTicketId,
        setActiveTicketId,
        activeTicket,
        faqs,
        isLiveSupportOpen,
        setIsLiveSupportOpen,
        supportChatMessages,
        openSupportTicket,
        createSupportTicket,
        addMessageToSupportTicket,
        updateTicketStatus,
        sendLiveSupportChatMessage,
        prefillSupportForOrder,
        voteFaq,
        submitOrderDisputeOrRefund,
        approveRefundDispute,
        rejectRefundDispute,
        currentCurrency,
        setCurrency,
        formatPrice,
        themeMode,
        setThemeMode,
        themeOptions: THEME_OPTIONS,
        toasts,
        addToast,
        removeToast,
        // Simulated Payment Alert & Sandbox Ledger (DEMO MODE)
        simulatedTransactions,
        simulatedPaymentConfig,
        selectedSimulatedTxn,
        setSelectedSimulatedTxn,
        isSimulatedAlertModalOpen,
        setIsSimulatedAlertModalOpen,
        recordSimulatedPayment,
        updateSimulatedTxnStatus,
        resendSimulatedTxnAlert,
        updateSimulatedConfig,
        triggerManualTestEmailAlert,
        fetchSimulatedTransactions,
        resetStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
