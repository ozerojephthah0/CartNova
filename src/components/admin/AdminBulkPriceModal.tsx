import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  RefreshCw,
  Zap,
  Check,
  RotateCcw,
  Search,
  Filter,
  Package,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  CheckSquare,
  Square,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { Product, BulkPriceAdjustmentParams } from '../../types';
import { generateBulkPricePreview, CalculatedProductPrice } from '../../utils/priceCalculator';

interface AdminBulkPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds?: string[];
  initialCategory?: string;
  initialSeller?: string;
}

export const AdminBulkPriceModal: React.FC<AdminBulkPriceModalProps> = ({
  isOpen,
  onClose,
  selectedProductIds = [],
  initialCategory,
  initialSeller,
}) => {
  const {
    products,
    categories,
    allUsers,
    bulkUpdateProductPrices,
    bulkUpdateMultipleProducts,
    undoLastPriceAdjustment,
    canUndoPriceAdjustment,
    priceAdjustmentHistory,
    formatPrice,
  } = useStore();

  // Active Tab: 'adjust' | 'history'
  const [activeTab, setActiveTab] = useState<'adjust' | 'history'>('adjust');

  // Scope: 'all' | 'selected' | 'category' | 'seller'
  const [scope, setScope] = useState<'all' | 'selected' | 'category' | 'seller'>(() => {
    if (selectedProductIds.length > 0) return 'selected';
    if (initialCategory && initialCategory !== 'ALL') return 'category';
    if (initialSeller && initialSeller !== 'ALL') return 'seller';
    return 'all';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && initialCategory !== 'ALL' ? initialCategory : categories[0]?.name || 'ALL'
  );
  const [selectedSeller, setSelectedSeller] = useState<string>(
    initialSeller && initialSeller !== 'ALL' ? initialSeller : 'ALL'
  );

  // Adjustment Mode & Value
  const [mode, setMode] = useState<BulkPriceAdjustmentParams['mode']>('percentage_increase');
  const [value, setValue] = useState<number>(10);
  const [roundingRule, setRoundingRule] = useState<BulkPriceAdjustmentParams['roundingRule']>('nearest_100');
  const [updateOriginalPrice, setUpdateOriginalPrice] =
    useState<BulkPriceAdjustmentParams['updateOriginalPrice']>('set_to_old_price');

  // Search filter inside preview
  const [previewSearch, setPreviewSearch] = useState('');

  // Excluded product IDs (user can uncheck specific rows in preview)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // Custom row overrides in preview
  const [customRowPrices, setCustomRowPrices] = useState<Record<string, number>>({});

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedProductIds.length > 0) {
        setScope('selected');
      } else {
        setScope('all');
      }
      setExcludedIds(new Set());
      setCustomRowPrices({});
      setPreviewSearch('');
    }
  }, [isOpen, selectedProductIds]);

  // Sellers list
  const sellers = useMemo(() => {
    const sellerIds = Array.from(new Set(products.map((p) => p.sellerId)));
    return sellerIds.map((id) => {
      const prod = products.find((p) => p.sellerId === id);
      return {
        id,
        name: prod?.sellerName || (id === 'admin-official' ? 'CartNova HQ' : id),
      };
    });
  }, [products]);

  // Build target parameters
  const adjustmentParams = useMemo<BulkPriceAdjustmentParams>(() => {
    let targetIds: string[] | undefined = undefined;
    if (scope === 'selected') {
      targetIds = selectedProductIds;
    }

    return {
      productIds: targetIds,
      category: scope === 'category' ? selectedCategory : undefined,
      sellerId: scope === 'seller' ? selectedSeller : undefined,
      mode,
      value: Number(value) || 0,
      roundingRule,
      updateOriginalPrice,
    };
  }, [scope, selectedProductIds, selectedCategory, selectedSeller, mode, value, roundingRule, updateOriginalPrice]);

  // Generated calculated preview
  const previewItems: CalculatedProductPrice[] = useMemo(() => {
    return generateBulkPricePreview(products, adjustmentParams, excludedIds);
  }, [products, adjustmentParams, excludedIds]);

  // Filtered preview items for table search
  const filteredPreviewItems = useMemo(() => {
    if (!previewSearch.trim()) return previewItems;
    const q = previewSearch.toLowerCase();
    return previewItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [previewItems, previewSearch]);

  // Statistics & summary calculations
  const stats = useMemo(() => {
    const activeItems = previewItems.filter((p) => !excludedIds.has(p.id));
    const totalCount = activeItems.length;
    if (totalCount === 0) {
      return {
        totalCount: 0,
        avgCurrentPrice: 0,
        avgNewPrice: 0,
        totalCurrentValue: 0,
        totalNewValue: 0,
        netDifference: 0,
        avgPercentageChange: 0,
      };
    }

    let totalCurrent = 0;
    let totalNew = 0;

    activeItems.forEach((p) => {
      const newP = customRowPrices[p.id] !== undefined ? customRowPrices[p.id] : p.newPrice;
      totalCurrent += p.currentPrice;
      totalNew += newP;
    });

    const avgCurrentPrice = totalCurrent / totalCount;
    const avgNewPrice = totalNew / totalCount;
    const netDiff = totalNew - totalCurrent;
    const avgPercent = totalCurrent > 0 ? (netDiff / totalCurrent) * 100 : 0;

    return {
      totalCount,
      avgCurrentPrice,
      avgNewPrice,
      totalCurrentValue: totalCurrent,
      totalNewValue: totalNew,
      netDifference: netDiff,
      avgPercentageChange: avgPercent,
    };
  }, [previewItems, excludedIds, customRowPrices]);

  // Handlers
  const toggleExcludeProduct = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllInPreview = (select: boolean) => {
    if (select) {
      setExcludedIds(new Set());
    } else {
      const allIds = new Set(previewItems.map((p) => p.id));
      setExcludedIds(allIds);
    }
  };

  const handleApplyAdjustments = () => {
    // If user made custom per-row price overrides, apply via bulkUpdateMultipleProducts
    const customOverrideIds = Object.keys(customRowPrices);
    if (customOverrideIds.length > 0) {
      const updates = previewItems
        .filter((p) => !excludedIds.has(p.id))
        .map((p) => {
          const finalPrice = customRowPrices[p.id] !== undefined ? customRowPrices[p.id] : p.newPrice;
          const finalOrig = p.newOriginalPrice;
          const discount =
            finalOrig && finalOrig > finalPrice
              ? Math.round(((finalOrig - finalPrice) / finalOrig) * 100)
              : undefined;

          return {
            id: p.id,
            price: finalPrice,
            originalPrice: finalOrig,
            discountPercentage: discount,
          };
        });

      bulkUpdateMultipleProducts(updates);
      onClose();
      return;
    }

    // Otherwise use standard bulkUpdateProductPrices
    const excludedArray = Array.from(excludedIds);
    bulkUpdateProductPrices(adjustmentParams, excludedArray);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs shadow-inner">
                <DollarSign className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">Mass Product Price Manager</h2>
                  <span className="px-2 py-0.5 bg-amber-400 text-purple-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Admin Tool
                  </span>
                </div>
                <p className="text-xs text-purple-100/90 mt-0.5">
                  Adjust prices across all {products.length} products, selected listings, or specific categories.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="bg-purple-900/60 p-1 rounded-xl flex items-center text-xs font-bold border border-white/10">
                <button
                  onClick={() => setActiveTab('adjust')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'adjust' ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-200 hover:text-white'
                  }`}
                >
                  Bulk Adjust
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeTab === 'history' ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-200 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History ({priceAdjustmentHistory.length})</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Body */}
          {activeTab === 'history' ? (
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Price Adjustment History & Snapshots</h3>
                  <p className="text-xs text-slate-500">
                    Review previously applied bulk price changes and instantly revert prices if necessary.
                  </p>
                </div>
                {canUndoPriceAdjustment && (
                  <button
                    onClick={undoLastPriceAdjustment}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo Most Recent Adjustment</span>
                  </button>
                )}
              </div>

              {priceAdjustmentHistory.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No previous price adjustments recorded</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Whenever you apply a bulk price change, a backup snapshot is automatically saved here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {priceAdjustmentHistory.map((snap, idx) => (
                    <div
                      key={snap.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-md">
                            {idx === 0 ? 'Latest Snapshot' : `Snapshot #${priceAdjustmentHistory.length - idx}`}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{snap.description}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Applied: {new Date(snap.timestamp).toLocaleString()} • {snap.affectedProductCount} products modified
                        </p>
                      </div>

                      {idx === 0 && (
                        <button
                          onClick={undoLastPriceAdjustment}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revert This Snapshot</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Step 1: Target Scope */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Select Target Scope
                    </h3>
                  </div>
                  <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-md">
                    {previewItems.length} Products in Scope
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'all',
                      label: 'All Products',
                      desc: `Storewide (${products.length} items)`,
                      icon: Layers,
                    },
                    {
                      id: 'selected',
                      label: 'Selected Items',
                      desc: `${selectedProductIds.length} checked`,
                      icon: CheckSquare,
                      disabled: selectedProductIds.length === 0,
                    },
                    {
                      id: 'category',
                      label: 'By Category',
                      desc: 'Filter single dept',
                      icon: Package,
                    },
                    {
                      id: 'seller',
                      label: 'By Seller',
                      desc: 'Filter merchant',
                      icon: Filter,
                    },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      disabled={sc.disabled}
                      onClick={() => setScope(sc.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        scope === sc.id
                          ? 'border-purple-600 bg-purple-50/80 text-purple-900 ring-2 ring-purple-600/20 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <sc.icon className="w-4 h-4 mb-1.5 text-purple-600" />
                      <p className="text-xs font-bold leading-tight">{sc.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sc.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Sub-Filters for Category / Seller */}
                {scope === 'category' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 shrink-0">Choose Category:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-purple-600"
                    >
                      {categories.map((c) => {
                        const count = products.filter(
                          (p) => p.category.toLowerCase() === c.name.toLowerCase()
                        ).length;
                        return (
                          <option key={c.id} value={c.name}>
                            {c.name} ({count} products)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {scope === 'seller' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 shrink-0">Choose Seller:</label>
                    <select
                      value={selectedSeller}
                      onChange={(e) => setSelectedSeller(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-purple-600"
                    >
                      {sellers.map((s) => {
                        const count = products.filter((p) => p.sellerId === s.id).length;
                        return (
                          <option key={s.id} value={s.id}>
                            {s.name} ({count} products)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 2: Adjustment Mode & Presets */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Adjustment Strategy & Value
                  </h3>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'percentage_increase',
                      label: 'Increase By %',
                      icon: TrendingUp,
                      color: 'text-emerald-600',
                    },
                    {
                      id: 'percentage_decrease',
                      label: 'Discount / Sale %',
                      icon: TrendingDown,
                      color: 'text-rose-600',
                    },
                    {
                      id: 'fixed_increase',
                      label: 'Add Fixed Amount (₦)',
                      icon: DollarSign,
                      color: 'text-indigo-600',
                    },
                    {
                      id: 'fixed_decrease',
                      label: 'Subtract Fixed (₦)',
                      icon: DollarSign,
                      color: 'text-amber-600',
                    },
                    {
                      id: 'set_fixed',
                      label: 'Set Uniform Price (₦)',
                      icon: Sparkles,
                      color: 'text-purple-600',
                    },
                    {
                      id: 'set_discount_from_msrp',
                      label: 'Slash from MSRP %',
                      icon: Zap,
                      color: 'text-amber-500',
                    },
                    {
                      id: 'reset_to_msrp',
                      label: 'Restore MSRP (Clear Sales)',
                      icon: RefreshCw,
                      color: 'text-slate-600',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        mode === m.id
                          ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-600/20 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <m.icon className={`w-4 h-4 mb-1 ${m.color}`} />
                      <span className="text-xs block leading-tight">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Value Input & Quick Preset Chips */}
                {mode !== 'reset_to_msrp' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700">
                        {mode.includes('percentage') || mode.includes('msrp')
                          ? 'Adjustment Percentage (%):'
                          : 'Amount in Naira (₦):'}
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-36">
                          <input
                            type="number"
                            min={0}
                            value={value}
                            onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-purple-600 text-right pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {mode.includes('percentage') || mode.includes('msrp') ? '%' : '₦'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Presets:
                      </span>
                      {mode.includes('percentage') || mode.includes('msrp')
                        ? [5, 10, 15, 20, 25, 30, 50, 70].map((p) => (
                            <button
                              key={p}
                              onClick={() => setValue(p)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                value === p
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {mode === 'percentage_decrease' || mode === 'set_discount_from_msrp' ? `-${p}%` : `+${p}%`}
                            </button>
                          ))
                        : [500, 1000, 2000, 5000, 10000, 25000, 50000].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setValue(amt)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                value === amt
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              ₦{amt.toLocaleString()}
                            </button>
                          ))}
                    </div>
                  </div>
                )}

                {/* Additional Settings: Rounding & MSRP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Price Rounding Rule
                    </label>
                    <select
                      value={roundingRule}
                      onChange={(e) => setRoundingRule(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-purple-600"
                    >
                      <option value="nearest_100">Round to nearest ₦100 (e.g., ₦4,500)</option>
                      <option value="nearest_1000">Round to nearest ₦1,000 (e.g., ₦12,000)</option>
                      <option value="end_in_990">Charm Pricing ₦...990 (e.g., ₦4,990)</option>
                      <option value="end_in_99">Charm Pricing ₦...99 (e.g., ₦4,999)</option>
                      <option value="nearest_10">Round to nearest ₦10</option>
                      <option value="none">Exact Math (No Rounding)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Original Price (MSRP & Discount Badges)
                    </label>
                    <select
                      value={updateOriginalPrice}
                      onChange={(e) => setUpdateOriginalPrice(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-purple-600"
                    >
                      <option value="set_to_old_price">
                        Set old price as MSRP (Creates slashed price badge)
                      </option>
                      <option value="scale_proportionally">
                        Scale original price proportionally with new price
                      </option>
                      <option value="keep">Keep original MSRP as-is</option>
                      <option value="clear">Clear MSRP (No discount badge)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Live Preview & Impact Summary */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Live Impact & Preview
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectAllInPreview(excludedIds.size > 0)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                    >
                      {excludedIds.size > 0 ? 'Include All' : 'Exclude All'}
                    </button>
                  </div>
                </div>

                {/* Summary Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white shadow-inner">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Affected Items
                    </p>
                    <p className="text-lg sm:text-xl font-black text-amber-300">
                      {stats.totalCount}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        / {previewItems.length}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Avg Current Price
                    </p>
                    <p className="text-sm sm:text-base font-bold text-slate-200">
                      {formatPrice(stats.avgCurrentPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Avg New Price
                    </p>
                    <p className="text-sm sm:text-base font-bold text-emerald-400">
                      {formatPrice(stats.avgNewPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Average Shift
                    </p>
                    <p
                      className={`text-sm sm:text-base font-black ${
                        stats.netDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stats.netDifference >= 0 ? '+' : ''}
                      {stats.avgPercentageChange.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Table Filter Search */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search preview list..."
                      value={previewSearch}
                      onChange={(e) => setPreviewSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-purple-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Uncheck any product row to exclude it from the price update.
                  </p>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={excludedIds.size === 0}
                            onChange={(e) => handleSelectAllInPreview(e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Product Item</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Current Price</th>
                        <th className="p-3">Projected New Price</th>
                        <th className="p-3 text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPreviewItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            No products matching search in this scope.
                          </td>
                        </tr>
                      ) : (
                        filteredPreviewItems.map((item) => {
                          const isExcluded = excludedIds.has(item.id);
                          const customPrice = customRowPrices[item.id];
                          const activeNewPrice = customPrice !== undefined ? customPrice : item.newPrice;
                          const activeDiff = activeNewPrice - item.currentPrice;
                          const activePercent =
                            item.currentPrice > 0 ? (activeDiff / item.currentPrice) * 100 : 0;

                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                isExcluded
                                  ? 'bg-slate-50/50 opacity-40'
                                  : 'hover:bg-purple-50/40'
                              }`}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={!isExcluded}
                                  onChange={() => toggleExcludeProduct(item.id)}
                                  className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate max-w-[200px]">
                                      {item.title}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {item.brand}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="text-slate-600 text-[11px]">{item.category}</span>
                              </td>
                              <td className="p-3 font-medium text-slate-700">
                                {formatPrice(item.currentPrice)}
                                {item.currentOriginalPrice && item.currentOriginalPrice > item.currentPrice && (
                                  <span className="block text-[9px] text-slate-400 line-through">
                                    {formatPrice(item.currentOriginalPrice)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    disabled={isExcluded}
                                    value={activeNewPrice}
                                    onChange={(e) => {
                                      const num = Math.max(100, Number(e.target.value));
                                      setCustomRowPrices((prev) => ({
                                        ...prev,
                                        [item.id]: num,
                                      }));
                                    }}
                                    className="w-24 px-2 py-1 bg-white border border-purple-200 rounded-md text-xs font-bold text-purple-950 focus:outline-purple-600 disabled:bg-slate-100"
                                  />
                                  {item.newOriginalPrice && item.newOriginalPrice > activeNewPrice && (
                                    <span className="text-[9px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md font-bold">
                                      {item.newDiscountPercentage}% OFF
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] ${
                                    activeDiff > 0
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : activeDiff < 0
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {activeDiff > 0 ? '+' : ''}
                                  {formatPrice(activeDiff)} ({activePercent > 0 ? '+' : ''}
                                  {activePercent.toFixed(0)}%)
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Safety Enabled: An automatic rollback snapshot will be created before saving.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              {activeTab === 'adjust' && (
                <button
                  id="admin-apply-bulk-price-btn"
                  onClick={handleApplyAdjustments}
                  disabled={stats.totalCount === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Apply Price Changes to {stats.totalCount} Products
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
