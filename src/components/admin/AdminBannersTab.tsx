import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SeasonalEvent } from '../../types';
import {
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Check,
  Tag,
  ArrowRight,
  Zap,
  Calendar,
  Layers,
  Edit2,
  Percent,
} from 'lucide-react';
import { motion } from 'motion/react';

interface PromoBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaAction: string;
  imageUrl: string;
  bgGradient: string;
  isActive: boolean;
}

const DEFAULT_BANNERS: PromoBanner[] = [
  {
    id: 'banner-1',
    badge: 'FLASH DEALS ⚡ 70% OFF',
    title: 'Super Lightning Deals: Flagship Tech & Phones',
    subtitle: 'Ultra-low prices on iPhone 17 Pro Max, OLED monitors & smartwatches.',
    ctaText: 'Shop Tech Deals',
    ctaAction: 'deals',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    bgGradient: 'from-amber-600 via-orange-600 to-rose-700',
    isActive: true,
  },
  {
    id: 'banner-2',
    badge: 'SEASONAL CARNIVAL 🎁 20% OFF',
    title: 'CartNova Mega Shopping Carnival: Extra 20% Off',
    subtitle: 'Claim automatic 20% off all fashion, home aesthetics, and gourmet food collections.',
    ctaText: 'Activate 20% Off',
    ctaAction: 'seasonal-events',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    bgGradient: 'from-purple-700 via-indigo-700 to-slate-900',
    isActive: true,
  },
  {
    id: 'banner-3',
    badge: 'FREE DELIVERY NATIONWIDE 🚚',
    title: 'Express Doorstep Delivery Across Nigeria',
    subtitle: 'Zero shipping fees on all eligible orders over ₦25,000 via DHL express courier.',
    ctaText: 'Explore Eligible Items',
    ctaAction: 'free-shipping',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    bgGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    isActive: true,
  },
];

export const AdminBannersTab: React.FC = () => {
  const { seasonalEvents, activateSeasonalEventDiscount, addToast } = useStore();

  const [banners, setBanners] = useState<PromoBanner[]>(DEFAULT_BANNERS);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<PromoBanner>(DEFAULT_BANNERS[0]);

  const handleToggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    addToast('success', 'Banner Status Updated', 'Homepage promotional banner visibility changed.');
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    setBanners((prev) =>
      prev.map((b) => (b.id === editingBanner.id ? editingBanner : b))
    );
    setPreviewBanner(editingBanner);
    setEditingBanner(null);
    addToast('success', 'Banner Saved', 'Promotional hero banner updated.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-md uppercase">
              Campaign & Visual Merchandising
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Homepage Sliders & Seasonal Promos
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Promotional Banners & 20% Off Campaigns</h2>
          <p className="text-xs text-slate-500">
            Customize hero headline banners, call-to-action triggers, and scheduled seasonal discount campaigns.
          </p>
        </div>
      </div>

      {/* Live Banner Visual Preview */}
      <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold flex items-center gap-1.5 text-amber-400">
            <Eye className="w-4 h-4" /> Live Hero Banner Display Preview
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded">
            Desktop & Mobile Responsive
          </span>
        </div>

        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${previewBanner.bgGradient} p-6 sm:p-8 min-h-[200px] flex flex-col justify-between shadow-xl`}>
          <div className="relative z-10 max-w-lg space-y-2">
            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider">
              {previewBanner.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {previewBanner.title}
            </h3>
            <p className="text-xs text-white/90 line-clamp-2">
              {previewBanner.subtitle}
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <button className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer">
              <span>{previewBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Image Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 sm:opacity-50 pointer-events-none overflow-hidden">
            <img
              src={previewBanner.imageUrl}
              alt="Promo Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Banner Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-white rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
              previewBanner.id === banner.id ? 'ring-2 ring-indigo-500 shadow-md' : 'border-slate-200'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                  {banner.badge}
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                    banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {banner.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{banner.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">{banner.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewBanner(banner)}
                className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingBanner(banner)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleBanner(banner.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    banner.isActive
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {banner.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seasonal 20% Discount Events Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Special 20% Discount Campaigns
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">Seasonal Discount Events Engine</h3>
            <p className="text-xs text-slate-500">
              Active festival campaigns automatically inject 20% OFF vouchers at checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {seasonalEvents.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{evt.themeIcon}</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-md">
                  {evt.discountPercent}% OFF
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
              <p className="text-[10px] text-slate-500">{evt.description}</p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    activateSeasonalEventDiscount(evt);
                    addToast('success', 'Campaign Activated', `20% coupon code "${evt.couponCode}" active for users.`);
                  }}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                >
                  Trigger Event ({evt.couponCode})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingBanner(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Edit Promotional Banner</h3>
            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Badge Text</label>
                <input
                  type="text"
                  value={editingBanner.badge}
                  onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Headline Title</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.ctaText}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editingBanner.imageUrl}
                    onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
