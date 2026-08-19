import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Key,
  Bell,
  CreditCard,
  Package,
  Heart,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  Camera,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  LogOut,
  AlertCircle,
  Eye,
  EyeOff,
  Truck,
  Clock,
  ArrowRight,
  Download,
  XCircle,
  Navigation,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RecentlyViewedAndRecommended } from './RecentlyViewedAndRecommended';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

export const CustomerProfileView: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    openAuthModal,
    logout,
    updateUserProfile,
    orders,
    wishlist,
    currentCurrency,
    setCurrency,
    formatPrice,
    setActiveCustomerTab,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'details' | 'orders' | 'addresses' | 'security' | 'preferences' | 'browsing'>('details');

  // Personal details state
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '+234 800 123 4567');
  const [avatar, setAvatar] = useState(currentUser.avatar || AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Address state
  const [street, setStreet] = useState(currentUser.address?.street || '742 Evergreen Terrace');
  const [city, setCity] = useState(currentUser.address?.city || 'Lagos');
  const [state, setState] = useState(currentUser.address?.state || 'Lagos');
  const [zip, setZip] = useState(currentUser.address?.zip || '100001');
  const [country, setCountry] = useState(currentUser.address?.country || 'Nigeria');
  const [deliveryNotes, setDeliveryNotes] = useState('Ring bell or leave package with concierge.');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Preferences
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [smsDeliveryAlerts, setSmsDeliveryAlerts] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);

  // Sync state with currentUser when it changes
  useEffect(() => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '+234 800 123 4567');
    setAvatar(currentUser.avatar || AVATAR_PRESETS[0]);
    if (currentUser.address) {
      setStreet(currentUser.address.street || '');
      setCity(currentUser.address.city || '');
      setState(currentUser.address.state || '');
      setZip(currentUser.address.zip || '');
      setCountry(currentUser.address.country || 'Nigeria');
    }
  }, [currentUser]);

  // Statistics
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser.id ||
      (currentUser.email && o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (!isLoggedIn && (o.customerId === 'user-cust-1' || o.customerId === 'guest'))
  );
  const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('error', 'Name Required', 'Please enter your full name.');
      return;
    }
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatar,
    });
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
      },
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('error', 'Password Too Short', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('error', 'Mismatch', 'New passwords do not match.');
      return;
    }
    addToast('success', 'Password Updated', 'Your security credentials have been updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div className="py-8 max-w-4xl mx-auto space-y-8">
        {/* Guest Hero Box */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> CartNova Customer Membership
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Manage Your Personal Profile & Orders
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in or create your CartNova customer profile to save delivery addresses, track live courier shipments, save custom wishlists, and manage security settings.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => openAuthModal('login')}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Sign In to Your Account
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-xs transition-all cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Real-time Order Tracking</h3>
            <p className="text-xs text-slate-500">Live courier dispatch notifications and instant digital printable tax receipts.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1-Click Express Checkout</h3>
            <p className="text-xs text-slate-500">Auto-fill saved shipping addresses and payment methods seamlessly.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Saved Wishlist Sync</h3>
            <p className="text-xs text-slate-500">Keep favorite electronics, fashion, and accessories synchronized across all your devices.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info with Avatar */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Customer
                </span>
                {currentUser.authProvider === 'google' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google Account
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{email || 'No email registered'}</span>
              </p>
              <p className="text-xs text-slate-400">
                Member since {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2025'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setActiveCustomerTab('orders')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>My Orders ({customerOrders.length})</span>
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Avatar Preset Picker Collapsible */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-slate-100 space-y-4"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Select a Profile Avatar</h4>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset);
                        updateUserProfile({ avatar: preset });
                        setShowAvatarPicker(false);
                      }}
                      className={`relative shrink-0 rounded-xl overflow-hidden ring-2 transition-all cursor-pointer ${
                        avatar === preset ? 'ring-indigo-600 scale-105 shadow-md' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="Preset" className="w-14 h-14 object-cover" referrerPolicy="no-referrer" />
                      {avatar === preset && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      setAvatar(customAvatarUrl.trim());
                      updateUserProfile({ avatar: customAvatarUrl.trim() });
                      setCustomAvatarUrl('');
                      setShowAvatarPicker(false);
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Orders</span>
            <span className="text-lg font-black text-slate-900">{customerOrders.length}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Saved Wishlist</span>
            <span className="text-lg font-black text-rose-600">{wishlist.length} items</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Spent</span>
            <span className="text-lg font-black text-indigo-600">{formatPrice(totalSpent)}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Primary City</span>
            <span className="text-sm font-black text-slate-800 truncate block mt-0.5">{city || 'Lagos'}, {country || 'NG'}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'details' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </div>
          {activeTab === 'details' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Order History ({customerOrders.length})</span>
          </div>
          {activeTab === 'orders' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'addresses' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </div>
          {activeTab === 'addresses' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'security' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Login</span>
          </div>
          {activeTab === 'security' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'preferences' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>Preferences & Currency</span>
          </div>
          {activeTab === 'preferences' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('browsing')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'browsing' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Browsing & Recommendations</span>
          </div>
          {activeTab === 'browsing' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === 'details' && (
        <form onSubmit={handleSaveDetails} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Update your customer profile details and contact information.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 123 4567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Used for courier delivery SMS alerts and dispatch updates.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Account Role</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-semibold flex items-center justify-between">
                <span className="capitalize">{currentUser.role} Account</span>
                <span className="text-emerald-600 font-bold text-[11px]">Verified Active</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Order History & Tracking */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Purchase Summaries & Order History</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review past purchases, download printable official invoices, and track live courier shipments.
              </p>
            </div>
            <button
              onClick={() => setActiveCustomerTab('orders')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              <span>Open Live Radar & Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {customerOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our catalog of premium electronics, footwear, and accessories to make your first order.
              </p>
              <button
                onClick={() => setActiveCustomerTab('shop')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order) => {
                const isDelivered = order.status === 'delivered';
                const isShipped = order.status === 'shipped';
                const isCancelled = order.status === 'cancelled';

                return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-200 hover:shadow-xs transition-all space-y-3 bg-slate-50/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">#{order.orderNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isDelivered
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isShipped
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : isCancelled
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <button
                          onClick={() => setActiveCustomerTab('orders')}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Track Items</span>
                        </button>
                      </div>
                    </div>

                    {/* Order items thumbnails */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shrink-0 text-xs"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-8 h-8 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-medium text-slate-700 max-w-[140px] truncate">{item.productTitle}</span>
                          <span className="text-slate-400 font-mono">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Carrier: <strong className="text-slate-700">{order.carrier || 'Logistics Express'}</strong></span>
                        </span>
                        <span className="font-mono text-slate-600">Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Delivery Addresses */}
      {activeTab === 'addresses' && (
        <form onSubmit={handleSaveAddress} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Delivery Address</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your primary shipping address for 1-click checkout and dispatch.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1.5">Street Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="profile-street-input"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  placeholder="Street name, Building, Apartment number"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">City</label>
              <input
                id="profile-city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="e.g. Lagos, Seattle, London"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">State / Province</label>
              <input
                id="profile-state-input"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                placeholder="e.g. Lagos State, Washington"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Postal / ZIP Code</label>
              <input
                id="profile-zip-input"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
                placeholder="e.g. 100001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Country</label>
              <select
                id="profile-country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800 bg-white"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1.5">Delivery Notes & Gate Instructions</label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Ring bell or drop off with security post"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 text-slate-800"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Security & Login */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Provider Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Authentication Method</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your connected authentication provider for secure sign in.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Secure Session
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUser.authProvider === 'google' ? (
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {currentUser.authProvider === 'google' ? 'Google Authentication' : 'Email & Password Authentication'}
                  </h4>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-semibold">Connected</span>
            </div>
          </div>

          {/* Change Password Card */}
          <form onSubmit={handlePasswordChange} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Account Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ensure your account uses a strong, unique password.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirm Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>

          {/* 2FA Toggle Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-slate-500">Require an SMS code or Authenticator App prompt during login.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                addToast('info', '2FA Setting Changed', !twoFactorEnabled ? 'Two-Factor Authentication has been enabled.' : 'Two-Factor Authentication has been disabled.');
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Preferences & Currency */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Shopping Preferences & Notifications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize your currency display, alerts, and AI shopping assistance.</p>
          </div>

          {/* Currency Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 block">Default Shopping Currency</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
                { code: 'USD', name: 'US Dollar', symbol: '$' },
                { code: 'EUR', name: 'Euro', symbol: '€' },
                { code: 'GBP', name: 'British Pound', symbol: '£' },
              ] as const).map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setCurrency(curr.code);
                    addToast('info', 'Currency Updated', `Display currency changed to ${curr.code} (${curr.symbol})`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    currentCurrency.code === curr.code
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">{curr.code}</span>
                    <span className="font-bold text-indigo-600">{curr.symbol}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">{curr.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-800">Notification Alerts</h3>

            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Order Status & Courier Updates</p>
                <p className="text-slate-500 text-[11px]">Receive emails when your package dispatches, ships, and arrives.</p>
              </div>
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Promotions & Flash Deals</p>
                <p className="text-slate-500 text-[11px]">Get exclusive discounts and early access to CartNova flash sales.</p>
              </div>
              <input
                type="checkbox"
                checked={promotionalEmails}
                onChange={(e) => setPromotionalEmails(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Nova AI Personalized Recommendations</p>
                <p className="text-slate-500 text-[11px]">Allow Nova AI to tailor trending product discoveries based on your shopping interests.</p>
              </div>
              <input
                type="checkbox"
                checked={aiRecommendations}
                onChange={(e) => setAiRecommendations(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveCustomerTab('notifications')}
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-indigo-200/60"
              >
                <Bell className="w-4 h-4" />
                <span>Go to Customer Notifications Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Browsing History & Recommendations */}
      {activeTab === 'browsing' && (
        <RecentlyViewedAndRecommended defaultTab="recently_viewed" limit={12} />
      )}
    </div>
  );
};
