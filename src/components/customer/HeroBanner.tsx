import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Zap,
  Gift,
  Flame,
  Percent,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeroBannerProps {
  onOpenSpinWheel?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenSpinWheel }) => {
  const { products, viewProductDetail, setFilters, setSelectedCategory, formatPrice } = useStore();

  // Find featured product
  const featuredProduct = products.find((p) => p.isFlashDeal) || products[0];

  // Flash deal countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 44, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mb-8">
      {/* Main CartNova Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white shadow-2xl border-4 border-yellow-300">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-10 sm:px-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400 text-orange-950 text-xs font-black tracking-wide shadow-md uppercase">
              <Zap className="w-4 h-4 fill-orange-700 text-orange-700 animate-bounce" />
              <span>CARTNOVA MEGA SAVINGS • SHOP LIKE A TRILLIONAIRE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-yellow-100 leading-tight drop-shadow-md">
              Unbeatable Deals,{' '}
              <span className="text-white underline decoration-yellow-300 decoration-4">
                Factory Direct
              </span>
            </h1>

            <p className="text-orange-50 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Discover top gadgets, fashion, noise-cancelling tech, luxury boots, and home essentials with free shipping & guaranteed lowest price match!
            </p>

            {/* CTA & Spin Wheel Button */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                id="hero-shop-now-btn"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, searchQuery: '', category: 'all' }));
                  const el = document.getElementById('product-catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-yellow-300 rounded-xl font-black text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer group transform hover:scale-105 active:scale-95"
              >
                <span>Shop All Slashed Deals</span>
                <ArrowRight className="w-4 h-4 text-yellow-300 group-hover:translate-x-1 transition-transform" />
              </button>

              {onOpenSpinWheel && (
                <button
                  id="hero-spin-wheel-btn"
                  onClick={onOpenSpinWheel}
                  className="px-5 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-orange-950 rounded-xl font-black text-sm border-2 border-yellow-200 shadow-xl flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105 active:scale-95 animate-pulse"
                >
                  <Gift className="w-4 h-4 text-orange-700" />
                  <span>Free Spins: Win Cash, Tech & Food</span>
                </button>
              )}
            </div>

            {/* Flash Deal Timer Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-yellow-300/40 text-xs text-yellow-100">
              <div className="flex items-center gap-1.5 text-yellow-300 font-extrabold">
                <Flame className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                <span>LIGHTNING SALE ENDS IN:</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-white">
                <span className="bg-black/60 px-2 py-0.5 rounded border border-yellow-400/40 text-yellow-300">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-black/60 px-2 py-0.5 rounded border border-yellow-400/40 text-yellow-300">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-black/60 px-2 py-0.5 rounded border border-yellow-400/40 text-yellow-300">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {/* Right Featured Product Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => featuredProduct && viewProductDetail(featuredProduct)}
              className="relative bg-white text-slate-900 rounded-3xl p-5 border-4 border-yellow-300 shadow-2xl cursor-pointer hover:scale-102 transition-all group"
            >
              <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-lg shadow-md uppercase tracking-wider animate-bounce">
                -{featuredProduct?.discountPercentage || 50}% OFF
              </div>

              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                <img
                  src={featuredProduct?.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"}
                  alt={featuredProduct?.title || "CartNova Lightning Deal"}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-bold">
                  <span className="bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    ⚡ Lightning Deal
                  </span>
                  <span className="bg-orange-600 px-2.5 py-1 rounded-lg">
                    ★ {featuredProduct?.rating || 4.9} ({featuredProduct?.reviewCount || 382})
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-orange-600 font-extrabold uppercase tracking-wider">
                  CartNova Top Seller • 1-Click Fast Checkout
                </p>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-orange-600 transition-colors truncate">
                  {featuredProduct?.title}
                </h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-orange-600">{formatPrice(featuredProduct?.price || 15000)}</span>
                  {featuredProduct?.originalPrice && (
                    <span className="text-xs text-slate-400 line-through font-semibold">{formatPrice(featuredProduct.originalPrice)}</span>
                  )}
                  <span className="text-xs text-emerald-600 font-bold ml-auto flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Free Shipping
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Perks Trust Bar */}
        <div className="border-t border-orange-500/60 bg-orange-950/40 px-6 py-3.5">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-yellow-100 font-bold">
              <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
              <span><strong>Free Express Shipping</strong> on all items</span>
            </div>
            <div className="flex items-center gap-2.5 text-yellow-100 font-bold">
              <RotateCcw className="w-4 h-4 text-yellow-300 shrink-0" />
              <span><strong>90-Day Returns</strong> & 100% Refund</span>
            </div>
            <div className="flex items-center gap-2.5 text-yellow-100 font-bold">
              <ShieldCheck className="w-4 h-4 text-yellow-300 shrink-0" />
              <span><strong>Price Adjustment</strong> refund difference</span>
            </div>
            <div className="flex items-center gap-2.5 text-yellow-100 font-bold">
              <Percent className="w-4 h-4 text-yellow-300 shrink-0" />
              <span><strong>Security Protected</strong> 256-Bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
