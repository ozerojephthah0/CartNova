import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, ShoppingCart, Heart, Eye, Check } from 'lucide-react';
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
  } = useStore();

  const isFavorited = isInWishlist(product.id);

  if (viewMode === 'list') {
    return (
      <div
        id={`product-card-${product.id}`}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-center"
      >
        <div
          onClick={() => viewProductDetail(product)}
          className="relative w-full sm:w-44 h-40 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer group"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {product.discountPercentage && (
            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{product.category}</span>
          </div>

          <h3
            onClick={() => viewProductDetail(product)}
            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              Sold by <strong className="text-slate-700">{product.sellerName}</strong>
            </span>
          </div>
        </div>

        <div className="sm:border-l sm:border-slate-100 sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-44 shrink-0 gap-3">
          <div className="text-left sm:text-right">
            <div className="text-lg font-black text-slate-900">{formatPrice(product.price)}</div>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <p className={`text-[11px] font-medium mt-0.5 ${product.stock > 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock') : 'Out of Stock'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`wishlist-btn-list-${product.id}`}
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              id={`add-cart-btn-list-${product.id}`}
              onClick={() => addToCart(product, 1)}
              disabled={product.stock <= 0}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
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
      className="group bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
    >
      <div>
        {/* Product Image Container */}
        <div
          onClick={() => viewProductDetail(product)}
          className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3 group/img cursor-pointer"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discountPercentage && (
              <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                -{product.discountPercentage}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                FEATURED
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
                isFavorited ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'
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
              className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-xl backdrop-blur-md shadow-sm transition-colors cursor-pointer"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Stock Ribbon */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2 rounded-md text-center">
              Only {product.stock} units remaining
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
              SOLD OUT
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3
            onClick={() => viewProductDetail(product)}
            className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer pt-0.5"
            title={product.title}
          >
            {product.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1">
            {product.shortDescription || product.category}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
            {product.sellerName}
          </span>
        </div>

        <button
          id={`add-cart-card-${product.id}`}
          onClick={() => addToCart(product, 1)}
          disabled={product.stock <= 0}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          aria-label={`Add ${product.title} to cart`}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
