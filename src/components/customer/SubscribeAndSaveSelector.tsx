import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RefreshCw, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';

interface SubscribeAndSaveProps {
  product: Product;
}

export const SubscribeAndSaveSelector: React.FC<SubscribeAndSaveProps> = ({ product }) => {
  const { addSubscription, formatPrice, isNovaPrime } = useStore();
  const [isSubscribeSelected, setIsSubscribeSelected] = useState(false);
  const [frequency, setFrequency] = useState(1);

  const discountPercent = 15;
  const discountedPrice = Math.floor(product.price * (1 - discountPercent / 100));

  const handleApplySubscription = () => {
    addSubscription(product.id, frequency);
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Subscribe & Save • Extra 15% OFF
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
          Save {formatPrice(product.price - discountedPrice)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={() => setIsSubscribeSelected(false)}
          className={`p-3 rounded-xl border text-left transition-all ${
            !isSubscribeSelected
              ? 'border-emerald-600 bg-white dark:bg-slate-800 ring-2 ring-emerald-500/20 font-bold'
              : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[10px]">One-time purchase</div>
          <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
            {formatPrice(product.price)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsSubscribeSelected(true)}
          className={`p-3 rounded-xl border text-left transition-all ${
            isSubscribeSelected
              ? 'border-emerald-600 bg-white dark:bg-slate-800 ring-2 ring-emerald-500/20 font-bold'
              : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Auto-Deliver (-15%)</div>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatPrice(discountedPrice)}
          </div>
        </button>
      </div>

      {isSubscribeSelected && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Delivery Frequency:</span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={1}>Every 1 Month (Most Popular)</option>
              <option value={2}>Every 2 Months</option>
              <option value={3}>Every 3 Months</option>
              <option value={6}>Every 6 Months</option>
            </select>
          </div>

          <button
            onClick={handleApplySubscription}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Set Up Auto-Delivery (Cancel Anytime)</span>
          </button>
        </div>
      )}
    </div>
  );
};
