import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Product, Coupon } from '../../types';
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
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    allUsers,
    products,
    orders,
    coupons,
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

  // Search in catalog
  const [catalogSearch, setCatalogSearch] = useState('');

  // Platform Metrics
  const gmv = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const platformRevenue = gmv * 0.1; // 10% platform take rate
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? gmv / totalOrders : 0;

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

  const filteredCatalog = products.filter(
    (p) =>
      p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(catalogSearch.toLowerCase())
  );

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
              Govern marketplace sellers, monitor GMV and platform take rates, approve catalog listings, and deploy promo vouchers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="admin-add-merchant-btn"
            onClick={() => {
              setAdminTab('users');
              setIsAddUserOpen(true);
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
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
                CartNova backend, Gemini 3.7 Flash shopping assistants, payment gateways, and inventory trackers are performing at 99.98% uptime.
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

      {/* TAB 3: Catalog Moderation */}
      {adminTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Marketplace Catalog Moderation</h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search listings by title, brand, seller..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-purple-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Featured Status</th>
                    <th className="p-4 text-center">Flash Deal</th>
                    <th className="p-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 line-clamp-1">{prod.title}</p>
                            <p className="text-slate-400 text-[10px]">{prod.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{prod.sellerName}</td>
                      <td className="p-4 font-bold text-slate-900">{formatPrice(prod.price)}</td>
                      <td className="p-4 text-slate-600 font-medium">{prod.stock} units</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => updateProduct(prod.id, { isFeatured: !prod.isFeatured })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            prod.isFeatured
                              ? 'bg-indigo-600 text-white'
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
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {prod.isFlashDeal ? '⚡ Flash Deal' : 'No'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove listing "${prod.title}" from platform?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
