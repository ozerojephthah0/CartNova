import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Search,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Star,
  Eye,
  Share2,
  Check,
  Tag,
  ArrowUpDown,
  DollarSign,
  TrendingDown,
  PackageCheck,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WishlistView: React.FC = () => {
  const {
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    formatPrice,
    setQuickViewProduct,
    viewProductDetail,
    setActiveCustomerTab,
    addToast,
  } = useStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'on_sale'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high' | 'rating' | 'discount'>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // All wishlisted products
  const wishlistedProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Categories present in the user's wishlist
  const availableCategories = useMemo(() => {
    const cats = new Set(wishlistedProducts.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [wishlistedProducts]);

  // Filtered and sorted wishlist items
  const filteredProducts = useMemo(() => {
    let result = wishlistedProducts.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === 'in_stock' && p.stock <= 0) {
        return false;
      }
      if (availabilityFilter === 'on_sale' && (!p.originalPrice || p.originalPrice <= p.price)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchSeller = (p.sellerName || '').toLowerCase().includes(q);
        return matchTitle || matchBrand || matchSeller;
      }
      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') {
        const discA = a.discountPercentage || (a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0);
        const discB = b.discountPercentage || (b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0);
        return discB - discA;
      }
      // Default recent
      return wishlist.indexOf(b.id) - wishlist.indexOf(a.id);
    });

    return result;
  }, [wishlistedProducts, selectedCategory, availabilityFilter, searchQuery, sortBy, wishlist]);

  // Financial calculations
  const totalValue = useMemo(() => {
    return wishlistedProducts.reduce((sum, p) => sum + p.price, 0);
  }, [wishlistedProducts]);

  const totalSavings = useMemo(() => {
    return wishlistedProducts.reduce((sum, p) => {
      if (p.originalPrice && p.originalPrice > p.price) {
        return sum + (p.originalPrice - p.price);
      }
      return sum;
    }, 0);
  }, [wishlistedProducts]);

  const inStockCount = useMemo(() => {
    return wishlistedProducts.filter((p) => p.stock > 0).length;
  }, [wishlistedProducts]);

  // Selection handlers
  const handleToggleSelect = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  // Bulk actions
  const handleMoveSelectedToCart = () => {
    const selectedProds = wishlistedProducts.filter((p) => selectedIds.includes(p.id) && p.stock > 0);
    if (selectedProds.length === 0) {
      addToast('info', 'No In-Stock Items Selected', 'Please select available items to move to cart');
      return;
    }

    selectedProds.forEach((p) => {
      addToCart(p, 1);
    });

    addToast('success', 'Moved to Cart', `Added ${selectedProds.length} item(s) to your shopping cart`);
    setSelectedIds([]);
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      toggleWishlist(id);
    });
    setSelectedIds([]);
  };

  const handleAddAllInStockToCart = () => {
    const inStock = wishlistedProducts.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      addToast('info', 'No In-Stock Items', 'None of your wishlisted items are currently in stock');
      return;
    }
    inStock.forEach((p) => addToCart(p, 1));
    addToast('success', 'All Items Added', `Added ${inStock.length} in-stock item(s) to your shopping cart`);
  };

  const handleShareProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#product-${product.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(product.id);
    addToast('success', 'Link Copied', `Product link for "${product.title}" copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const recommendedProducts = products.filter((p) => !wishlist.includes(p.id)).slice(0, 4);

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Title & Top CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Wishlist & Favorites</h1>
            <span className="px-3 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track price drops, bookmark favorite products, and move multiple items to your cart with one click.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          {wishlistedProducts.length > 0 && inStockCount > 0 && (
            <button
              id="add-all-wishlist-cart-btn"
              onClick={handleAddAllInStockToCart}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All In-Stock to Cart ({inStockCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveCustomerTab('shop')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <span>Browse Catalog</span>
          </button>
        </div>
      </div>

      {/* 2. Wishlist Financial & Availability Overview Cards */}
      {wishlistedProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Saved Items</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">{wishlistedProducts.length}</div>
            <span className="text-[10px] text-slate-500 font-medium">Bookmarked products</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Availability</span>
              <PackageCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {inStockCount} <span className="text-xs text-slate-400 font-normal">/ {wishlistedProducts.length} ready</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Ready for immediate checkout</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Estimated Total</span>
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono truncate">
              {formatPrice(totalValue)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Current cart value</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Price Drop Savings</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-base sm:text-lg font-black text-rose-600 font-mono truncate">
              {totalSavings > 0 ? `-${formatPrice(totalSavings)}` : '$0.00'}
            </div>
            <span className="text-[10px] text-rose-500 font-medium">Discounts & promotions</span>
          </div>
        </div>
      )}

      {/* 3. Search, Filter, Sort & Bulk Selection Toolbar */}
      {wishlistedProducts.length > 0 && (
        <div className="space-y-3 p-3.5 bg-slate-100/90 rounded-2xl border border-slate-200">
          {/* Category Filter Pills & Availability Tabs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Category Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-slate-200/60'
                  }`}
                >
                  {cat === 'all' ? `All Categories (${wishlistedProducts.length})` : cat}
                </button>
              ))}
            </div>

            {/* Availability Filter Tabs */}
            <div className="flex items-center gap-1 self-start lg:self-auto bg-white/80 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAvailabilityFilter('in_stock')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'in_stock' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Stock ({inStockCount})
              </button>
              <button
                onClick={() => setAvailabilityFilter('on_sale')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'on_sale' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                On Sale
              </button>
            </div>
          </div>

          {/* Search, Sort & Bulk Select Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200/70 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-wishlist-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wishlist by name, brand, or seller..."
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-[11px] hidden sm:inline">Sort:</span>
                <select
                  id="sort-wishlist-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-indigo-500 cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Selection Bar (When products match) */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/70 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-semibold cursor-pointer select-none"
                >
                  {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>
                    Select All ({selectedIds.length}/{filteredProducts.length})
                  </span>
                </button>
              </div>

              {/* Bulk Action Buttons */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 self-end sm:self-auto animate-in fade-in duration-200">
                  <button
                    onClick={handleMoveSelectedToCart}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move Selected to Cart ({selectedIds.length})</span>
                  </button>

                  <button
                    onClick={handleRemoveSelected}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Selected</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Wishlist Items Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            const inStock = product.stock > 0;
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;

            return (
              <motion.div
                key={product.id}
                id={`wishlist-card-${product.id}`}
                layout
                whileHover={{ y: -4 }}
                className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between relative shadow-2xs ${
                  isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Image Container */}
                  <div
                    onClick={() => viewProductDetail(product)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3 cursor-pointer group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Checkbox Selector Badge */}
                    <button
                      id={`select-wishlist-item-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(product.id);
                      }}
                      className="absolute top-2.5 left-2.5 p-1 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-white shadow-xs cursor-pointer z-10"
                      title={isSelected ? 'Deselect item' : 'Select item'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {/* Badges Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {product.discountPercentage ? (
                        <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs self-start">
                          -{product.discountPercentage}% OFF
                        </span>
                      ) : hasDiscount ? (
                        <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs self-start">
                          SALE
                        </span>
                      ) : null}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs self-start ${
                          inStock
                            ? product.stock <= 5
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {inStock ? (product.stock <= 5 ? `Only ${product.stock} Left` : 'In Stock') : 'Sold Out'}
                      </span>
                    </div>

                    {/* Action Corner: Quick View & Remove Heart */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-600 hover:text-indigo-600 shadow-xs cursor-pointer transition-colors"
                        title="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`remove-wishlist-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-rose-600 shadow-xs cursor-pointer transition-colors"
                        aria-label="Remove from Wishlist"
                        title="Remove from favorites"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      </button>
                    </div>
                  </div>

                  {/* Product Details Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => viewProductDetail(product)}
                      className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {product.sellerName && (
                      <p className="text-[11px] text-slate-400">
                        Sold by <strong className="text-slate-600">{product.sellerName}</strong>
                      </p>
                    )}

                    {/* Price & Savings */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    id={`wishlist-add-cart-${product.id}`}
                    onClick={() => {
                      if (product.stock > 0) {
                        addToCart(product, 1);
                      }
                    }}
                    disabled={!inStock}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{inStock ? 'Add to Cart' : 'Sold Out'}</span>
                  </button>

                  <button
                    onClick={(e) => handleShareProduct(product, e)}
                    className="p-2.5 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-colors cursor-pointer"
                    title="Share item link"
                  >
                    {copiedId === product.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : wishlistedProducts.length > 0 ? (
        /* Filter/Search produced 0 matches */
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching items in your wishlist</h3>
          <p className="text-xs text-slate-500">
            No saved products matched your search or category filter. Try clearing the filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setAvailabilityFilter('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Empty Wishlist State + Recommended Catalog Showcase */
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-2xs">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Your wishlist is currently empty</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Explore our marketplace catalog and click the heart icon on items you love to save them for later or watch for price discounts.
            </p>
            <button
              onClick={() => setActiveCustomerTab('shop')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              Start Exploring Products
            </button>
          </div>

          {/* Trending Recommendations */}
          {recommendedProducts.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Popular Items You Might Like</span>
                  </h3>
                  <p className="text-xs text-slate-500">Top-rated customer favorites ready to add to your wishlist</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div
                        onClick={() => viewProductDetail(p)}
                        className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5 cursor-pointer"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-xs cursor-pointer"
                          title="Save to favorites"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{p.brand}</span>
                      <h4
                        onClick={() => viewProductDetail(p)}
                        className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 cursor-pointer mt-0.5"
                      >
                        {p.title}
                      </h4>
                      <div className="text-xs font-black text-slate-900 font-mono mt-1">{formatPrice(p.price)}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Add to Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
