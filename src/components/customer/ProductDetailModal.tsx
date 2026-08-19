import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductDetailModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    viewProductDetail,
    addToCart,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    formatPrice,
    setIsCheckoutOpen,
    currentUser,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Review Form State
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isFavorited = isInWishlist(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;
    addReview(product.id, reviewRating, reviewTitle, reviewComment);
    setReviewTitle('');
    setReviewComment('');
    setIsReviewFormOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          id="product-detail-modal"
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Close Bar */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-100 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>{product.category}</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">{product.brand}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="modal-open-full-page-btn"
                onClick={() => viewProductDetail(product)}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Full Page View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                id="close-product-detail-btn"
                onClick={() => setQuickViewProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner">
                  <img
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {product.discountPercentage && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Perks Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Free 2-day delivery on orders over $75</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>30-Day Money-Back Guarantee with free returns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                    <span>1-Year Official Manufacturer Warranty Included</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Information, Variants & Actions */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {product.title}
                  </h1>

                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.discountPercentage && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        Save {formatPrice((product.originalPrice || 0) - product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    {product.variants.map((v) => (
                      <div key={v.name} className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {v.name}: <span className="font-normal text-slate-600">{selectedVariants[v.name] || v.options[0]}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {v.options.map((opt) => {
                            const isSelected = (selectedVariants[v.name] || v.options[0]) === opt;
                            return (
                              <button
                                key={opt}
                                id={`variant-${v.name}-${opt}`}
                                onClick={() => handleVariantSelect(v.name, opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity & Stock Status */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      id="qty-decrement-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      id="qty-increment-btn"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        product.stock > 10
                          ? 'text-emerald-600'
                          : product.stock > 0
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Currently Out of Stock'}
                    </span>
                    <span className="text-[10px] text-slate-400">Sold by {product.sellerName}</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    id="modal-buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Instant Checkout</span>
                  </button>

                  <button
                    id="modal-wishlist-toggle-btn"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      isFavorited
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <span className="font-semibold text-slate-500">{k}</span>
                      <span className="font-bold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews Section */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Verified Customer Reviews ({productReviews.length})
                  </h3>
                  <p className="text-xs text-slate-500">Real feedback from verified purchasers</p>
                </div>

                <button
                  id="toggle-write-review-btn"
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isReviewFormOpen ? 'Cancel' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Review Submission Form */}
              {isReviewFormOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleReviewSubmit}
                  className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3"
                >
                  <span className="text-xs font-bold text-indigo-900 block">Rate this product:</span>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        id={`star-select-${star}`}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating} out of 5</span>
                  </div>

                  <div>
                    <input
                      id="review-headline-input"
                      type="text"
                      placeholder="Headline summary (e.g. Incredible audio quality!)"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                    />
                  </div>

                  <div>
                    <textarea
                      id="review-comment-input"
                      rows={3}
                      placeholder="Share your hands-on experience, fit, finish, or battery performance..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-review-btn"
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {productReviews.length > 0 ? (
                  productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] text-emerald-600 font-semibold ml-1.5">
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-400 text-[11px]">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <strong className="text-slate-900 ml-1.5">{rev.title}</strong>
                      </div>

                      <p className="text-slate-600 leading-relaxed">{rev.comment}</p>

                      {/* Official Seller Reply if present */}
                      {rev.sellerReply && (
                        <div className="mt-2.5 p-3 rounded-lg bg-indigo-50/80 border border-indigo-100 text-slate-700">
                          <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                            <Store className="w-3.5 h-3.5" />
                            <span>Response from {rev.sellerReply.sellerName}</span>
                            <span className="text-slate-400 font-normal text-[10px]">
                              • {rev.sellerReply.date}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{rev.sellerReply.message}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">
                    No reviews yet for this product. Be the first to leave a review!
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
