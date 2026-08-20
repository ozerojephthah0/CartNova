import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Flame,
  Zap,
  Tag,
  DollarSign,
  Crown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Clock,
} from 'lucide-react';
import { ProductCard } from './ProductCard';

type BargainTab = 'lightning' | 'under5k' | 'under15k' | 'clearance80' | 'bestsellers';

export const TemuBargainZone: React.FC = () => {
  const { products, setFilters } = useStore();
  const [activeTab, setActiveTab] = useState<BargainTab>('lightning');

  const bargainProducts = useMemo(() => {
    switch (activeTab) {
      case 'lightning':
        return products
          .filter((p) => p.isFlashDeal || (p.discountPercentage && p.discountPercentage >= 35))
          .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
          .slice(0, 8);
      case 'under5k':
        // Under ₦15,000 or low-priced items
        return products
          .filter((p) => p.price <= 25000)
          .sort((a, b) => a.price - b.price)
          .slice(0, 8);
      case 'under15k':
        return products
          .filter((p) => p.price <= 50000)
          .sort((a, b) => a.price - b.price)
          .slice(0, 8);
      case 'clearance80':
        return products
          .filter((p) => (p.discountPercentage || 0) >= 30)
          .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
          .slice(0, 8);
      case 'bestsellers':
        return products
          .slice()
          .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
          .slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  }, [products, activeTab]);

  return (
    <section className="my-8 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 rounded-3xl p-5 sm:p-7 border border-orange-200/80 dark:border-slate-800 shadow-2xs space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-orange-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/30 animate-pulse">
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>TEMU BARGAIN ZONE</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-extrabold uppercase">
                Up to 90% OFF
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unbeatable low-price steals, lightning price slashes, and factory-direct clearance deals
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'lightning', label: '⚡ Lightning Deals', icon: Zap },
            { id: 'under5k', label: '🏷️ Under $5 Steals', icon: Tag },
            { id: 'under15k', label: '💰 Under $15 Bargains', icon: DollarSign },
            { id: 'clearance80', label: '🔥 80%+ Clearance', icon: Flame },
            { id: 'bestsellers', label: '👑 Top Best Sellers', icon: Crown },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BargainTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bargain Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {bargainProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Bottom CTA to full catalog */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            setFilters((prev) => ({ ...prev, searchQuery: '', category: 'all', onSaleOnly: true }));
            const el = document.getElementById('product-catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer group"
        >
          <span>View All 80%+ Slashed Items</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
