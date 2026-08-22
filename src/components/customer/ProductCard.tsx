import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, ShoppingCart, Heart, Eye, Zap, Truck, Flame, Crown, Swords } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    viewProductDetail,
    formatPrice,
    openOneClickBuyModal,
    slashPrice,
    isNovaPrime,
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const soldCount = Math.max(120, (product.reviewCount || 10) * 8 + (product.stock % 50));

  if (viewMode === 'list') {
    return (
      <div
        id={`product-card-${product.id}`}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-center"
      >
        <div
          onClick={() => viewProductDetail(product)}
          className="relative w-full sm:w-44 h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer group"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {product.discountPercentage && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
              -{product.discountPercentage}% OFF
            </span>
          )}
          {product.isFlashDeal && (
            <span className="absolute bottom-2 left-2 bg-yellow-400 text-orange-950 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <Zap className="w-2.5 h-2.5 fill-orange-700 text-orange-700" />
              <span>LIGHTNING</span>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{product.category}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Truck className="w-3 h-3" /> Free Shipping
            </span>
          </div>

          <h3
            onClick={() => viewProductDetail(product)}
            className="text-base font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {soldCount > 1000 ? `${(soldCount / 1000).toFixed(1)}k+ sold` : `${soldCount} sold`}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Sold by <strong className="text-slate-700 dark:text-slate-300">{product.sellerName}</strong>
            </span>
          </div>
        </div>

        <div className="sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-44 shrink-0 gap-3">
          <div className="text-left sm:text-right">
            <div className="text-xl font-black text-orange-600 dark:text-orange-400">{formatPrice(product.price)}</div>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <p className={`text-[11px] font-bold mt-0.5 ${product.stock > 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {product.stock > 0 ? (product.stock <= 5 ? `🔥 Almost Sold Out: ${product.stock} left` : 'In Stock') : 'Out of Stock'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`wishlist-btn-list-${product.id}`}
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              id={`add-cart-btn-list-${product.id}`}
              onClick={() => addToCart(product, 1)}
              disabled={product.stock <= 0}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-600/20 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-lg dark:hover:border-orange-500/40 hover:border-orange-200 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Product Image Container */}
        <div
          onClick={() => viewProductDetail(product)}
          className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 group/img cursor-pointer"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          {/* CartNova Discount & Promo Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discountPercentage && (
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                -{product.discountPercentage}%
              </span>
            )}
            {product.isFlashDeal && (
              <span className="bg-yellow-400 text-orange-950 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                <Zap className="w-2.5 h-2.5 fill-orange-700 text-orange-700" />
                <span>LIGHTNING</span>
              </span>
            )}
            {product.isFeatured && !product.isFlashDeal && (
              <span className="bg-slate-900 text-yellow-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                TOP 1
              </span>
            )}
          </div>

          {/* Action Overlay Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
            <button
              id={`wishlist-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-colors cursor-pointer ${
                isFavorited ? 'bg-rose-500 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
            </button>
            <button
              id={`quickview-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl backdrop-blur-md shadow-sm transition-colors cursor-pointer"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Urgency Stock Ribbon */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-black py-0.5 px-2 rounded-md text-center flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-yellow-300" />
              <span>Only {product.stock} left at this price!</span>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-black">
              SOLD OUT
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[10px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3
            onClick={() => viewProductDetail(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer pt-0.5"
            title={product.title}
          >
            {product.title}
          </h3>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>{soldCount > 1000 ? `${(soldCount / 1000).toFixed(1)}k+ sold` : `${soldCount} sold`}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free Shipping</span>
          </div>
        </div>
      </div>

      {/* Pricing & Quick Actions */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-400">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 text-yellow-300" />
              <span>PRIME</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            id={`add-cart-card-${product.id}`}
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-orange-500" />
            <span>Add</span>
          </button>

          <button
            id={`oneclick-buy-card-${product.id}`}
            onClick={() => openOneClickBuyModal(product, 1)}
            disabled={product.stock <= 0}
            className="p-1.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            title="1-Click Instant Buy"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>1-Click</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
