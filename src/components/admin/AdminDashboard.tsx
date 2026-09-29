import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Product, Coupon, Category, OrderStatus } from '../../types';
import { AdminProductModal } from './AdminProductModal';
import { AdminBulkPriceModal } from './AdminBulkPriceModal';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingBag,
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Tag,
  Store,
  Eye,
  Star,
  Check,
  Search,
  Edit2,
  Filter,
  Flame,
  Layers,
  ArrowUpRight,
  Truck,
  MessageSquare,
  BarChart3,
  Grid,
  Clock,
  Send,
  AlertCircle,
  ChevronRight,
  CreditCard,
  LifeBuoy,
  Megaphone,
  Image as ImageIcon,
  Lock,
  Mail,
  RotateCcw,
  Sliders,
  CheckSquare,
} from 'lucide-react';
import { AdminGuard } from './AdminGuard';
import { AdminPaymentsRefundsTab } from './AdminPaymentsRefundsTab';
import { AdminSupportDeskTab } from './AdminSupportDeskTab';
import { AdminNotificationsTab } from './AdminNotificationsTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminPermissionsTab } from './AdminPermissionsTab';
import { AdminSimulatedPaymentsTab } from './AdminSimulatedPaymentsTab';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    activeRole,
    allUsers,
    products,
    orders,
    coupons,
    categories,
    seasonalEvents,
    simulatedTransactions,
    toggleUserStatus,
    addUser,
    updateProduct,
    deleteProduct,
    addCoupon,
    toggleCouponStatus,
    deleteCoupon,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    updateOrderTracking,
    reviews,
    deleteReview,
    toggleReviewApproval,
    replyToReviewAsAdmin,
    verifySeller,
    updateSellerCommission,
    bulkUpdateProductPrices,
    undoLastPriceAdjustment,
    canUndoPriceAdjustment,
    priceAdjustmentHistory,
    formatPrice,
    addToast,
  } = useStore();

  const [adminTab, setAdminTab] = useState<
    | 'overview'
    | 'catalog'
    | 'categories'
    | 'orders'
    | 'payments'
    | 'test-payments'
    | 'users'
    | 'coupons'
    | 'banners'
    | 'reviews'
    | 'support'
    | 'notifications'
    | 'permissions'
    | 'analytics'
  >('overview');

  // Bulk Price Modal & Table Multi-select State
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [selectedCatalogProductIds, setSelectedCatalogProductIds] = useState<string[]>([]);
  const [bulkInitialCategory, setBulkInitialCategory] = useState<string>('ALL');
  const [bulkInitialSeller, setBulkInitialSeller] = useState<string>('ALL');

  // Category State
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    slug: '',
    iconName: 'Package',
    description: '',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    accentColor: '#F59E0B',
  });

  // Order Tracking modal state
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);
  const [carrierInput, setCarrierInput] = useState('DHL Express Nigeria');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Product Modal State for Admins
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Merchant State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'seller' as 'customer' | 'seller' | 'admin',
    storeName: '',
    storeBio: '',
  });

  // New Coupon State
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: 'SUMMER30',
    description: '30% off summer special',
    discountPercent: 30,
    minOrderAmount: 75000,
    expiresAt: '2026-12-31',
  });

  // Catalog filters & search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('ALL');
  const [catalogSellerFilter, setCatalogSellerFilter] = useState('ALL');
  const [catalogBadgeFilter, setCatalogBadgeFilter] = useState<'ALL' | 'featured' | 'flash' | 'low-stock'>('ALL');

  // Quick Inline Price Editing State
  const [inlineEditingProductId, setInlineEditingProductId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<string>('');
  const [inlineOriginalPriceValue, setInlineOriginalPriceValue] = useState<string>('');

  const handleStartInlinePriceEdit = (prod: Product) => {
    setInlineEditingProductId(prod.id);
    setInlinePriceValue(prod.price.toString());
    setInlineOriginalPriceValue((prod.originalPrice || prod.price).toString());
  };

  const handleSaveInlinePrice = (prodId: string) => {
    const newPrice = Number(inlinePriceValue);
    const newOrigPrice = Number(inlineOriginalPriceValue);
    if (!isNaN(newPrice) && newPrice > 0) {
      const discount =
        newOrigPrice > newPrice ? Math.round(((newOrigPrice - newPrice) / newOrigPrice) * 100) : undefined;
      updateProduct(prodId, {
        price: newPrice,
        originalPrice: newOrigPrice >= newPrice ? newOrigPrice : newPrice,
        discountPercentage: discount,
      });
    }
    setInlineEditingProductId(null);
  };

  const handleCancelInlinePriceEdit = () => {
    setInlineEditingProductId(null);
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedCatalogProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (selectAll: boolean) => {
    if (selectAll) {
      const ids = filteredCatalog.map((p) => p.id);
      setSelectedCatalogProductIds(ids);
    } else {
      setSelectedCatalogProductIds([]);
    }
  };

  const handleQuickAdjustSelected = (mode: 'percentage_increase' | 'percentage_decrease', val: number) => {
    if (selectedCatalogProductIds.length === 0) return;
    bulkUpdateProductPrices({
      productIds: selectedCatalogProductIds,
      mode,
      value: val,
      roundingRule: 'nearest_100',
      updateOriginalPrice: mode === 'percentage_decrease' ? 'set_to_old_price' : 'scale_proportionally',
    });
  };

  // Platform Metrics
  const gmv = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const platformRevenue = gmv * 0.1; // 10% platform take rate
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? gmv / totalOrders : 0;

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      addToast('error', 'Invalid Input', 'Please provide a valid user name and email address.');
      return;
    }
    if (!newUserForm.email.includes('@')) {
      addToast('error', 'Invalid Email', 'Please enter a properly formatted email address.');
      return;
    }
    if (newUserForm.role === 'seller' && !newUserForm.storeName?.trim()) {
      addToast('error', 'Missing Store Name', 'Marketplace merchants require a designated Store / Brand Name.');
      return;
    }

    addUser({
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim().toLowerCase(),
      role: newUserForm.role,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + allUsers.length}?w=400&auto=format&fit=crop&q=80`,
      storeName: newUserForm.role === 'seller' ? newUserForm.storeName.trim() : undefined,
      storeBio: newUserForm.role === 'seller' ? newUserForm.storeBio?.trim() : undefined,
      phone: '+234 801 234 5678',
      address: {
        street: '100 Commercial Avenue',
        city: 'Lagos',
        state: 'Lagos',
        zip: '100001',
        country: 'Nigeria',
      },
    });
    setNewUserForm({ name: '', email: '', role: 'seller', storeName: '', storeBio: '' });
    setIsAddUserOpen(false);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCouponForm.code.trim().toUpperCase();
    if (!cleanCode) {
      addToast('error', 'Invalid Coupon', 'Coupon promo code cannot be empty.');
      return;
    }
    if (newCouponForm.discountPercent <= 0 || newCouponForm.discountPercent > 100) {
      addToast('error', 'Invalid Discount', 'Discount percent must be between 1% and 100%.');
      return;
    }

    addCoupon({
      code: cleanCode,
      description: newCouponForm.description.trim() || `${newCouponForm.discountPercent}% Promo Discount`,
      discountPercent: Number(newCouponForm.discountPercent),
      minOrderAmount: Number(newCouponForm.minOrderAmount) || 0,
      isActive: true,
      expiresAt: newCouponForm.expiresAt || '2026-12-31',
    });
    setNewCouponForm({ code: '', description: '', discountPercent: 15, minOrderAmount: 25000, expiresAt: '2026-12-31' });
    setIsAddCouponOpen(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) {
      addToast('error', 'Category Name Required', 'Please enter a name for the new category.');
      return;
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryForm.name.trim(),
      slug: newCategoryForm.slug.trim() || newCategoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      iconName: newCategoryForm.iconName || 'Package',
      description: newCategoryForm.description.trim() || `${newCategoryForm.name} curated collection and deals`,
      bannerImage: newCategoryForm.bannerImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      itemCount: 0,
      accentColor: newCategoryForm.accentColor || '#F59E0B',
    };
    addCategory(newCat);
    setIsAddCategoryOpen(false);
    setNewCategoryForm({
      name: '',
      slug: '',
      iconName: 'Package',
      description: '',
      bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      accentColor: '#F59E0B',
    });
  };

  const handleAssignTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking || !trackingNumberInput.trim()) return;
    updateOrderTracking(selectedOrderForTracking, carrierInput, trackingNumberInput.trim());
    setSelectedOrderForTracking(null);
    setTrackingNumberInput('');
  };

  const handleSendModeratorReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReviewId || !replyText.trim()) return;
    replyToReviewAsAdmin(replyingReviewId, replyText.trim(), 'CartNova Official Moderator');
    setReplyingReviewId(null);
    setReplyText('');
  };

  const filteredCatalog = products.filter((p) => {
    const matchesSearch =
      !catalogSearch ||
      p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(catalogSearch.toLowerCase());

    const matchesCategory = catalogCategoryFilter === 'ALL' || p.category === catalogCategoryFilter;
    const matchesSeller = catalogSellerFilter === 'ALL' || p.sellerId === catalogSellerFilter;

    let matchesBadge = true;
    if (catalogBadgeFilter === 'featured') matchesBadge = !!p.isFeatured;
    else if (catalogBadgeFilter === 'flash') matchesBadge = !!p.isFlashDeal;
    else if (catalogBadgeFilter === 'low-stock') matchesBadge = p.stock <= 10;

    return matchesSearch && matchesCategory && matchesSeller && matchesBadge;
  });

  if (currentUser.role !== 'admin' && activeRole !== 'admin') {
    return <AdminGuard />;
  }

  return (
    <div className="py-6 max-w-7xl mx-auto space-y-8">
      {/* Admin Super Header */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-400 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md border border-purple-400/30">
                PLATFORM SUPERVISOR
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">CartNova Master Command Center</h1>
            <p className="text-xs text-slate-300">
              Govern marketplace sellers, add & moderate catalog products, monitor GMV & take rates, and deploy promo vouchers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="admin-add-product-header-btn"
            onClick={handleOpenAddProduct}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            id="admin-add-merchant-btn"
            onClick={() => {
              setAdminTab('users');
              setIsAddUserOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Onboard Merchant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Gross Volume (GMV)</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(gmv)}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% processed successfully</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Platform Take (10%)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(platformRevenue)}</p>
          <span className="text-[11px] text-indigo-600 font-bold">Net marketplace revenue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Marketplace Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{allUsers.length}</p>
          <span className="text-[11px] text-slate-500">
            {allUsers.filter((u) => u.role === 'seller').length} Active Stores
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Catalog Items</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{products.length}</p>
          <span className="text-[11px] text-purple-600 font-bold">
            {products.filter((p) => p.isFeatured).length} Featured Products
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          id="admin-tab-overview"
          onClick={() => setAdminTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          id="admin-tab-catalog"
          onClick={() => setAdminTab('catalog')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalog ({products.length})</span>
        </button>

        <button
          id="admin-tab-categories"
          onClick={() => setAdminTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          id="admin-tab-orders"
          onClick={() => setAdminTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          id="admin-tab-payments"
          onClick={() => setAdminTab('payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'payments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments & Returns</span>
        </button>

        <button
          id="admin-tab-test-payments"
          onClick={() => setAdminTab('test-payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            adminTab === 'test-payments'
              ? 'bg-purple-900 text-purple-100 border-purple-700 shadow-xs'
              : 'bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100'
          }`}
        >
          <Mail className="w-4 h-4 text-purple-600" />
          <span className="font-extrabold">Test Payments & Alerts ({simulatedTransactions.length})</span>
          <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full uppercase">
            DEMO
          </span>
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Sellers ({allUsers.length})</span>
        </button>

        <button
          id="admin-tab-coupons"
          onClick={() => setAdminTab('coupons')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'coupons'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions ({coupons.length})</span>
        </button>

        <button
          id="admin-tab-banners"
          onClick={() => setAdminTab('banners')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'banners'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banners & 20% Off</span>
        </button>

        <button
          id="admin-tab-reviews"
          onClick={() => setAdminTab('reviews')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reviews ({reviews.length})</span>
        </button>

        <button
          id="admin-tab-support"
          onClick={() => setAdminTab('support')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'support'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Support Desk</span>
        </button>

        <button
          id="admin-tab-notifications"
          onClick={() => setAdminTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcasts</span>
        </button>

        <button
          id="admin-tab-permissions"
          onClick={() => setAdminTab('permissions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'permissions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Permissions & RBAC</span>
        </button>

        <button
          id="admin-tab-analytics"
          onClick={() => setAdminTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </div>

      {/* TAB 1: Platform Overview */}
      {adminTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Orders Overview */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Marketplace Transactions</h3>
              <span className="text-xs text-slate-400">Live order feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">#{o.orderNumber}</td>
                      <td className="p-3 font-medium text-slate-800">{o.customerName}</td>
                      <td className="p-3 font-bold text-indigo-600">{formatPrice(o.totalAmount)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Platform Actions */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4" /> Marketplace Health
              </div>
              <h4 className="text-lg font-black">All Systems Operational</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                CartNova backend, shopping assistants, payment gateways, and inventory trackers are performing at 99.98% uptime.
              </p>
              <div className="p-3 rounded-2xl bg-white/10 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Average Order Value</span>
                  <span className="font-mono font-bold">{formatPrice(aov)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Merchants</span>
                  <span className="font-mono font-bold">{allUsers.filter((u) => u.role === 'seller').length}</span>
                </div>
              </div>
            </div>

            {/* Quick Admin Action Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                <span>Quick Administration</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="admin-quick-add-product"
                  onClick={handleOpenAddProduct}
                  className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>Add New Marketplace Product</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                </button>

                <button
                  id="admin-overview-bulk-price-btn"
                  onClick={() => {
                    setBulkInitialCategory('ALL');
                    setBulkInitialSeller('ALL');
                    setIsBulkPriceModalOpen(true);
                  }}
                  className="w-full p-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 hover:from-purple-100 hover:to-indigo-100 text-purple-950 border border-purple-200/80 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <div className="text-left">
                      <span>Bulk Price Adjuster</span>
                      <p className="text-[10px] text-purple-600 font-normal">Change prices across all {products.length} products</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                </button>

                <button
                  onClick={() => {
                    setAdminTab('users');
                    setIsAddUserOpen(true);
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span>Onboard New Merchant / User</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setAdminTab('coupons');
                    setIsAddCouponOpen(true);
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    <span>Create Promo Coupon</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User & Merchant Governance */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Platform Users & Merchants</h2>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create User / Merchant</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Store / Info</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-slate-400 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'seller'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {u.storeName ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{u.storeName}</span>
                              {u.isVerifiedSeller && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>Fee: {u.commissionRate || 10}%</span>
                              <span>•</span>
                              <span>Followers: {u.followerCount || 1200}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard Customer</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.status !== 'suspended'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {u.status !== 'suspended' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {u.role === 'seller' && (
                          <button
                            onClick={() => verifySeller(u.id, !u.isVerifiedSeller)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              u.isVerifiedSeller
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isVerifiedSeller ? 'Revoke Badge' : 'Verify Seller'}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              u.status !== 'suspended'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status !== 'suspended' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Catalog Moderation & Management */}
      {adminTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span>Marketplace Catalog Management</span>
                <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">
                  {filteredCatalog.length} / {products.length} items
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add official products, edit listings, configure flash deals & manage prices across all sellers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canUndoPriceAdjustment && (
                <button
                  onClick={undoLastPriceAdjustment}
                  title="Revert last price changes"
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo Last Price Change</span>
                </button>
              )}

              <button
                id="admin-bulk-change-price-btn"
                onClick={() => {
                  setBulkInitialCategory(catalogCategoryFilter);
                  setBulkInitialSeller(catalogSellerFilter);
                  setIsBulkPriceModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer shrink-0"
              >
                <DollarSign className="w-4 h-4 text-amber-300" />
                <span>Bulk Adjust Prices</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-purple-950 text-[9px] font-black rounded-md ml-0.5">
                  ALL ({products.length})
                </span>
              </button>

              <button
                id="admin-add-product-catalog-btn"
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {/* Catalog Filter Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-catalog-search-input"
                  type="text"
                  placeholder="Search title, brand, seller..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-purple-600"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-purple-600"
                >
                  <option value="ALL">All Categories ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seller Filter */}
              <div>
                <select
                  value={catalogSellerFilter}
                  onChange={(e) => setCatalogSellerFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-purple-600"
                >
                  <option value="ALL">All Sellers / Sources</option>
                  <option value="admin-official">👑 CartNova Official Store</option>
                  {allUsers
                    .filter((u) => u.role === 'seller')
                    .map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        🏪 {seller.storeName || seller.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Horizontally Scrollable Categories Bar */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  <span>Scroll & Filter by Category:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {filteredCatalog.length} products matching
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300">
                <button
                  onClick={() => setCatalogCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    catalogCategoryFilter === 'ALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Categories ({products.length})
                </button>

                {categories.map((c) => {
                  const isSelected = catalogCategoryFilter.toLowerCase() === c.name.toLowerCase();
                  const count = products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCatalogCategoryFilter(c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span
                        className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Seasonal Events Tag Bar for Admin Audits */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Seasonal Campaigns (14 Active):</span>
                </div>
                {seasonalEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setAdminTab('banners');
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>{evt.name}</span>
                    <span className="font-mono text-[10px] text-amber-600 font-bold">20% OFF</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Badge Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold text-[11px] mr-1">Filter Badges:</span>
              <button
                onClick={() => setCatalogBadgeFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  catalogBadgeFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Listings ({products.length})
              </button>
              <button
                onClick={() => setCatalogBadgeFilter('featured')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  catalogBadgeFilter === 'featured'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Star className="w-3 h-3" />
                <span>Featured ({products.filter((p) => p.isFeatured).length})</span>
              </button>
              <button
                onClick={() => setCatalogBadgeFilter('flash')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  catalogBadgeFilter === 'flash'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Flash Deals ({products.filter((p) => p.isFlashDeal).length})</span>
              </button>
              <button
                onClick={() => setCatalogBadgeFilter('low-stock')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  catalogBadgeFilter === 'low-stock'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span>⚠️ Low Stock (&le;10) ({products.filter((p) => p.stock <= 10).length})</span>
              </button>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredCatalog.length > 0 &&
                          filteredCatalog.every((p) => selectedCatalogProductIds.includes(p.id))
                        }
                        onChange={(e) => handleSelectAllFiltered(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        title="Select all filtered items"
                      />
                    </th>
                    <th className="p-4">Product Item</th>
                    <th className="p-4">Brand / Category</th>
                    <th className="p-4">Seller Source</th>
                    <th className="p-4">Price / MSRP</th>
                    <th className="p-4">Inventory</th>
                    <th className="p-4 text-center">Featured</th>
                    <th className="p-4 text-center">Flash Deal</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No products found matching filters</p>
                        <button
                          onClick={handleOpenAddProduct}
                          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Product</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map((prod) => {
                      const isSelected = selectedCatalogProductIds.includes(prod.id);
                      return (
                        <tr
                          key={prod.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-purple-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectProduct(prod.id)}
                              className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images[0]}
                                alt={prod.title}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 line-clamp-1 hover:text-purple-600 transition-colors">
                                  {prod.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</span>
                                  {prod.rating && (
                                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                                      ★ {prod.rating}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{prod.brand}</p>
                            <span className="text-slate-400 text-[10px]">{prod.category}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              {prod.sellerId === 'admin-official' ? (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-md">
                                  👑 CartNova HQ
                                </span>
                              ) : (
                                <span className="text-slate-700 font-medium truncate max-w-[120px]">
                                  {prod.sellerName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {inlineEditingProductId === prod.id ? (
                              <div className="space-y-1.5 min-w-[150px] p-2 bg-purple-50 rounded-xl border border-purple-200">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 block">Price (₦)</label>
                                  <input
                                    id={`admin-inline-price-input-${prod.id}`}
                                    type="number"
                                    min={100}
                                    value={inlinePriceValue}
                                    onChange={(e) => setInlinePriceValue(e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-purple-600"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlinePrice(prod.id);
                                      if (e.key === 'Escape') handleCancelInlinePriceEdit();
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 block">MSRP / Original (₦)</label>
                                  <input
                                    type="number"
                                    min={100}
                                    value={inlineOriginalPriceValue}
                                    onChange={(e) => setInlineOriginalPriceValue(e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-purple-600"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlinePrice(prod.id);
                                      if (e.key === 'Escape') handleCancelInlinePriceEdit();
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-1 pt-1">
                                  <button
                                    id={`admin-save-price-${prod.id}`}
                                    onClick={() => handleSaveInlinePrice(prod.id)}
                                    className="flex-1 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelInlinePriceEdit}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="group/price flex items-start gap-1.5">
                                <div>
                                  <p className="font-bold text-slate-900">{formatPrice(prod.price)}</p>
                                  {prod.originalPrice && prod.originalPrice > prod.price && (
                                    <p className="text-[10px] text-slate-400 line-through">
                                      {formatPrice(prod.originalPrice)}
                                    </p>
                                  )}
                                </div>
                                <button
                                  id={`admin-quick-price-btn-${prod.id}`}
                                  onClick={() => handleStartInlinePriceEdit(prod)}
                                  title="Change Price"
                                  className="opacity-0 group-hover/price:opacity-100 p-1 text-purple-600 hover:bg-purple-50 rounded-md transition-opacity cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.stock <= 5
                                  ? 'bg-rose-100 text-rose-700 font-black'
                                  : prod.stock <= 15
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => updateProduct(prod.id, { isFeatured: !prod.isFeatured })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                prod.isFeatured
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {prod.isFeatured ? '★ Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                updateProduct(prod.id, {
                                 isFlashDeal: !prod.isFlashDeal,
                                 discountPercentage: prod.isFlashDeal ? undefined : 20,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                prod.isFlashDeal
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {prod.isFlashDeal ? '⚡ Flash' : 'Off'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                id={`admin-edit-product-${prod.id}`}
                                onClick={() => handleOpenEditProduct(prod)}
                                title="Edit product details & pricing"
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                id={`admin-delete-product-${prod.id}`}
                                onClick={() => {
                                  if (confirm(`Remove listing "${prod.title}" from platform?`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                title="Delete product"
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating Batch Actions Bar (when rows are selected) */}
          {selectedCatalogProductIds.length > 0 && (
            <div className="sticky bottom-4 z-30 bg-slate-900 text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  {selectedCatalogProductIds.length}
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {selectedCatalogProductIds.length} Products Selected
                  </p>
                  <button
                    onClick={() => handleSelectAllFiltered(true)}
                    className="text-[10px] text-purple-300 hover:text-purple-200 underline cursor-pointer"
                  >
                    Select all {filteredCatalog.length} filtered products
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleQuickAdjustSelected('percentage_increase', 10)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  title="Quick +10% price increase"
                >
                  +10% Increase
                </button>

                <button
                  onClick={() => handleQuickAdjustSelected('percentage_decrease', 20)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  title="Quick -20% sale discount"
                >
                  -20% Sale Markdown
                </button>

                <button
                  id="admin-batch-price-adjust-btn"
                  onClick={() => setIsBulkPriceModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bulk Price Adjuster</span>
                </button>

                <button
                  onClick={() => setSelectedCatalogProductIds([])}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Coupons Manager */}
      {adminTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Promotional Vouchers & Coupons</h2>
            <button
              onClick={() => setIsAddCouponOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-mono font-black text-sm">
                      {c.code}
                    </span>
                    <button
                      onClick={() => toggleCouponStatus(c.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.isActive ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mt-2">{c.description}</p>
                  <p className="text-[11px] text-slate-500">
                    Min spend: <strong>{formatPrice(c.minOrderAmount)}</strong> • Discount:{' '}
                    <strong className="text-emerald-600">
                      {c.discountPercent ? `${c.discountPercent}% OFF` : formatPrice(c.discountAmount || 0)}
                    </strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Expires: {c.expiresAt}</span>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Categories Manager */}
      {adminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Marketplace Product Categories</h2>
              <p className="text-xs text-slate-500">Organize product navigation taxonomy, banners, and icons.</p>
            </div>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const matchingProds = products.filter(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase() === cat.slug.toLowerCase()
              );
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                      <img src={cat.bannerImage} alt={cat.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-white font-black text-sm drop-shadow">
                        {cat.name}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
                        {matchingProds.length} Products
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                          /{cat.slug}
                        </span>
                        <span className="text-[11px]">Icon: {cat.iconName}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400 font-medium">ID: {cat.id}</span>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Orders Governance */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Orders & Dispatch Control</h2>
              <p className="text-xs text-slate-500">
                Manage logistics fulfillment, status transitions, and courier tracking details.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-slate-100 font-bold rounded-lg text-slate-700">
                Total Orders: {orders.length}
              </span>
              <span className="px-3 py-1 bg-emerald-100 font-bold rounded-lg text-emerald-800">
                GMV: {formatPrice(gmv)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items & Summary</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4 text-right">Actions & Courier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No orders recorded yet in system.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 align-top">
                          <span className="font-mono font-bold text-slate-900 block">{ord.id}</span>
                          <span className="text-[11px] text-slate-400">{ord.createdAt}</span>
                          {ord.trackingNumber && (
                            <span className="inline-block mt-1 text-[10px] font-mono bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200">
                              {ord.carrier}: {ord.trackingNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          <span className="font-semibold text-slate-900 block">{ord.shippingAddress?.fullName || 'Registered User'}</span>
                          <span className="text-[11px] text-slate-500">{ord.shippingAddress?.city || 'Lagos'}, {ord.shippingAddress?.state || 'Nigeria'}</span>
                          <span className="text-[10px] text-slate-400 block">{ord.shippingAddress?.phone}</span>
                        </td>
                        <td className="p-4 align-top">
                          <div className="space-y-1">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="text-[11px] text-slate-700 line-clamp-1">
                                {it.quantity}x {it.product.title}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 align-top font-bold text-slate-900">
                          {formatPrice(ord.totalAmount)}
                        </td>
                        <td className="p-4 align-top">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold uppercase">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4 align-top">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ord.status === 'shipped'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : ord.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 align-top text-right space-y-1">
                          <button
                            onClick={() => {
                              setSelectedOrderForTracking(ord.id);
                              setTrackingNumberInput(ord.trackingNumber || `CN-${Math.floor(100000 + Math.random() * 900000)}`);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-xs"
                          >
                            <Truck className="w-3 h-3" />
                            {ord.trackingNumber ? 'Edit Courier' : 'Assign Tracking'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Reviews & Content Moderation */}
      {adminTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ratings & Review Moderation</h2>
              <p className="text-xs text-slate-500">
                Audit customer product feedback, approve/hide reviews, and publish official moderator responses.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-lg">
              {reviews.length} Total Platform Reviews
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No reviews to moderate at this time.</div>
            ) : (
              reviews.map((rev) => {
                const prod = products.find((p) => p.id === rev.productId);
                return (
                  <div key={rev.id} className="p-5 space-y-3 hover:bg-slate-50/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                          {rev.userName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            On product: <strong className="text-slate-700">{prod?.title || rev.productId}</strong> • {rev.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReviewApproval(rev.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            rev.isApproved !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {rev.isApproved !== false ? 'Approved & Visible' : 'Hidden from Store'}
                        </button>
                        <button
                          onClick={() => setReplyingReviewId(rev.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Reply
                        </button>
                        <button
                          onClick={() => deleteReview(rev.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5">{rev.rating}.0 / 5.0</span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{rev.comment}</p>

                    {rev.sellerReply && (
                      <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-amber-900 block">{rev.sellerReply.sellerName}:</span>
                        <p className="text-amber-800">{rev.sellerReply.message}</p>
                        <span className="text-[10px] text-amber-600 block">{rev.sellerReply.date}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: Analytics & Executive Metrics */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">CartNova Marketplace Analytics</h2>
              <p className="text-xs text-slate-500">High-level financial performance, sales volume, and conversions.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Live Real-Time Data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Total GMV (Gross Merchandise)</span>
              <p className="text-2xl font-black text-slate-900">{formatPrice(gmv)}</p>
              <span className="text-[11px] text-emerald-600 font-bold">↑ 24.8% vs last month</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Platform Take Rate (10%)</span>
              <p className="text-2xl font-black text-indigo-600">{formatPrice(platformRevenue)}</p>
              <span className="text-[11px] text-indigo-500 font-bold">Net Platform Revenue</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Average Order Value (AOV)</span>
              <p className="text-2xl font-black text-slate-900">{formatPrice(aov)}</p>
              <span className="text-[11px] text-slate-500 font-medium">Across {totalOrders} total checkouts</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Customer Return Rate</span>
              <p className="text-2xl font-black text-emerald-600">0.8%</p>
              <span className="text-[11px] text-slate-500">Well below 3.0% benchmark</span>
            </div>
          </div>

          {/* Category Distribution & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Product Inventory Distribution by Category</h3>
              <div className="space-y-3">
                {categories.map((c) => {
                  const count = products.filter(
                    (p) => p.category.toLowerCase() === c.name.toLowerCase() || p.category.toLowerCase() === c.slug.toLowerCase()
                  ).length;
                  const percent = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{c.name}</span>
                        <span className="text-slate-500">{count} items ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: c.accentColor || '#F59E0B' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Top Rated High-Demand Products</h3>
              <div className="divide-y divide-slate-100">
                {products
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 5)
                  .map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{p.title}</h4>
                          <span className="text-[11px] text-slate-500">{p.brand} • {p.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-xs block">{formatPrice(p.price)}</span>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 justify-end">
                          <Star className="w-3 h-3 fill-amber-500" /> {p.rating} ({p.reviewCount})
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payments & Refund Disputes */}
      {adminTab === 'payments' && <AdminPaymentsRefundsTab />}

      {/* Tab: Simulated Test Payments & Gmail Alert Sandbox */}
      {adminTab === 'test-payments' && <AdminSimulatedPaymentsTab />}

      {/* Tab: Promotional Banners & Seasonal Campaigns */}
      {adminTab === 'banners' && <AdminBannersTab />}

      {/* Tab: Customer Support Helpdesk */}
      {adminTab === 'support' && <AdminSupportDeskTab />}

      {/* Tab: Broadcast Push Notifications */}
      {adminTab === 'notifications' && <AdminNotificationsTab />}

      {/* Tab: Permissions Matrix & Audit Logs */}
      {adminTab === 'permissions' && <AdminPermissionsTab />}

      {/* Modal: Admin Add Category */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddCategoryOpen(false)} className="fixed inset-0 bg-slate-950/70" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Marketplace Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategoryForm.name}
                  onChange={(e) =>
                    setNewCategoryForm({
                      ...newCategoryForm,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  required
                  placeholder="e.g. Sports & Fitness"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newCategoryForm.slug}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, slug: e.target.value })}
                  required
                  placeholder="sports-fitness"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={newCategoryForm.description}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                  placeholder="Summary of products in this category"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={newCategoryForm.bannerImage}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, bannerImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-3 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Courier Tracking Assignment */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrderForTracking(null)} className="fixed inset-0 bg-slate-950/70" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" /> Assign Courier & Tracking
            </h3>
            <p className="text-xs text-slate-500">Order: #{selectedOrderForTracking}</p>
            <form onSubmit={handleAssignTracking} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Logistics Carrier</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="DHL Express Nigeria">DHL Express Nigeria</option>
                  <option value="GIG Logistics (GIGL)">GIG Logistics (GIGL)</option>
                  <option value="CartNova Prime Express">CartNova Prime Express</option>
                  <option value="FedEx Nigeria">FedEx Nigeria</option>
                  <option value="Kwik Delivery">Kwik Delivery</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Waybill / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  required
                  placeholder="e.g. DHL-984838290"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForTracking(null)}
                  className="px-3 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save & Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review Moderator Reply */}
      {replyingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReplyingReviewId(null)} className="fixed inset-0 bg-slate-950/70" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" /> Post Official Response
            </h3>
            <form onSubmit={handleSendModeratorReply} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Response Message</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  placeholder="Thank you for your feedback! Our quality team has verified..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 resize-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReviewId(null)}
                  className="px-3 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Post Official Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={editingProduct}
      />

      <AdminBulkPriceModal
        isOpen={isBulkPriceModalOpen}
        onClose={() => setIsBulkPriceModalOpen(false)}
        selectedProductIds={selectedCatalogProductIds}
        initialCategory={bulkInitialCategory}
        initialSeller={bulkInitialSeller}
      />

      {/* Modal: Add User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddUserOpen(false)} className="fixed inset-0 bg-slate-950/70" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Onboard New User or Merchant</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="seller">Marketplace Seller</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Platform Admin</option>
                </select>
              </div>

              {newUserForm.role === 'seller' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Store / Brand Name</label>
                    <input
                      type="text"
                      value={newUserForm.storeName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, storeName: e.target.value })}
                      required
                      placeholder="e.g. Apex Precision Audio"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Store Bio</label>
                    <input
                      type="text"
                      value={newUserForm.storeBio}
                      onChange={(e) => setNewUserForm({ ...newUserForm, storeBio: e.target.value })}
                      placeholder="e.g. Handcrafted high-fidelity equipment"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Coupon */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddCouponOpen(false)} className="fixed inset-0 bg-slate-950/70" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Promo Voucher</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={newCouponForm.description}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newCouponForm.discountPercent}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discountPercent: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Min Spend</label>
                    <span className="text-[10px] text-indigo-600 font-bold font-mono">
                      {formatPrice(newCouponForm.minOrderAmount)}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={newCouponForm.minOrderAmount}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, minOrderAmount: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-3 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
