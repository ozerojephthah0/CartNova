import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Gift,
  Zap,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface FreeGiftOption {
  id: string;
  name: string;
  image: string;
  retailValue: number;
  unlockedAt: number; // in NGN
}

const FREE_GIFT_OPTIONS: FreeGiftOption[] = [
  {
    id: 'gift-1',
    name: 'CartNova True Wireless Earbuds (Noise Cancelling)',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80',
    retailValue: 18500,
    unlockedAt: 30000,
  },
  {
    id: 'gift-2',
    name: 'Smart Magnetic Aluminum Phone Stand',
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=200&auto=format&fit=crop&q=80',
    retailValue: 9500,
    unlockedAt: 15000,
  },
  {
    id: 'gift-3',
    name: 'Braided 65W Fast Charging Multi-Cable',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&auto=format&fit=crop&q=80',
    retailValue: 7000,
    unlockedAt: 10000,
  },
];

export const TemuPriceSlashBar: React.FC<{ onOpenSpinWheel: () => void }> = ({ onOpenSpinWheel }) => {
  const { cartSubtotal, formatPrice, addToCart, addToast, products } = useStore();
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string>(FREE_GIFT_OPTIONS[0].id);

  // Calculate unlock threshold
  const targetThreshold = 30000;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / targetThreshold) * 100));
  const remainingAmount = Math.max(0, targetThreshold - cartSubtotal);

  const handleClaimFreeGift = (gift: FreeGiftOption) => {
    if (cartSubtotal < gift.unlockedAt) {
      addToast(
        'info',
        'Almost There!',
        `Add ${formatPrice(gift.unlockedAt - cartSubtotal)} more items to claim your ${gift.name} for FREE!`
      );
      return;
    }

    // Find or create product object for the free gift
    const freeGiftProduct = {
      id: `free-gift-${gift.id}`,
      title: `[FREE BONUS GIFT] ${gift.name}`,
      slug: `free-gift-${gift.id}`,
      description: 'Exclusive CartNova promotional free bonus gift rewarded for your purchase.',
      shortDescription: 'Free CartNova bonus item',
      price: 0,
      originalPrice: gift.retailValue,
      discountPercentage: 100,
      category: 'Audio & Wearables',
      brand: 'CartNova Rewards',
      images: [gift.image],
      rating: 4.9,
      reviewCount: 482,
      stock: 50,
      sellerId: 'seller-cartnova',
      sellerName: 'CartNova Direct Hub',
      tags: ['free gift', 'bonus', 'cartnova'],
      specs: { 'Condition': 'Brand New Free Gift', 'Warranty': 'Included' },
      createdAt: new Date().toISOString(),
    };

    addToCart(freeGiftProduct, 1);
    addToast('success', '🎁 Free Gift Added!', `${gift.name} has been added to your cart at 100% discount ($0.00)!`);
    setIsGiftModalOpen(false);
  };

  return (
    <div className="space-y-3 mb-6">
      {/* CartNova Live Marquee & Trust Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 rounded-2xl p-3 sm:p-4 text-white shadow-md border border-amber-400/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left Tagline & Perks */}
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start text-xs sm:text-sm font-extrabold tracking-wide">
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full text-yellow-200">
              <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300 animate-bounce" />
              <span>SHOP LIKE A TRILLIONAIRE</span>
            </span>

            <span className="flex items-center gap-1 text-white font-bold">
              <Truck className="w-4 h-4 text-yellow-200" />
              <span>Free Shipping On All Orders</span>
            </span>

            <span className="hidden sm:flex items-center gap-1 text-white/90">
              <ShieldCheck className="w-4 h-4 text-yellow-200" />
              <span>90-Day Free Returns</span>
            </span>

            <span className="hidden lg:flex items-center gap-1 text-white/90">
              <RotateCcw className="w-4 h-4 text-yellow-200" />
              <span>Price Adjustment Guarantee</span>
            </span>
          </div>

          {/* Right Action: Spin & Win trigger */}
          <button
            onClick={onOpenSpinWheel}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-orange-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Gift className="w-4 h-4 text-orange-700 animate-spin" />
            <span>FREE SPINS: WIN CASH, TECH & FOOD</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Free Gift Unlock Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-orange-200 dark:border-orange-950/60 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600">
              <Gift className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Free Gift Unlock:</span>
                {cartSubtotal >= targetThreshold ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% UNLOCKED!
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">
                    Add {formatPrice(remainingAmount)} more to claim
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pick from Noise-Cancelling Earbuds, Aluminum Phone Stand, or 65W Fast Charger
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGiftModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/80 text-orange-600 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{cartSubtotal >= targetThreshold ? 'Choose Free Gift' : 'View Free Gifts'}</span>
          </button>
        </div>

        {/* Progress meter */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Free Gift Selector Modal */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600">
                  <Gift className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Select Your Free Gift
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complimentary with qualifying orders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGiftModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Gift Options List */}
            <div className="space-y-3">
              {FREE_GIFT_OPTIONS.map((gift) => {
                const isUnlocked = cartSubtotal >= gift.unlockedAt;
                const isSelected = selectedGiftId === gift.id;

                return (
                  <div
                    key={gift.id}
                    onClick={() => setSelectedGiftId(gift.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={gift.image}
                      alt={gift.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-xl shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {gift.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-black text-orange-600">FREE</span>
                        <span className="text-[11px] text-slate-400 line-through">
                          {formatPrice(gift.retailValue)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {isUnlocked ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready to claim
                          </span>
                        ) : (
                          <span>Unlocked at {formatPrice(gift.unlockedAt)} spend</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimFreeGift(gift);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        isUnlocked
                          ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? 'Claim Free' : 'Locked'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center text-xs text-slate-400">
              * One free gift eligible per order. Free gifts ship together with your cart items.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
