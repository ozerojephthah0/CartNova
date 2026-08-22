import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Product, Coupon } from '../../types';
import { AdminProductModal } from './AdminProductModal';
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
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    allUsers,
    products,
    orders,
    coupons,
    categories,
    toggleUserStatus,
    addUser,
    updateProduct,
    deleteProduct,
    addCoupon,
    toggleCouponStatus,
    deleteCoupon,
    formatPrice,
  } = useStore();

  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'catalog' | 'coupons'>('overview');

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
    addUser({
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + allUsers.length}?w=400&auto=format&fit=crop&q=80`,
      storeName: newUserForm.role === 'seller' ? newUserForm.storeName : undefined,
      storeBio: newUserForm.role === 'seller' ? newUserForm.storeBio : undefined,
      phone: '+1 (555) 900-1122',
      address: {
        street: '100 Innovation Way',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'United States',
      },
    });
    setNewUserForm({ name: '', email: '', role: 'seller', storeName: '', storeBio: '' });
    setIsAddUserOpen(false);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    addCoupon({
      code: newCouponForm.code.toUpperCase(),
      description: newCouponForm.description,
      discountPercent: Number(newCouponForm.discountPercent),
      minOrderAmount: Number(newCouponForm.minOrderAmount),
      isActive: true,
      expiresAt: newCouponForm.expiresAt,
    });
    setNewCouponForm({ code: '', description: '', discountPercent: 15, minOrderAmount: 50, expiresAt: '2026-12-31' });
    setIsAddCouponOpen(false);
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
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="admin-tab-overview"
          onClick={() => setAdminTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Merchant Governance ({allUsers.length})</span>
        </button>

        <button
          id="admin-tab-catalog"
          onClick={() => setAdminTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalog & Deal Moderation ({products.length})</span>
        </button>

        <button
          id="admin-tab-coupons"
          onClick={() => setAdminTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            adminTab === 'coupons'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions & Vouchers ({coupons.length})</span>
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
                          <div>
                            <span className="font-bold text-slate-800">{u.storeName}</span>
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{u.storeBio}</p>
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
                      <td className="p-4 text-right">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <button
              id="admin-add-product-catalog-btn"
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
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
                      <td colSpan={8} className="p-8 text-center text-slate-400">
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
                    filteredCatalog.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

      {/* Modal: Admin Add / Edit Product */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={editingProduct}
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
