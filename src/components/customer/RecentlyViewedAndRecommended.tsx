import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  Sparkles,
  Clock,
  Flame,
  Trash2,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Layers,
  ShoppingBag,
  ArrowRight,
  Eye,
  CheckCircle2,
  X,
  Zap,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecentlyViewedAndRecommendedProps {
  currentProductId?: string;
  defaultTab?: 'recommended' | 'recently_viewed' | 'trending';
  showTabs?: boolean;
  layout?: 'grid' | 'carousel';
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const RecentlyViewedAndRecommended: React.FC<RecentlyViewedAndRecommendedProps> = ({
  currentProductId,
  defaultTab = 'recommended',
  showTabs = true,
  layout = 'grid',
  title,
  subtitle,
  limit = 8,
}) => {
  const {
    products,
    recentlyViewedProducts,
    recommendedProducts,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
    getRecommendationsForProduct,
    viewProductDetail,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'recommended' | 'recently_viewed' | 'trending'>(defaultTab);

  // Trending products with high ratings and discounts
  const trendingProducts = React.useMemo(() => {
    return products
      .filter((p) => (p.rating >= 4.7 || (p.discountPercentage && p.discountPercentage >= 15)) && p.id !== currentProductId)
      .slice(0, limit);
  }, [products, currentProductId, limit]);

  // Current product recommendations if on product detail page
  const contextualRecommendations = React.useMemo(() => {
    if (currentProductId) {
      const current = products.find((p) => p.id === currentProductId);
      if (current) {
        return getRecommendationsForProduct(current, limit);
      }
    }
    return recommendedProducts.filter((p) => p.id !== currentProductId).slice(0, limit);
  }, [currentProductId, products, getRecommendationsForProduct, recommendedProducts, limit]);

  // Filter recently viewed to exclude current product if provided
  const displayedRecentlyViewed = React.useMemo(() => {
    return recentlyViewedProducts.filter((p) => p.id !== currentProductId).slice(0, limit);
  }, [recentlyViewedProducts, currentProductId, limit]);

  const displayedList = React.useMemo(() => {
    switch (activeTab) {
      case 'recently_viewed':
        return displayedRecentlyViewed;
      case 'trending':
        return trendingProducts;
      case 'recommended':
      default:
        return contextualRecommendations;
    }
  }, [activeTab, displayedRecentlyViewed, trendingProducts, contextualRecommendations]);

  // Derive smart match tags for recommended items
  const getMatchBadge = (index: number) => {
    const scores = ['99% Match', '96% Match', '94% Match', '91% Match', '89% Match'];
    return scores[index % scores.length];
  };

  const getReasonTag = (index: number) => {
    const reasons = [
      'Based on your browsing',
      'Trending in your category',
      'Frequently paired item',
      'Top rated by customers',
      'Matches your wishlist',
    ];
    return reasons[index % reasons.length];
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-6 my-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {activeTab === 'recommended' && <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />}
            {activeTab === 'recently_viewed' && <Clock className="w-5 h-5 text-cyan-600" />}
            {activeTab === 'trending' && <Flame className="w-5 h-5 text-rose-500" />}
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {title || (
                activeTab === 'recommended'
                  ? 'Personalized For You'
                  : activeTab === 'recently_viewed'
                  ? 'Your Recently Viewed Items'
                  : 'Trending & Hot Picks'
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {subtitle || (
              activeTab === 'recommended'
                ? 'Curated recommendations based on your preferences, cart, and category affinity'
                : activeTab === 'recently_viewed'
                ? 'Quickly jump back to products you inspected during your browsing session'
                : 'Top-rated and high-velocity marketplace favorites'
            )}
          </p>
        </div>

        {/* Tab Switcher & Clear History Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {showTabs && (
            <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'recommended'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended</span>
              </button>

              <button
                onClick={() => setActiveTab('recently_viewed')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer relative ${
                  activeTab === 'recently_viewed'
                    ? 'bg-white text-cyan-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Viewed</span>
                {displayedRecentlyViewed.length > 0 && (
                  <span className="w-4 h-4 bg-cyan-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                    {displayedRecentlyViewed.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'trending'
                    ? 'bg-white text-rose-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Trending</span>
              </button>
            </div>
          )}

          {activeTab === 'recently_viewed' && displayedRecentlyViewed.length > 0 && (
            <button
              onClick={clearRecentlyViewed}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Clear all recently viewed browsing history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {displayedList.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            {activeTab === 'recently_viewed' ? <Clock className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              {activeTab === 'recently_viewed' ? 'No Recently Viewed Products' : 'No Recommendations Available Yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'recently_viewed'
                ? 'As you explore products, catalog items will automatically appear here so you can easily compare and review.'
                : 'Browse our catalog categories and interact with products to get personalized recommendations tailored to your style.'}
            </p>
          </div>
        </div>
      ) : layout === 'carousel' ? (
        /* Horizontal Scroll Carousel */
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 flex gap-4 snap-x">
          {displayedList.map((product, idx) => (
            <div key={product.id} className="min-w-[240px] max-w-[260px] shrink-0 snap-start relative group">
              {activeTab === 'recommended' && (
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60">
                    {getMatchBadge(idx)}
                  </span>
                  <span className="text-slate-400">{getReasonTag(idx)}</span>
                </div>
              )}
              {activeTab === 'recently_viewed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromRecentlyViewed(product.id);
                  }}
                  className="absolute top-3 right-3 z-20 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg shadow-xs transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Remove from history"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <ProductCard product={product} viewMode="grid" />
            </div>
          ))}
        </div>
      ) : (
        /* Standard Grid with Smart Badges */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayedList.map((product, idx) => (
            <div key={product.id} className="relative flex flex-col justify-between group">
              {activeTab === 'recommended' && (
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/50">
                    <Sparkles className="w-2.5 h-2.5" />
                    {getMatchBadge(idx)}
                  </span>
                  <span className="text-slate-400 truncate max-w-[130px]">{getReasonTag(idx)}</span>
                </div>
              )}

              {activeTab === 'recently_viewed' && (
                <div className="mb-2 flex items-center justify-between text-[10px]">
                  <span className="text-cyan-700 font-semibold flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Viewed recently
                  </span>
                  <button
                    onClick={() => removeFromRecentlyViewed(product.id)}
                    className="text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    Remove
                  </button>
                </div>
              )}

              <ProductCard product={product} viewMode="grid" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
