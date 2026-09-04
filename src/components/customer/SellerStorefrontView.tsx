import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import {
  Store,
  CheckCircle2,
  Star,
  Users,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Share2,
  Heart,
  MessageSquare,
  Sparkles,
  Ticket,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { motion } from 'motion/react';

export const SellerStorefrontView: React.FC = () => {
  const {
    allUsers,
    products,
    selectedSellerId,
    setSelectedSellerId,
    setActiveCustomerTab,
    applyCoupon,
    addToast,
    openSupportTicket,
    formatPrice,
    reviews,
  } = useStore();

  const [isFollowing, setIsFollowing] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeCategory, setStoreCategory] = useState('all');
  const [storeTab, setStoreTab] = useState<'products' | 'deals' | 'bestsellers' | 'reviews'>('products');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Find target seller or default to first verified seller
  const seller = useMemo(() => {
    if (selectedSellerId) {
      const match = allUsers.find((u) => u.id === selectedSellerId);
      if (match) return match;
    }
    const verifiedSeller = allUsers.find((u) => u.role === 'seller' || u.isVerifiedSeller);
    return verifiedSeller || allUsers.find((u) => u.storeName) || allUsers[0];
  }, [allUsers, selectedSellerId]);

  // Seller's products
  const sellerProducts = useMemo(() => {
    if (!seller) return products.slice(0, 8);
    return products.filter(
      (p) =>
        p.sellerId === seller.id ||
        (seller.storeName && (p.sellerName || '').toLowerCase().includes(seller.storeName.toLowerCase())) ||
        p.brand?.toLowerCase() === (seller.storeName || '').toLowerCase()
    );
  }, [products, seller]);

  // Fallback if seller has few or 0 items in mock data
  const displayedProductsList = sellerProducts.length > 0 ? sellerProducts : products.slice(0, 12);

  // Filtered by store search & tab
  const filteredProducts = useMemo(() => {
    return displayedProductsList
      .filter((p) => {
        if (storeSearchQuery) {
          const q = storeSearchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }
        if (storeCategory !== 'all') {
          if (p.category.toLowerCase() !== storeCategory.toLowerCase()) return false;
        }
        if (storeTab === 'deals') {
          return (p.discount || p.discountPercentage || 0) > 0;
        }
        if (storeTab === 'bestsellers') {
          return (p.reviewCount || 0) > 20 || (p.rating || 0) >= 4.7;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
  }, [displayedProductsList, storeSearchQuery, storeCategory, storeTab, sortBy]);

  // Available categories in this store
  const storeCategories = useMemo(() => {
    const set = new Set(displayedProductsList.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [displayedProductsList]);

  // Seller reviews
  const sellerReviews = useMemo(() => {
    const productIds = new Set(displayedProductsList.map((p) => p.id));
    return reviews.filter((r) => productIds.has(r.productId));
  }, [reviews, displayedProductsList]);

  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
    addToast(
      'success',
      isFollowing ? 'Unfollowed Store' : 'Following Store!',
      isFollowing
        ? `You will no longer receive new arrival alerts from ${seller.storeName || seller.name}`
        : `You will now receive flash sale alerts and exclusive vouchers from ${seller.storeName || seller.name}`
    );
  };

  const handleShareStore = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast('success', 'Store Link Copied!', `Link to ${seller.storeName || seller.name}'s official storefront copied.`);
  };

  const handleContactSeller = () => {
    openSupportTicket();
    addToast('info', 'Connecting to Merchant Support', `Connecting you with ${seller.storeName || seller.name} customer service.`);
  };

  const storeVouchers = [
    {
      code: 'STORE20',
      discount: '20% OFF',
      minSpend: 25000,
      description: '20% Off orders above ₦25,000 in this merchant storefront',
    },
    {
      code: 'FLASH5K',
      discount: '₦5,000 OFF',
      minSpend: 50000,
      description: '₦5,000 instant reduction on flagship electronics & gadgets',
    },
  ];

  return (
    <div id="seller-storefront-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCustomerTab('shop')}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Marketplace
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Verified Merchants</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {seller.storeName || seller.name}
            </span>
          </div>
          <button
            onClick={() => setActiveCustomerTab('shop')}
            className="text-amber-600 hover:text-amber-700 font-bold"
          >
            ← Back to All Products
          </button>
        </div>

        {/* Storefront Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800">
          {/* Cover Background */}
          <div
            className="h-44 sm:h-56 w-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${
                seller.storeBanner ||
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80'
              })`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          </div>

          {/* Store Profile Info */}
          <div className="relative px-6 sm:px-8 pb-6 sm:pb-8 pt-0 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative">
                <img
                  src={
                    seller.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={seller.storeName || seller.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl bg-white"
                />
                <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow" title="Verified Merchant">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                    {seller.storeName || `${seller.name}'s Official Store`}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Official Brand Store
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-2">
                  {seller.storeBio ||
                    'Premium certified marketplace seller providing top-tier genuine electronics, fashion, lifestyle goods with 100% authentic guarantee and fast express shipping across Nigeria.'}
                </p>

                {/* Metrics Badges */}
                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 / 5.0 (2,450+ Ratings)
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Users className="w-4 h-4 text-indigo-400" /> {(seller.followerCount || 14200) + (isFollowing ? 1 : 0)} Followers
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Package className="w-4 h-4 text-emerald-400" /> {displayedProductsList.length} Products
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-sky-400" /> 99.4% Positive Feedback
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow transition-all active:scale-95 flex items-center gap-2 ${
                  isFollowing
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-white' : ''}`} />
                {isFollowing ? 'Following Store' : 'Follow Store'}
              </button>

              <button
                onClick={handleContactSeller}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 shadow transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Seller
              </button>

              <button
                onClick={handleShareStore}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shadow transition-all"
                title="Share Store Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Store Guarantees Bar */}
          <div className="bg-slate-950/80 px-6 sm:px-8 py-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Genuine Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fast 24–48hr Express Doorstep Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-400 shrink-0" />
              <span>7-Day Hassle-Free Returns & Full Refund</span>
            </div>
          </div>
        </div>

        {/* Store Promotional Coupons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeVouchers.map((v) => (
            <div
              key={v.code}
              className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 dark:from-amber-950/30 dark:to-orange-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{v.discount}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                      {v.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{v.description}</p>
                </div>
              </div>
              <button
                onClick={() => applyCoupon(v.code)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95"
              >
                Claim Coupon
              </button>
            </div>
          ))}
        </div>

        {/* Store Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: 'products', label: 'All Products', count: displayedProductsList.length },
              { id: 'deals', label: 'Flash Deals & Discounts', icon: Flame },
              { id: 'bestsellers', label: 'Best Sellers', icon: Sparkles },
              { id: 'reviews', label: `Customer Reviews (${sellerReviews.length})` },
            ].map((tab) => {
              const isActive = storeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStoreTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {tab.label}
                  {tab.count !== undefined && <span className="text-[11px] opacity-80">({tab.count})</span>}
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search this store..."
                value={storeSearchQuery}
                onChange={(e) => setStoreSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Store Category Pills */}
        {storeTab !== 'reviews' && storeCategories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {storeCategories.map((cat) => {
              const isSelected = storeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setStoreCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  {cat === 'all' ? 'All Store Categories' : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Area: Products Grid OR Reviews View */}
        {storeTab === 'reviews' ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Ratings for {seller.storeName || seller.name}
            </h2>
            {sellerReviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sellerReviews.map((r) => (
                  <div key={r.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{r.userName}</span>
                        {r.verifiedPurchase && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>
                    {r.sellerReply && (
                      <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 border-l-2 border-amber-500">
                        <span className="font-bold text-slate-900 dark:text-white">Seller Response ({r.sellerReply.sellerName}):</span>
                        <p className="text-slate-500 dark:text-slate-400">{r.sellerReply.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs sm:text-sm">
                No individual reviews logged yet for this specific seller. High 99.4% aggregate store reputation verified by platform escrow.
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">No Products Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or choosing another category.</p>
                <button
                  onClick={() => {
                    setStoreSearchQuery('');
                    setStoreCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
