import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Zap, ShoppingCart, Eye, Heart, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export const FlashDeals: React.FC = () => {
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    viewProductDetail,
    formatPrice,
  } = useStore();

  const flashDealProducts = products.filter((p) => p.isFlashDeal);

  if (flashDealProducts.length === 0) return null;

  return (
    <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Flash Deals</h2>
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md animate-pulse">
                LIMITED STOCK
              </span>
            </div>
            <p className="text-xs text-slate-600">Exclusive limited-time price drops from top sellers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {flashDealProducts.map((prod) => {
          const isFavorited = isInWishlist(prod.id);
          const claimed = prod.claimedPercentage || 65;

          return (
            <motion.div
              key={prod.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => viewProductDetail(prod)}
                  className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3 group cursor-pointer"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {prod.discountPercentage && (
                    <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
                      -{prod.discountPercentage}%
                    </span>
                  )}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      id={`flash-wishlist-${prod.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-colors cursor-pointer ${
                        isFavorited ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      id={`flash-quickview-${prod.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(prod);
                      }}
                      className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-xl backdrop-blur-md shadow-sm transition-colors cursor-pointer"
                      aria-label="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {prod.brand} • {prod.category}
                  </span>
                  <h3
                    onClick={() => viewProductDetail(prod)}
                    className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {prod.title}
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-lg font-black text-slate-900">{formatPrice(prod.price)}</span>
                    {prod.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(prod.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Claimed progress bar & Add to cart button */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                    <span>Claimed: <strong>{claimed}%</strong></span>
                    <span className="text-amber-600 font-bold">Only {prod.stock} left!</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${claimed}%` }}
                    />
                  </div>
                </div>

                <button
                  id={`flash-add-cart-${prod.id}`}
                  onClick={() => addToCart(prod, 1)}
                  disabled={prod.stock <= 0}
                  className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{prod.stock > 0 ? 'Claim Deal' : 'Sold Out'}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
