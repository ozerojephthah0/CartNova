import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerNotification, NotificationType } from '../../types';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Package,
  Tag,
  Zap,
  TrendingDown,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Check,
  Eye,
  SlidersHorizontal,
  Clock,
  ExternalLink,
  ChevronLeft,
  BellRing,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationsView: React.FC = () => {
  const {
    userNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    handleNotificationAction,
    setActiveCustomerTab,
    currentUser,
    addToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'unread' | 'order' | 'deal_price' | 'review' | 'security'
  >('all');
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference toggles
  const [prefOrders, setPrefOrders] = useState(true);
  const [prefDeals, setPrefDeals] = useState(true);
  const [prefPriceDrops, setPrefPriceDrops] = useState(true);
  const [prefSecurity, setPrefSecurity] = useState(true);

  // Format relative timestamp
  const getRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffInSec = Math.max(0, Math.floor((now.getTime() - past.getTime()) / 1000));

      if (diffInSec < 60) return 'Just now';
      if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
      if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
      if (diffInSec < 172800) return 'Yesterday';
      return `${Math.floor(diffInSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        );
      case 'deal':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        );
      case 'price_drop':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        );
      case 'review':
        return (
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
        );
      case 'security':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  const getActionLabel = (notif: CustomerNotification) => {
    switch (notif.actionType) {
      case 'order':
        return 'View Order Details';
      case 'product':
        return 'View Product';
      case 'flash_deals':
        return 'Explore Flash Deals';
      case 'wishlist':
        return 'Go to Saved Wishlist';
      case 'profile':
        return 'Security Settings';
      default:
        return 'View Details';
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return userNotifications.filter((n) => {
      // Type filter
      if (selectedFilter === 'unread' && n.read) return false;
      if (selectedFilter === 'order' && n.type !== 'order') return false;
      if (
        selectedFilter === 'deal_price' &&
        n.type !== 'deal' &&
        n.type !== 'price_drop'
      )
        return false;
      if (selectedFilter === 'review' && n.type !== 'review') return false;
      if (selectedFilter === 'security' && n.type !== 'security') return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMsg = n.message.toLowerCase().includes(q);
        return matchTitle || matchMsg;
      }

      return true;
    });
  }, [userNotifications, selectedFilter, searchQuery]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: userNotifications.length,
      unread: unreadNotificationsCount,
      order: userNotifications.filter((n) => n.type === 'order').length,
      deal_price: userNotifications.filter(
        (n) => n.type === 'deal' || n.type === 'price_drop'
      ).length,
      review: userNotifications.filter((n) => n.type === 'review').length,
      security: userNotifications.filter((n) => n.type === 'security').length,
    };
  }, [userNotifications, unreadNotificationsCount]);

  // Simulation helpers for testing
  const triggerSimulation = (scenario: 'order' | 'price_drop' | 'deal') => {
    if (scenario === 'order') {
      addNotification({
        userId: currentUser.id || 'user-cust-1',
        title: 'Courier Out for Delivery',
        message: 'Your parcel #ORD-84920 is with dispatch courier Ibrahim (080-234-9812) and will arrive today.',
        type: 'order',
        priority: 'high',
        actionType: 'order',
        actionId: 'ord-84920',
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=80',
      });
      addToast('success', 'Test Notification Generated', 'Simulated real-time courier update!');
    } else if (scenario === 'price_drop') {
      addNotification({
        userId: currentUser.id || 'user-cust-1',
        title: 'Wishlist Deal: 20% Off Applied',
        message: 'Phantom Elite Grip FG Pro Cleats are now ₦140,000 (discounted from ₦175,000).',
        type: 'price_drop',
        priority: 'normal',
        actionType: 'product',
        actionId: 'prod-boot-fb-2',
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=200&auto=format&fit=crop&q=80',
      });
      addToast('success', 'Test Notification Generated', 'Simulated price drop alert!');
    } else {
      addNotification({
        userId: 'all',
        title: 'Flash Sale: Free Express Shipping Today',
        message: 'Use promo code NOVA20 for 20% off all audio gear, boots, and electronics with free priority delivery.',
        type: 'deal',
        priority: 'normal',
        actionType: 'flash_deals',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80',
      });
      addToast('success', 'Test Notification Generated', 'Simulated flash deal announcement!');
    }
  };

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveCustomerTab('shop')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="Return to Shop"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Notifications Center</span>
              </h1>
              {unreadNotificationsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
                  {unreadNotificationsCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time order tracking, price drop alerts, flash deals, and account security.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200/60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}

          {userNotifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showPreferences
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Alert Settings</span>
          </button>
        </div>
      </div>

      {/* Preferences & Simulation Collapsible Card */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-indigo-400" />
                    <span>Customer Alert Channels & Preferences</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize which automatic notifications you receive for your orders and saved wishlist.
                  </p>
                </div>

                {/* Quick Simulation Trigger Pill */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Test Triggers:</span>
                  <button
                    onClick={() => triggerSimulation('order')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + Order Alert
                  </button>
                  <button
                    onClick={() => triggerSimulation('price_drop')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + Price Drop
                  </button>
                  <button
                    onClick={() => triggerSimulation('deal')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + Flash Deal
                  </button>
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Order Tracking</span>
                    <span className="text-[11px] text-slate-400">Courier live updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefOrders}
                    onChange={(e) => setPrefOrders(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Price Drop Alerts</span>
                    <span className="text-[11px] text-slate-400">Wishlist discounts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefPriceDrops}
                    onChange={(e) => setPrefPriceDrops(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Flash Promos</span>
                    <span className="text-[11px] text-slate-400">20% discount & coupons</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefDeals}
                    onChange={(e) => setPrefDeals(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Security & Sign-in</span>
                    <span className="text-[11px] text-slate-400">Device login alerts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefSecurity}
                    onChange={(e) => setPrefSecurity(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-indigo-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({counts.all})
            </button>

            <button
              onClick={() => setSelectedFilter('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'unread'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({counts.unread})
            </button>

            <button
              onClick={() => setSelectedFilter('order')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'order'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Orders ({counts.order})
            </button>

            <button
              onClick={() => setSelectedFilter('deal_price')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'deal_price'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Deals & Drops ({counts.deal_price})
            </button>

            <button
              onClick={() => setSelectedFilter('security')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === 'security'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Security ({counts.security})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No notifications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No notifications matching "${searchQuery}". Try searching with different keywords.`
                : selectedFilter === 'unread'
                ? "You're all caught up! No unread notifications at the moment."
                : "You don't have any notifications in this category yet."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => triggerSimulation('order')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Send Test Notification
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all relative ${
                notif.read
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-indigo-50/40 border-indigo-200/90 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                {getNotificationIcon(notif.type)}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      )}
                      {notif.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/60 rounded text-[10px] font-bold uppercase">
                          Important
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{getRelativeTime(notif.timestamp)}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pr-2">
                    {notif.message}
                  </p>

                  {/* Actions & Deep Links */}
                  <div className="pt-2.5 flex items-center gap-2.5 flex-wrap">
                    {notif.actionType && (
                      <button
                        onClick={() => handleNotificationAction(notif)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{getActionLabel(notif)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!notif.read ? (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark read</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Read</span>
                      </span>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-auto"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional Attached Product / Order Thumbnail */}
                {notif.image && (
                  <div
                    onClick={() => handleNotificationAction(notif)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 cursor-pointer group shadow-2xs hidden xs:block"
                  >
                    <img
                      src={notif.image}
                      alt="Attached asset"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
