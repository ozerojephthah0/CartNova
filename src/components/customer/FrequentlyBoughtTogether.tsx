import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Plus, Check, ShoppingBag, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({ currentProduct }) => {
  const { getFrequentlyBoughtTogether, addToCart, formatPrice, addToast } = useStore();

  const bundleData = React.useMemo(() => {
    return getFrequentlyBoughtTogether(currentProduct);
  }, [getFrequentlyBoughtTogether, currentProduct]);

  const [selectedCompanionIds, setSelectedCompanionIds] = useState<string[]>(() =>
    bundleData.items.map((i) => i.id)
  );

  const toggleCompanion = (id: string) => {
    setSelectedCompanionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedItems = [
    currentProduct,
    ...bundleData.items.filter((item) => selectedCompanionIds.includes(item.id)),
  ];

  const totalRawPrice = selectedItems.reduce((acc, curr) => acc + curr.price, 0);
  const discountPercent = selectedCompanionIds.length > 0 ? bundleData.bundleDiscount : 0;
  const bundleFinalPrice = (totalRawPrice * (100 - discountPercent)) / 100;
  const totalSaved = totalRawPrice - bundleFinalPrice;

  const handleAddBundleToCart = () => {
    selectedItems.forEach((product) => {
      addToCart(product, 1);
    });
    addToast(
      'success',
      'Bundle Added to Cart',
      `Added ${selectedItems.length} products to your cart with ${discountPercent}% bundle savings!`
    );
  };

  if (bundleData.items.length === 0) return null;

  return (
    <div className="bg-slate-50/80 rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Frequently Bought Together</h4>
            <p className="text-xs text-slate-500">
              Customers who bought this item frequently purchased these companion essentials.
            </p>
          </div>
        </div>

        {discountPercent > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100/90 text-rose-700 font-extrabold text-xs rounded-xl self-start sm:self-auto">
            <Tag className="w-3.5 h-3.5" />
            Bundle & Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Product Image Strip with Plus Icons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
          {/* Main Item */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white p-2 border-2 border-indigo-500 shadow-2xs relative">
              <img
                src={currentProduct.images[0]}
                alt={currentProduct.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                This Item
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 max-w-[90px] truncate text-center">
              {currentProduct.title}
            </span>
          </div>

          {/* Plus Sign & Companions */}
          {bundleData.items.map((companion) => {
            const isSelected = selectedCompanionIds.includes(companion.id);
            return (
              <React.Fragment key={companion.id}>
                <div className="shrink-0 text-slate-400 font-black text-lg">+</div>
                <div
                  onClick={() => toggleCompanion(companion.id)}
                  className={`shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-40 grayscale'
                  }`}
                >
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white p-2 border-2 shadow-2xs relative transition-all ${
                      isSelected ? 'border-indigo-400' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={companion.images[0]}
                      alt={companion.title}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 max-w-[90px] truncate text-center">
                    {companion.title}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bundle Summary & Add Action */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs min-w-[260px] space-y-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-500">Bundle Price:</span>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">{formatPrice(bundleFinalPrice)}</span>
                {totalSaved > 0 && (
                  <span className="text-xs text-slate-400 line-through block">
                    {formatPrice(totalRawPrice)}
                  </span>
                )}
              </div>
            </div>
            {totalSaved > 0 && (
              <p className="text-[11px] font-bold text-emerald-600 text-right">
                You save {formatPrice(totalSaved)} ({discountPercent}%)
              </p>
            )}
          </div>

          <button
            onClick={handleAddBundleToCart}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Selected ({selectedItems.length}) to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
