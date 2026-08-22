import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Sparkles,
  Tag,
  Check,
  Copy,
  Gift,
  Flame,
  ShoppingBag,
  Percent,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SeasonalEventModal: React.FC = () => {
  const {
    selectedSeasonalEvent,
    isSeasonalEventModalOpen,
    setIsSeasonalEventModalOpen,
    activateSeasonalEventDiscount,
    appliedCoupon,
    products,
    formatPrice,
    addToCart,
    viewProductDetail,
    setIsCartOpen,
    setActiveCustomerTab,
  } = useStore();

  const [copied, setCopied] = useState(false);

  if (!isSeasonalEventModalOpen || !selectedSeasonalEvent) return null;

  const event = selectedSeasonalEvent;
  const isApplied = appliedCoupon?.code === event.couponCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(event.couponCode);
    setCopied(true);
    activateSeasonalEventDiscount(event);
    setTimeout(() => setCopied(false), 3000);
  };

  const curatedProducts = products.filter((p) => event.curatedProductIds.includes(p.id)).slice(0, 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8"
        >
          {/* Close button */}
          <button
            onClick={() => setIsSeasonalEventModalOpen(false)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Hero */}
          <div className="relative h-52 bg-slate-900 overflow-hidden">
            <img
              src={event.bannerImage}
              alt={event.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-md uppercase tracking-wider inline-block mb-1.5">
                  🎉 {event.discountPercent}% OFF CELEBRATION
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{event.name}</h3>
                <p className="text-xs text-amber-300 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {event.exactDateInfo} ({event.dateRange})
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] text-slate-300 uppercase block font-bold">Guaranteed Discount</span>
                <span className="text-xl font-black text-amber-400 font-mono">20% OFF</span>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.description}
            </p>

            {/* Coupon Box */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-dashed border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 tracking-wider">
                    Official Event Voucher
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-wider">
                    {event.couponCode}
                  </div>
                  <span className="text-xs text-emerald-600 font-bold">
                    ✓ Flat 20% discount on all items in cart
                  </span>
                </div>
              </div>

              <button
                id="btn-modal-apply-coupon"
                onClick={handleCopy}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied || isApplied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>20% Applied to Cart!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Apply 20% Coupon</span>
                  </>
                )}
              </button>
            </div>

            {/* Event Highlights & Benefits */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Exclusive Event Perks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.highlightPerks.map((perk, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curated Product Samples */}
            {curatedProducts.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Featured Event Picks (20% Savings Calculated)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {curatedProducts.map((p) => {
                    const discountedPrice = Math.floor(p.price * 0.8);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSeasonalEventModalOpen(false);
                          viewProductDetail(p);
                        }}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-all cursor-pointer text-center group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-1.5 bg-slate-200 dark:bg-slate-700">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {p.title}
                        </p>
                        <p className="text-xs font-black text-orange-600 dark:text-orange-400">
                          {formatPrice(discountedPrice)}
                        </p>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer action bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsSeasonalEventModalOpen(false);
                  setActiveCustomerTab('seasonal-events');
                }}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Full 14 Seasonal Events Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  activateSeasonalEventDiscount(event);
                  setIsSeasonalEventModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Go to Cart with 20% OFF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
