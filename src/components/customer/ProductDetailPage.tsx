import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Review } from '../../types';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
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
  Package,
  Layers,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ThumbsUp,
  Info,
  Search,
  Camera,
  X,
  Maximize2,
  Tag,
  HelpCircle,
  FileText,
  Box,
  CreditCard,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';
import { RecentlyViewedAndRecommended } from './RecentlyViewedAndRecommended';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProductId,
    products,
    setActiveCustomerTab,
    viewProductDetail,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    voteHelpfulReview,
    formatPrice,
    setIsCheckoutOpen,
    setIsAiAssistantOpen,
    addToast,
    setSelectedCategory,
    setFilters,
    currentUser,
    addToRecentlyViewed,
  } = useStore();

  // Find the selected product or fallback to the first product
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  // Gallery & Image States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Variant & Purchasing States
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'shipping' | 'qa'>('description');

  // Review System & Filtering States
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewQualityRating, setReviewQualityRating] = useState(5);
  const [reviewValueRating, setReviewValueRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImageUrls, setReviewImageUrls] = useState<string[]>([]);
  const [reviewInputImg, setReviewInputImg] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all' | 'photos' | 'verified'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSortBy, setReviewSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('helpful');
  const [activeReviewPhotoModal, setActiveReviewPhotoModal] = useState<string | null>(null);

  // Interactive AI Q&A State
  const [customQuestion, setCustomQuestion] = useState('');
  const [qaList, setQaList] = useState<Array<{ question: string; answer: string; date: string }>>([
    {
      question: 'Is this item authentic and covered by the manufacturer warranty?',
      answer: 'Yes! All items sold by official vendors on CartNova are 100% authentic and include an official 1-year hardware & parts warranty with 30-day returns.',
      date: 'Aug 12, 2026',
    },
    {
      question: 'What is the estimated delivery timeframe?',
      answer: 'Standard dispatch occurs within 24 hours. Express tracked delivery arrives in 2 to 3 business days with real-time tracking.',
      date: 'Aug 14, 2026',
    },
  ]);

  // Sync state on product change
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setIsReviewFormOpen(false);
    setIsLightboxOpen(false);
    setIsZoomed(false);
    setReviewSearchQuery('');
    setReviewRatingFilter('all');

    if (product?.variants && product.variants.length > 0) {
      const initial: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initial);
    } else {
      setSelectedVariants({});
    }

    if (product?.id) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id, addToRecentlyViewed]);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <Package className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are looking for is no longer available in the catalog.</p>
        <button
          onClick={() => setActiveCustomerTab('shop')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const allProductReviews = reviews.filter((r) => r.productId === product.id);

  // Collect all photos from product reviews
  const allCustomerPhotos = useMemo(() => {
    const photos: { url: string; userName: string; rating: number; title: string }[] = [];
    allProductReviews.forEach((rev) => {
      if (rev.images && rev.images.length > 0) {
        rev.images.forEach((img) => {
          photos.push({
            url: img,
            userName: rev.userName,
            rating: rev.rating,
            title: rev.title,
          });
        });
      }
    });
    return photos;
  }, [allProductReviews]);

  // Filter & Sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...allProductReviews];

    // Filter by rating or type
    if (reviewRatingFilter === 'photos') {
      list = list.filter((r) => r.images && r.images.length > 0);
    } else if (reviewRatingFilter === 'verified') {
      list = list.filter((r) => r.verifiedPurchase);
    } else if (typeof reviewRatingFilter === 'number') {
      list = list.filter((r) => Math.round(r.rating) === reviewRatingFilter);
    }

    // Search query filter
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (reviewSortBy === 'newest') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (reviewSortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (reviewSortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    } else if (reviewSortBy === 'helpful') {
      list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    return list;
  }, [allProductReviews, reviewRatingFilter, reviewSearchQuery, reviewSortBy]);

  // Rating distribution calculation
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allProductReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });
  const totalReviewsCount = allProductReviews.length;

  // Average sub-ratings
  const qualityAvg = 4.9;
  const valueAvg = 4.8;
  const shippingAvg = 4.9;

  // Volume Bulk Tier Calculations
  const bulkTier = quantity >= 5 ? 0.15 : quantity >= 3 ? 0.1 : quantity >= 2 ? 0.05 : 0;
  const unitPriceAfterBulk = product.price * (1 - bulkTier);
  const totalPriceCalculated = unitPriceAfterBulk * quantity;

  // Frequently bought together companion product
  const bundleCompanion =
    products.find((p) => p.id !== product.id && p.category === product.category) ||
    products.find((p) => p.id !== product.id);

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  // Estimated delivery dates
  const deliveryDateMin = new Date();
  deliveryDateMin.setDate(deliveryDateMin.getDate() + 2);
  const deliveryDateMax = new Date();
  deliveryDateMax.setDate(deliveryDateMax.getDate() + 4);
  const deliveryDateString = `${deliveryDateMin.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${deliveryDateMax.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const hasDiscount = Boolean(product.discountPercentage && product.discountPercentage > 0);
  const savingsAmount = product.originalPrice ? product.originalPrice - product.price : 0;

  // Handlers
  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
    // If selecting a color variant, optionally sync image
    if (variantName.toLowerCase().includes('color') && product.images.length > 1) {
      const idx = Math.abs(option.charCodeAt(0) + option.length) % product.images.length;
      setActiveImageIndex(idx);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    setIsCheckoutOpen(true);
  };

  const handleShareProduct = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on CartNova!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      addToast('success', 'Link Copied', 'Product link copied to your clipboard');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    addReview(
      product.id,
      reviewRating,
      reviewTitle,
      reviewComment,
      reviewImageUrls.length > 0 ? reviewImageUrls : undefined,
      {
        quality: reviewQualityRating,
        value: reviewValueRating,
        shipping: 5,
      }
    );

    setReviewTitle('');
    setReviewComment('');
    setReviewImageUrls([]);
    setReviewInputImg('');
    setIsReviewFormOpen(false);
  };

  const handleAddSampleReviewPhoto = (url: string) => {
    if (!reviewImageUrls.includes(url)) {
      setReviewImageUrls((prev) => [...prev, url]);
    }
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const newQ = customQuestion.trim();
    setQaList((prev) => [
      {
        question: newQ,
        answer: `Great question regarding the ${product.title}! According to official specifications, it fully supports high-performance operation, certified premium components, and standard warranty coverage. For personalized assistance, contact ${product.sellerName}.`,
        date: 'Just now',
      },
      ...prev,
    ]);
    setCustomQuestion('');
    addToast('success', 'Question Answered', 'Nova AI concierges generated an answer for your inquiry');
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setFilters((prev) => ({ ...prev, category: cat }));
    setActiveCustomerTab('shop');
  };

  return (
    <div className="py-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumbs & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
          <button
            onClick={() => setActiveCustomerTab('shop')}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button
            onClick={() => handleCategoryClick(product.category)}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-700">{product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            id="product-detail-share-btn"
            onClick={handleShareProduct}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Share this product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            id="product-detail-wishlist-btn"
            onClick={() => toggleWishlist(product.id)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
            <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase & Buying Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md group">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.title}
              className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in group-hover:scale-105'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              referrerPolicy="no-referrer"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {hasDiscount && (
                <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>SAVE {product.discountPercentage}%</span>
                </span>
              )}
              {product.isFlashDeal && (
                <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>FLASH DEAL</span>
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  FEATURED
                </span>
              )}
            </div>

            {/* Top Right Action: Open Lightbox Modal */}
            <div className="absolute top-4 right-4 z-10">
              <button
                id="open-image-lightbox-btn"
                onClick={() => setIsLightboxOpen(true)}
                className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-xl backdrop-blur-md shadow-md transition-colors cursor-pointer"
                title="Fullscreen Image Gallery"
                aria-label="Fullscreen Image Gallery"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Next / Prev Image Chevrons on Hover */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Hint overlay */}
            <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              <span>{isZoomed ? 'Click to minimize' : 'Click to zoom in'}</span>
              <span className="text-slate-300">•</span>
              <span>Image {activeImageIndex + 1} of {product.images.length}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-slate-100 ${
                    activeImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-105'
                      : 'border-slate-200/80 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-1 bg-slate-900/60 text-white text-[9px] font-bold px-1 rounded">
                    #{idx + 1}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Customer Photos Bar Preview */}
          {allCustomerPhotos.length > 0 && (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>Real Customer Photos ({allCustomerPhotos.length})</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('reviews');
                    setReviewRatingFilter('photos');
                    const revElem = document.getElementById('product-tabs-section');
                    revElem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  View in Reviews
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allCustomerPhotos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveReviewPhotoModal(photo.url)}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 group/photo cursor-pointer hover:border-indigo-500 transition-all"
                  >
                    <img
                      src={photo.url}
                      alt="Customer review photo"
                      className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trust Guarantees Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-800">Free Express</span>
              <span className="text-[10px] text-slate-500">Orders over $50</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-800">30-Day Returns</span>
              <span className="text-[10px] text-slate-500">Hassle-free guarantee</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-800">1-Yr Warranty</span>
              <span className="text-[10px] text-slate-500">Official protection</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-800">100% Authentic</span>
              <span className="text-[10px] text-slate-500">Verified boutique</span>
            </div>
          </div>
        </div>

        {/* Right Column: Buying Box & Specifications (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{product.category}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.slug.toUpperCase()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500 text-sm font-extrabold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  const revElem = document.getElementById('product-tabs-section');
                  revElem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors cursor-pointer"
              >
                {allProductReviews.length} customer ratings & reviews
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Merchant
              </span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Pricing Box */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-baseline flex-wrap gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {formatPrice(unitPriceAfterBulk)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-slate-400 line-through font-medium">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-extrabold rounded-lg">
                  Save {formatPrice(savingsAmount)} ({product.discountPercentage}%)
                </span>
              )}
            </div>

            {/* Installment Payment Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80">
              <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Or <strong>4 interest-free payments</strong> of{' '}
                <span className="font-extrabold text-slate-900">{formatPrice(unitPriceAfterBulk / 4)}</span> with
                Klarna / CredPal
              </span>
            </div>

            {/* Volume Tier Discount Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                Volume Savings Deals:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(1)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    quantity === 1
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">1 Unit</span>
                  <span className="text-[10px] opacity-80">Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(2)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    quantity === 2
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">Buy 2</span>
                  <span className="text-[10px] font-semibold text-emerald-600">Save 5% Each</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(3)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    quantity >= 3
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">Buy 3+</span>
                  <span className="text-[10px] font-semibold text-emerald-600">Save 10% Each</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <span>Prices inclusive of all local sales taxes & duty</span>
              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Delivery by: <strong>{deliveryDateString}</strong>
              </span>
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div>
            {product.stock > 10 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock & Ready for Immediate Dispatch ({product.stock} units available)</span>
              </div>
            ) : product.stock > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/80">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Hurry! Only {product.stock} units remaining in stock</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Currently Out of Stock</span>
              </div>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-2">
              {product.variants.map((variant) => {
                const selectedOption = selectedVariants[variant.name] || variant.options[0];

                return (
                  <div key={variant.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 uppercase tracking-wider">
                        {variant.name}:
                      </span>
                      <span className="font-semibold text-indigo-600">{selectedOption}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => {
                        const isSelected = selectedOption === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleVariantSelect(variant.name, option)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30 scale-105'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity & Add to Cart Actions */}
          <div className="space-y-4 pt-3 border-t border-slate-200/80">
            <div className="flex items-center gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Quantity</label>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock <= 0}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock <= 0}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">&nbsp;</label>
                <button
                  id="product-detail-add-cart-btn"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart ({formatPrice(totalPriceCalculated)})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="product-detail-buy-now-btn"
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3 px-6 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Instant 1-Click Checkout</span>
              </button>

              <button
                id="product-detail-ai-ask-btn"
                type="button"
                onClick={() => setIsAiAssistantOpen(true)}
                className="py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Nova AI Concierge</span>
              </button>
            </div>
          </div>

          {/* Seller / Merchant Snapshot */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {product.sellerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{product.sellerName}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Official Store
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">99.4% Positive Seller Feedback • Dispatches in 24h</p>
              </div>
            </div>

            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, sellerId: product.sellerId }));
                setActiveCustomerTab('shop');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Store</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Frequently Bought Together Bundle */}
      <FrequentlyBoughtTogether currentProduct={product} />

      {/* 4. Tabbed Product Deep-Dive Section */}
      <div id="product-tabs-section" className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200/80 bg-slate-50/60 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'description'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Overview & Features</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-5 py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Specifications</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Ratings & Reviews ({allProductReviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-5 py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'qa'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Q&A & AI Concierge</span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-5 py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'shipping'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Shipping & Warranty</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: DESCRIPTION & FEATURES */}
          {activeTab === 'description' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Product Story & Design</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                  {product.description}
                </p>
              </div>

              {/* Key Bullet Features */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Engineered Capabilities & Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-800 block capitalize">{key}</strong>
                        <span className="text-xs text-slate-600">{val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's In The Box */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Box className="w-4 h-4 text-indigo-600" />
                  <span>Package Contents ("What's In The Box")</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1x {product.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Braided Quick-Charge Cable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Start & Setup Guide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official 1-Year Warranty Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Protective Eco-Transport Case</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-2">Tags:</span>
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-slate-900">Technical Details & Blueprint</h3>
              <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                <div className="grid grid-cols-3 p-3.5 bg-slate-50 text-xs">
                  <span className="font-bold text-slate-500">Brand</span>
                  <span className="col-span-2 font-bold text-slate-900">{product.brand}</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-white text-xs">
                  <span className="font-bold text-slate-500">Category</span>
                  <span className="col-span-2 text-slate-900">{product.category}</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-slate-50 text-xs">
                  <span className="font-bold text-slate-500">Model Identifier</span>
                  <span className="col-span-2 font-mono text-slate-900">{product.slug}</span>
                </div>
                {Object.entries(product.specs || {}).map(([key, val], index) => (
                  <div
                    key={key}
                    className={`grid grid-cols-3 p-3.5 text-xs ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-slate-500 capitalize">{key}</span>
                    <span className="col-span-2 text-slate-900">{val}</span>
                  </div>
                ))}
                <div className="grid grid-cols-3 p-3.5 bg-white text-xs">
                  <span className="font-bold text-slate-500">Stock Availability</span>
                  <span className="col-span-2 text-emerald-600 font-bold">{product.stock} units available</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-slate-50 text-xs">
                  <span className="font-bold text-slate-500">Merchant Boutique</span>
                  <span className="col-span-2 text-slate-900 font-semibold">{product.sellerName}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER RATINGS & REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating Overview Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-200/80">
                {/* Score Column */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200">
                  <span className="text-5xl font-black text-slate-900">{product.rating.toFixed(1)}</span>
                  <div className="flex items-center gap-1 text-amber-500 my-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Based on {totalReviewsCount} verified reviews
                  </span>
                  <span className="mt-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    98% of buyers recommend this product
                  </span>
                </div>

                {/* Rating Distribution Bar */}
                <div className="md:col-span-5 space-y-2 py-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
                    const percent = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;

                    return (
                      <div
                        key={star}
                        onClick={() => setReviewRatingFilter(star)}
                        className="flex items-center gap-2.5 text-xs cursor-pointer group/bar hover:bg-slate-100/60 p-1 rounded-lg transition-colors"
                      >
                        <span className="w-12 font-bold text-slate-600 group-hover/bar:text-indigo-600">{star} stars</span>
                        <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-500 font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Action Box */}
                <div className="md:col-span-3 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-slate-600 mb-3">Own this product? Share your experience with the community</p>
                  <button
                    id="open-review-form-btn"
                    onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isReviewFormOpen ? 'Close Form' : 'Write a Review'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Ratings Dimension Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between p-2">
                  <span className="text-xs font-semibold text-slate-600">Build Quality</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-900">{qualityAvg} / 5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border-t sm:border-t-0 sm:border-l border-slate-200">
                  <span className="text-xs font-semibold text-slate-600">Value for Money</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-900">{valueAvg} / 5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border-t sm:border-t-0 sm:border-l border-slate-200">
                  <span className="text-xs font-semibold text-slate-600">Shipping Speed</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-900">{shippingAvg} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Review Filters & Search Bar */}
              <div className="space-y-3 pb-2 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search reviews (e.g. battery, bass, fit)..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                    <select
                      value={reviewSortBy}
                      onChange={(e) => setReviewSortBy(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-indigo-600"
                    >
                      <option value="helpful">Most Helpful</option>
                      <option value="newest">Most Recent</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
                  <button
                    onClick={() => setReviewRatingFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      reviewRatingFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({allProductReviews.length})
                  </button>
                  <button
                    onClick={() => setReviewRatingFilter('photos')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      reviewRatingFilter === 'photos'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>With Photos ({allCustomerPhotos.length})</span>
                  </button>
                  <button
                    onClick={() => setReviewRatingFilter('verified')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      reviewRatingFilter === 'verified'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Verified Only
                  </button>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      onClick={() => setReviewRatingFilter(s)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        reviewRatingFilter === s
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{s}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>({ratingCounts[s as 1 | 2 | 3 | 4 | 5] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Add Review Form */}
              <AnimatePresence>
                {isReviewFormOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleReviewSubmit}
                    className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-4 overflow-hidden shadow-xs"
                  >
                    <h4 className="text-sm font-bold text-slate-900">Write a Verified Customer Review</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Overall Rating</label>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(i + 1)}
                              className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  i < reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Quality Rating (1-5)</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewQualityRating(s)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                                reviewQualityRating === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Value Rating (1-5)</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewValueRating(s)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                                reviewValueRating === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Headline / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Exceptional sound clarity and premium finish"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Review Experience</label>
                      <textarea
                        rows={4}
                        placeholder="Share details about ergonomics, performance, battery life, packaging, or sound..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                      />
                    </div>

                    {/* Add Photo URL */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Attach Customer Photos (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                          value={reviewInputImg}
                          onChange={(e) => setReviewInputImg(e.target.value)}
                          className="flex-1 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (reviewInputImg.trim()) {
                              setReviewImageUrls((prev) => [...prev, reviewInputImg.trim()]);
                              setReviewInputImg('');
                            }
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Attach
                        </button>
                      </div>

                      {/* Quick sample photo selector */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[11px] text-slate-500 font-medium">Or attach sample photo:</span>
                        {product.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddSampleReviewPhoto(img)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                          >
                            + Angle #{idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Attached photos list */}
                      {reviewImageUrls.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {reviewImageUrls.map((url, i) => (
                            <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                              <img src={url} alt="Attached" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReviewImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsReviewFormOpen(false)}
                        className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Post Verified Review
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Review Cards List */}
              <div className="space-y-4">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{rev.userName}</span>
                              {rev.verifiedPurchase && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                                  ✓ Verified Purchase
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-[11px]">{rev.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <h5 className="font-bold text-slate-900 text-sm">{rev.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                      {/* Customer Attached Photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.images.map((img, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setActiveReviewPhotoModal(img)}
                              className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-500 transition-all group/img"
                            >
                              <img
                                src={img}
                                alt="Customer review photo"
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span>Was this review helpful to you?</span>
                        <button
                          onClick={() => voteHelpfulReview(rev.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpfulCount || 0})</span>
                        </button>
                      </div>

                      {/* Official Seller Response */}
                      {rev.sellerReply && (
                        <div className="mt-3 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                            <Store className="w-3.5 h-3.5" />
                            <span>Response from Store: {rev.sellerReply.sellerName}</span>
                            <span className="text-slate-400 font-normal text-[10px]">• {rev.sellerReply.date}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{rev.sellerReply.message}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <Star className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      No reviews found matching "{reviewSearchQuery || reviewRatingFilter}".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Q&A & AI Concierge */}
          {activeTab === 'qa' && (
            <div className="space-y-6 max-w-4xl">
              <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <h4 className="text-base font-extrabold">Nova AI Product Concierge</h4>
                  </div>
                  <p className="text-xs text-indigo-100 max-w-xl">
                    Get instant technical assistance, compatibility checks, and product insights synthesized across specifications and real customer experiences.
                  </p>
                </div>
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-4 py-2.5 bg-white text-indigo-900 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                >
                  Open Live Chat
                </button>
              </div>

              {/* Ask Question Form */}
              <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about compatibility, battery, sizing, or warranty..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Ask AI
                </button>
              </form>

              {/* Q&A Thread List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Community & AI Verified Answers
                </h4>
                {qaList.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black">
                        Q:
                      </span>
                      <strong className="text-xs font-bold text-slate-900">{item.question}</strong>
                    </div>
                    <div className="flex items-start gap-2 pl-4 border-l-2 border-indigo-300">
                      <span className="text-[10px] font-black text-indigo-600">A:</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.answer}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 block pl-6">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SHIPPING & WARRANTY */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Truck className="w-4 h-4" />
                    <span>Worldwide Tracked Express Shipping</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All orders are securely packaged and dispatched within 24-48 business hours with end-to-end live tracking. Free express delivery applies automatically on qualified orders.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <RotateCcw className="w-4 h-4" />
                    <span>30-Day Money Back Guarantee</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If you are not completely thrilled with your purchase, initiate an easy return within 30 days of delivery for a full refund or replacement.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>1-Year Hardware & Parts Warranty</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Includes full coverage for manufacturing defects, internal components, and performance standards with dedicated merchant support.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Info className="w-4 h-4" />
                    <span>Customs & Import Duties Included</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No hidden charges at your doorstep. All customs duties, taxes, and import tariffs are already factored into checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Related Products, Recommendations & Recently Viewed */}
      <RecentlyViewedAndRecommended currentProductId={product.id} defaultTab="recommended" limit={8} />

      {/* 6. Sticky Mobile Purchase Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-10 h-10 rounded-lg object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <span className="text-xs font-black text-slate-900 block truncate">{formatPrice(unitPriceAfterBulk)}</span>
            <span className="text-[10px] text-slate-500 block truncate">{product.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2.5 rounded-xl border ${
              isFavorited ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 text-slate-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* 7. Interactive Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                  {product.brand}
                </span>
                <h3 className="text-sm font-bold truncate max-w-md">{product.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">
                  {activeImageIndex + 1} / {product.images.length}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 text-slate-300 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Image with Next/Prev Buttons */}
            <div
              className="relative flex-1 flex items-center justify-center max-h-[75vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[activeImageIndex]}
                alt={product.title}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                    }
                    className="absolute left-4 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-4 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === i ? 'border-indigo-500 scale-110' : 'border-slate-700 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Single Photo Enlargement Modal */}
      <AnimatePresence>
        {activeReviewPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveReviewPhotoModal(null)}
          >
            <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActiveReviewPhotoModal(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={activeReviewPhotoModal}
                alt="Enlarged review photo"
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
