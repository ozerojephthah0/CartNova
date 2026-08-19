import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerNotification, NotificationType } from '../../types';
import {
  Bell,
  CheckCircle2,
  Package,
  Zap,
  TrendingDown,
  Star,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Trash2,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    userNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    handleNotificationAction,
    setActiveCustomerTab,
    deleteNotification,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'unread' | 'orders'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffInSec = Math.max(0, Math.floor((now.getTime() - past.getTime()) / 1000));

      if (diffInSec < 60) return 'Just now';
      if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
      if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
      return `${Math.floor(diffInSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
        );
      case 'deal':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        );
      case 'price_drop':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
        );
      case 'review':
        return (
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4" />
          </div>
        );
      case 'security':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const filteredList = userNotifications.filter((n) => {
    if (activeSubTab === 'unread') return !n.read;
    if (activeSubTab === 'orders') return n.type === 'order';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100/70 text-indigo-700 rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </h3>
          </div>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-3 pt-2 pb-1 border-b border-slate-100 flex items-center gap-1 bg-white">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({userNotifications.length})
        </button>
        <button
          onClick={() => setActiveSubTab('unread')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'unread'
              ? 'bg-rose-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadNotificationsCount})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Orders
        </button>
      </div>

      {/* Notifications Body */}
      <div className="overflow-y-auto divide-y divide-slate-100 max-h-[380px]">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No notifications here</p>
            <p className="text-[11px] text-slate-400">
              {activeSubTab === 'unread'
                ? "You've read all your recent notifications."
                : 'Activity updates and alerts will appear here.'}
            </p>
          </div>
        ) : (
          filteredList.slice(0, 10).map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                handleNotificationAction(notif);
                onClose();
              }}
              className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 relative group ${
                !notif.read ? 'bg-indigo-50/40' : 'bg-white'
              }`}
            >
              {/* Type icon */}
              {getNotificationIcon(notif.type)}

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{getRelativeTime(notif.timestamp)}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-600 group-hover:underline flex items-center gap-1">
                    <span>{notif.actionType === 'order' ? 'Track order' : 'View'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>

                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                      }}
                      className="text-[10px] text-slate-400 hover:text-indigo-600 font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail if present */}
              {notif.image && (
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={notif.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer view all button */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          onClick={() => {
            setActiveCustomerTab('notifications');
            onClose();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Open Notification Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
