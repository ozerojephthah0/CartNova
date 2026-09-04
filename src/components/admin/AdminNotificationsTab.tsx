import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerNotification, NotificationType } from '../../types';
import {
  Bell,
  Send,
  Sparkles,
  Zap,
  Tag,
  ShieldAlert,
  Megaphone,
  CheckCircle2,
  Trash2,
  Clock,
  Radio,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminNotificationsTab: React.FC = () => {
  const { notifications, broadcastNotification, deleteNotification, addToast } = useStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('promotion');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      addToast('error', 'Incomplete Form', 'Please enter a title and message for the broadcast.');
      return;
    }

    broadcastNotification(title.trim(), message.trim(), type, priority);
    setTitle('');
    setMessage('');
  };

  const handleLoadTemplate = (tTitle: string, tMessage: string, tType: NotificationType, tPriority: 'low' | 'normal' | 'high') => {
    setTitle(tTitle);
    setMessage(tMessage);
    setType(tType);
    setPriority(tPriority);
    addToast('info', 'Template Loaded', `Pre-filled "${tTitle}"`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md uppercase">
              Broadcast Center
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Live Push Notification Messaging & Audience Announcements
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Send Broadcast Notifications</h2>
          <p className="text-xs text-slate-500">
            Publish real-time push announcements, flash sale alerts, and system notices directly to all connected users.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Composer Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Megaphone className="w-4 h-4" />
            <span>Compose Notification Broadcast</span>
          </div>

          {/* Quick Preset Templates */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">⚡ Quick Notification Templates:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleLoadTemplate(
                    '⚡ Midnight Flash Sale: Up to 70% Off!',
                    'Limited time lightning deals on premium electronics and fashion are live now. Shop before timer runs out!',
                    'deal',
                    'high'
                  )
                }
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-left transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-bold text-amber-900 block truncate">⚡ Flash Deals 70%</span>
                <span className="text-[10px] text-amber-700">Lightning deals alert</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleLoadTemplate(
                    '🎁 Free Gift Alert: Claim Your ₦10,000 Voucher',
                    'Use promo code NOVA10K at checkout for an instant ₦10,000 discount on orders over ₦50,000.',
                    'promotion',
                    'normal'
                  )
                }
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-xl text-left transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-bold text-purple-900 block truncate">🎁 ₦10,000 Coupon</span>
                <span className="text-[10px] text-purple-700">Voucher code drop</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleLoadTemplate(
                    '🚚 Faster Delivery: Weekend Express Routing',
                    'All nationwide express orders placed today will arrive in 24-48 hours via DHL priority dispatch.',
                    'system',
                    'normal'
                  )
                }
                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl text-left transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-bold text-blue-900 block truncate">🚚 Express Routing</span>
                <span className="text-[10px] text-blue-700">Logistics announcement</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Notification Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 Weekend Mega Sale is Now Live!"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Message Body *</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the clear announcement text shown in user notification center..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs focus:outline-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                >
                  <option value="promotion">Promotion & Campaign</option>
                  <option value="deal">Flash Deal / Lightning Sale</option>
                  <option value="system">System Announcement</option>
                  <option value="order">Order & Logistics</option>
                  <option value="security">Security & Account</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                >
                  <option value="normal">Normal (Standard Bell)</option>
                  <option value="high">High (Priority Badge)</option>
                  <option value="low">Low (Background Informational)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Radio className="w-4 h-4" />
                <span>Broadcast to All Active Users</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Broadcast History */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col max-h-[550px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Sent Notification Feed ({notifications.length})</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                        notif.type === 'deal'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.type === 'promotion'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{notif.message}</p>
                </div>

                <button
                  onClick={() => {
                    deleteNotification(notif.id);
                    addToast('info', 'Notification Removed', 'Notice removed from active feed.');
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete Notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
