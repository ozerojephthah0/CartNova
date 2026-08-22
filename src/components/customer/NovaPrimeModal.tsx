import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Crown,
  Truck,
  Percent,
  Sparkles,
  ShieldCheck,
  Zap,
  Check,
  ArrowRight,
  Gift,
  Film,
  Gamepad2,
  BadgeCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const NovaPrimeModal: React.FC = () => {
  const {
    isNovaPrime,
    setIsNovaPrime,
    isNovaPrimeModalOpen,
    setIsNovaPrimeModalOpen,
    formatPrice,
    addToast,
  } = useStore();

  const handleTogglePrime = () => {
    if (!isNovaPrime) {
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#3b82f6', '#ffd700', '#6366f1'],
        });
      } catch {}
      setIsNovaPrime(true);
      addToast('success', '👑 Welcome to CartNova Prime!', 'Free 1-Day Express Shipping & 15% Member Discounts are now unlocked.');
    } else {
      setIsNovaPrime(false);
      addToast('info', 'Prime Membership Paused', 'You can reactivate your trial anytime.');
    }
  };

  if (!isNovaPrimeModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-blue-200 dark:border-blue-500/20 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 uppercase tracking-wider mb-2 border border-white/10">
                  <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  CartNova Prime+ Membership Hub
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Fast, Free Delivery & Exclusive Perks
                </h2>
                <p className="text-sky-100 text-sm mt-1 max-w-md">
                  Everything you love about Amazon Prime, tailor-made for CartNova shoppers with zero commitments.
                </p>
              </div>
              <button
                onClick={() => setIsNovaPrimeModalOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Perks Grid */}
          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">FREE 1-Day & Same-Day Shipping</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    No minimum order value required. Fast prioritized dispatch from local fulfillment hubs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">15% Prime Exclusive Discounts</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Save extra on over 50,000 Prime-badged electronics, fashion, and lifestyle items.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">30-Min Early Access to Lightning Deals</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Grab flash bargains and mystery crates 30 minutes before standard public release.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">90-Day Free Return Guarantee</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Free doorstep pickup for returns with instant refund back to your payment card.
                  </p>
                </div>
              </div>
            </div>

            {/* Trial Banner & Status */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <BadgeCheck className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-sm">30-Day Free Trial Available</span>
                </div>
                <p className="text-xs text-sky-200">
                  Status: <span className="font-extrabold text-yellow-300">{isNovaPrime ? 'ACTIVE (Prime Member 👑)' : 'INACTIVE'}</span>
                </p>
              </div>

              <button
                onClick={handleTogglePrime}
                className={`py-3.5 px-6 rounded-xl font-black text-sm transition-all transform active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer ${
                  isNovaPrime
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 shadow-yellow-400/25'
                }`}
              >
                {isNovaPrime ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel / Pause Trial</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>Activate 30-Day Free Trial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
