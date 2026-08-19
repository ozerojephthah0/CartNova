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
  Timer,
} from 'lucide-react';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { products, viewProductDetail, setFilters, setSelectedCategory, formatPrice } = useStore();

  // Find featured headphone product
  const featuredProduct = products.find((p) => p.id === 'prod-1') || products[0];

  // Flash deal countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

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
      {/* Main Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-slate-800/80">
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:px-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SUMMER TECH & LIFESTYLE RELEASE 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Elevate Your Everyday with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                Precision Tech
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Discover curated audio gear, titanium wearables, ultra-responsive tactile keyboards, and minimalist everyday carry essentials from verified boutique sellers.
            </p>

            {/* CTA & Flash Deals Countdown */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-shop-now-btn"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, searchQuery: '', category: 'all' }));
                  const el = document.getElementById('product-catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer group"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-audio-shortcut-btn"
                onClick={() => setSelectedCategory('Audio & Wearables')}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-slate-100 rounded-xl font-semibold text-sm border border-white/10 backdrop-blur-xs transition-colors cursor-pointer"
              >
                View Audio Gear
              </button>
            </div>

            {/* Flash Deal Timer Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                <span>FLASH DEALS END IN:</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-white">
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-300">
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
              className="relative bg-slate-900/90 rounded-2xl p-5 border border-slate-700/60 shadow-2xl backdrop-blur-md cursor-pointer hover:border-indigo-500/50 transition-all group"
            >
              <div className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-rose-500 text-white text-xs font-black rounded-lg shadow-md">
                28% OFF
              </div>

              <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden bg-slate-950 mb-4">
                <img
                  src={featuredProduct?.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"}
                  alt={featuredProduct?.title || "NovaSound Pro ANC"}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                  <span className="bg-slate-900/80 px-2 py-1 rounded backdrop-blur-xs">
                    {featuredProduct?.category || "Flagship Audio"}
                  </span>
                  <span className="text-amber-300 font-bold">★ {featuredProduct?.rating || 4.9} ({featuredProduct?.reviewCount || 142} reviews)</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  Featured Spotlight • Click to View Details
                </p>
                <h2 className="text-base font-bold text-white mt-0.5 group-hover:text-indigo-300 transition-colors">
                  {featuredProduct?.title || "NovaSound Pro ANC Wireless Headphones"}
                </h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-black text-white">{formatPrice(featuredProduct?.price || 185000)}</span>
                  {featuredProduct?.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">{formatPrice(featuredProduct.originalPrice)}</span>
                  )}
                  <span className="text-xs text-emerald-400 font-semibold">Free Express Shipping</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Perks Trust Bar */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 px-6 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>Free Shipping</strong> on orders over {formatPrice(50000)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>30-Day Returns</strong> hassle-free policy</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
              <span><strong>Verified Sellers</strong> 100% authentic</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>24/7 Support</strong> with Nova AI & humans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
