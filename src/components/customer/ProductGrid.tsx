import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { RecentlyViewedAndRecommended } from './RecentlyViewedAndRecommended';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  ChevronRight,
  Headphones,
  Laptop,
  Home,
  Shirt,
  Gamepad2,
  Watch,
  Smartphone,
  Tablet,
  Footprints,
  ShoppingBag,
  Layers,
  Sparkles,
  Tag,
  Clock,
  TrendingUp,
  Truck,
  CheckCircle2,
  Percent,
  DollarSign,
  Store,
  ArrowUpDown,
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const {
    filteredProducts,
    filters,
    setFilters,
    resetFilters,
    categories,
    allUsers,
    products,
    popularSearches,
    executeSearch,
    setIsSearchModalOpen,
    setIsAiAssistantOpen,
    formatPrice,
  } = useStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [minPriceInput, setMinPriceInput] = useState<string>(
    filters.minPrice > 0 ? filters.minPrice.toString() : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    filters.maxPrice < 600000 ? filters.maxPrice.toString() : ''
  );

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    deals: true,
    rating: true,
    shipping: true,
    sellers: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sellers = allUsers.filter((u) => u.role === 'seller');

  // Extract all unique brands across all products
  const allBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    products.forEach((p) => {
      if (p.brand) {
        brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
      }
    });
    return Array.from(brandMap.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Filtered brands based on search within brand filter
  const displayedBrands = useMemo(() => {
    const q = brandSearchQuery.trim().toLowerCase();
    if (!q) return allBrands;
    return allBrands.filter((b) => b.brand.toLowerCase().includes(q));
  }, [allBrands, brandSearchQuery]);

  // Filtered categories based on filterSearchQuery
  const displayedCategories = useMemo(() => {
    const q = filterSearchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, filterSearchQuery]);

  // Filtered sellers based on filterSearchQuery
  const displayedSellers = useMemo(() => {
    const q = filterSearchQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        (s.storeName && s.storeName.toLowerCase().includes(q)) ||
        s.name.toLowerCase().includes(q)
    );
  }, [sellers, filterSearchQuery]);

  const getCategoryIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Tablet':
      case 'Tablets':
      case 'Tablets & iPads':
        return <Tablet className={className} />;
      case 'Footprints':
        return <Footprints className={className} />;
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'Headphones':
        return <Headphones className={className} />;
      case 'Laptop':
        return <Laptop className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Shirt':
        return <Shirt className={className} />;
      case 'Gamepad2':
        return <Gamepad2 className={className} />;
      case 'Watch':
        return <Watch className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }));
  };

  const handleQuickSort = (sortBy: typeof filters.sortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleBrandToggle = (brand: string) => {
    setFilters((prev) => {
      const exists = prev.brands?.includes(brand);
      const updatedBrands = exists
        ? prev.brands.filter((b) => b !== brand)
        : [...(prev.brands || []), brand];
      return { ...prev, brands: updatedBrands };
    });
  };

  const handlePriceSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFilters((prev) => ({ ...prev, maxPrice: val }));
    setMaxPriceInput(val.toString());
  };

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPriceInput ? Math.max(0, Number(minPriceInput)) : 0;
    const max = maxPriceInput ? Math.max(min, Number(maxPriceInput)) : 600000;
    setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const handlePricePreset = (min: number, max: number) => {
    setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
    setMinPriceInput(min > 0 ? min.toString() : '');
    setMaxPriceInput(max < 600000 ? max.toString() : '');
  };

  const handleRatingChange = (rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: prev.minRating === rating ? 0 : rating }));
  };

  const handleDiscountPreset = (minDiscount: number) => {
    setFilters((prev) => ({
      ...prev,
      minDiscount: prev.minDiscount === minDiscount ? 0 : minDiscount,
      onSaleOnly: minDiscount > 0 ? true : prev.onSaleOnly,
    }));
  };

  const handleSellerChange = (sellerId: string) => {
    setFilters((prev) => ({ ...prev, sellerId: prev.sellerId === sellerId ? 'all' : sellerId }));
  };

  // Count total active filters
  const activeFilterCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.brands && filters.brands.length > 0 ? filters.brands.length : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 600000 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly || filters.minDiscount > 0 ? 1 : 0) +
    (filters.freeShippingOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.sellerId !== 'all' ? 1 : 0);

  const filterSidebarContent = (
    <div className="space-y-5">
      {/* Active Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-sm text-slate-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            id="reset-filters-btn"
            onClick={resetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filter Options Quick Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter categories & sellers..."
          value={filterSearchQuery}
          onChange={(e) => setFilterSearchQuery(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        {filterSearchQuery && (
          <button
            onClick={() => setFilterSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Categories Accordion */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Categories</span>
          <div className="flex items-center gap-1">
            {filters.category !== 'all' && (
              <span className="text-[10px] lowercase px-1.5 py-0.2 bg-indigo-50 text-indigo-600 font-semibold rounded">
                1 active
              </span>
            )}
            {expandedSections.categories ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.categories && (
          <div className="space-y-1 pt-1 max-h-56 overflow-y-auto pr-1">
            <button
              id="filter-cat-all"
              onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                filters.category === 'all'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                <span>All Categories</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-100">
                {products.length}
              </span>
            </button>

            {displayedCategories.map((cat) => {
              const isSelected = filters.category.toLowerCase() === cat.name.toLowerCase();
              const count = products.filter(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase()
              ).length;
              return (
                <button
                  key={cat.id}
                  id={`filter-cat-${cat.id}`}
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat.name }))}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={isSelected ? 'text-indigo-600' : 'text-slate-400'}>
                      {getCategoryIcon(cat.iconName)}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands Multi-Select with In-Filter Search */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Brands</span>
          <div className="flex items-center gap-1">
            {filters.brands && filters.brands.length > 0 && (
              <span className="text-[10px] lowercase px-1.5 py-0.2 bg-indigo-50 text-indigo-600 font-semibold rounded">
                {filters.brands.length} selected
              </span>
            )}
            {expandedSections.brands ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.brands && (
          <div className="space-y-2 pt-1">
            {/* Brand Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearchQuery}
                onChange={(e) => setBrandSearchQuery(e.target.value)}
                className="w-full pl-7 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 outline-hidden"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              {brandSearchQuery && (
                <button
                  onClick={() => setBrandSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Brand Checkbox List */}
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {displayedBrands.map(({ brand, count }) => {
                const isChecked = filters.brands?.includes(brand) || false;
                return (
                  <label
                    key={brand}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="truncate">{brand}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold px-1 bg-slate-100 rounded">
                      {count}
                    </span>
                  </label>
                );
              })}
              {displayedBrands.length === 0 && (
                <p className="text-xs text-slate-400 py-2 text-center">No brands found</p>
              )}
            </div>

            {filters.brands && filters.brands.length > 0 && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, brands: [] }))}
                className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer block text-right w-full"
              >
                Clear selected brands
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Range & Quick Presets */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Price Range</span>
          <div className="flex items-center gap-1">
            {(filters.minPrice > 0 || filters.maxPrice < 600000) && (
              <span className="text-[10px] lowercase px-1.5 py-0.2 bg-indigo-50 text-indigo-600 font-semibold rounded">
                Custom
              </span>
            )}
            {expandedSections.price ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.price && (
          <div className="space-y-3 pt-1">
            {/* Quick Price Preset Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Under $50', min: 0, max: 50 },
                { label: '$50 - $150', min: 50, max: 150 },
                { label: '$150 - $500', min: 150, max: 500 },
                { label: '$500+', min: 500, max: 600000 },
              ].map((preset) => {
                const isActive =
                  filters.minPrice === preset.min && filters.maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handlePricePreset(preset.min, preset.max)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <form onSubmit={handleApplyCustomPrice} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-indigo-500"
                  />
                </div>
                <span className="text-xs text-slate-400 font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Go
                </button>
              </div>
            </form>

            {/* Interactive Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                <span>Max Slider:</span>
                <span className="font-bold text-indigo-600">
                  {filters.maxPrice >= 1000 ? '$1,000+' : `$${filters.maxPrice}`}
                </span>
              </div>
              <input
                id="price-range-slider"
                type="range"
                min="10"
                max="1000"
                step="10"
                value={Math.min(1000, filters.maxPrice)}
                onChange={handlePriceSliderChange}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Deals & Discounts Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('deals')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-rose-500" />
            <span>Deals & Savings</span>
          </div>
          {expandedSections.deals ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {expandedSections.deals && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onSaleOnly}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    onSaleOnly: !prev.onSaleOnly,
                    minDiscount: !prev.onSaleOnly ? Math.max(prev.minDiscount, 1) : 0,
                  }))
                }
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-bold text-rose-600">On Sale Items Only</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: '10%+ Off', pct: 10 },
                { label: '25%+ Off', pct: 25 },
                { label: '50%+ Off', pct: 50 },
              ].map(({ label, pct }) => {
                const isActive = filters.minDiscount === pct;
                return (
                  <button
                    key={label}
                    onClick={() => handleDiscountPreset(pct)}
                    className={`py-1 px-1.5 rounded-lg text-[11px] font-bold text-center border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Customer Rating</span>
          </div>
          {expandedSections.rating ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {expandedSections.rating && (
          <div className="space-y-1.5 pt-1">
            {[4.5, 4, 3].map((rating) => {
              const isSelected = filters.minRating === rating;
              const matchingCount = products.filter((p) => p.rating >= rating).length;
              return (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            starIdx <= Math.floor(rating)
                              ? 'text-amber-400 fill-amber-400'
                              : starIdx - 0.5 <= rating
                              ? 'text-amber-400 fill-amber-300'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span>{rating} & Up</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 bg-slate-100 rounded">
                    {matchingCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Shipping & Availability */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('shipping')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Availability & Shipping</span>
          {expandedSections.shipping ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {expandedSections.shipping && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                id="stock-only-toggle"
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={() => setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>In Stock Only</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.freeShippingOnly}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, freeShippingOnly: !prev.freeShippingOnly }))
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Free Shipping Eligible</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featuredOnly}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, featuredOnly: !prev.featuredOnly }))
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured Collection</span>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Verified Sellers Accordion */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('sellers')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Merchants</span>
          </div>
          {expandedSections.sellers ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {expandedSections.sellers && (
          <div className="space-y-1 pt-1 max-h-40 overflow-y-auto pr-1">
            {displayedSellers.map((seller) => {
              const isSelected = filters.sellerId === seller.id;
              const sellerProductCount = products.filter((p) => p.sellerId === seller.id).length;
              return (
                <button
                  key={seller.id}
                  id={`filter-seller-${seller.id}`}
                  onClick={() => handleSellerChange(seller.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">{seller.storeName || seller.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold px-1 bg-slate-100 rounded">
                      {sellerProductCount}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section id="product-catalog-section" className="py-4">
      {/* Category Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, category: 'all', searchQuery: '' }))}
          className="hover:text-indigo-600 font-medium transition-colors cursor-pointer"
        >
          Storefront
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button
          onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
          className="hover:text-indigo-600 font-medium transition-colors cursor-pointer"
        >
          All Categories
        </button>
        {filters.category !== 'all' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-900">{filters.category}</span>
          </>
        )}
      </nav>

      {/* Top Header & Sort Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              {filters.category === 'all' ? 'Product Catalog' : filters.category}
            </h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Refine with precision filters, brand tags, price ranges, and multi-mode sorting.
          </p>
        </div>

        {/* Right Controls: Sort Select + View Mode + Mobile Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Mobile Filter Toggle */}
          <button
            id="mobile-filter-drawer-btn"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Selector with All 10 Criteria */}
          <div className="relative">
            <select
              id="sort-products-select"
              value={filters.sortBy}
              onChange={handleSortChange}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden hover:border-slate-300"
            >
              <option value="featured">Sort: Featured & Recommended</option>
              <option value="relevance">Sort: Highest Search Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
              <option value="reviews">Most Popular / Reviewed</option>
              <option value="discount">Biggest Discount (% Off)</option>
              <option value="newest">Newest Arrivals</option>
              <option value="name-asc">Alphabetical: A to Z</option>
              <option value="name-desc">Alphabetical: Z to A</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid vs List Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label="Grid View"
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-list-btn"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label="List View"
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Sort Bar Chips */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-slate-400" />
          Quick Sort:
        </span>
        {[
          { label: 'Featured', value: 'featured' },
          { label: 'Lowest Price', value: 'price-asc' },
          { label: 'Highest Rated', value: 'rating' },
          { label: 'Biggest Savings', value: 'discount' },
          { label: 'Newest', value: 'newest' },
          { label: 'Most Reviewed', value: 'reviews' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => handleQuickSort(item.value as any)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
              filters.sortBy === item.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Active Filter Chips / Removable Tags Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl mb-5">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            Active Filters ({activeFilterCount}):
          </span>

          {/* Search Query Chip */}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold border border-indigo-200">
              <Search className="w-3 h-3" />
              <span>"{filters.searchQuery}"</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="hover:text-indigo-950 p-0.5 rounded cursor-pointer"
                title="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Category Chip */}
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold border border-indigo-200">
              <span>Category: {filters.category}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                className="hover:text-indigo-950 p-0.5 rounded cursor-pointer"
                title="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Brand Chips */}
          {filters.brands?.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold border border-indigo-200"
            >
              <Tag className="w-3 h-3" />
              <span>Brand: {b}</span>
              <button
                onClick={() => handleBrandToggle(b)}
                className="hover:text-indigo-950 p-0.5 rounded cursor-pointer"
                title={`Remove ${b}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Price Range Chip */}
          {(filters.minPrice > 0 || filters.maxPrice < 600000) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-200">
              <DollarSign className="w-3 h-3" />
              <span>
                Price: ${filters.minPrice} -{' '}
                {filters.maxPrice >= 600000 ? 'Any' : `$${filters.maxPrice}`}
              </span>
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, minPrice: 0, maxPrice: 600000 }));
                  setMinPriceInput('');
                  setMaxPriceInput('');
                }}
                className="hover:text-emerald-950 p-0.5 rounded cursor-pointer"
                title="Remove price filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Rating Chip */}
          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-200">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{filters.minRating}★ & Up</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
                className="hover:text-amber-950 p-0.5 rounded cursor-pointer"
                title="Remove rating filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Discount / Deals Chip */}
          {(filters.onSaleOnly || filters.minDiscount > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-900 rounded-lg text-xs font-bold border border-rose-200">
              <Percent className="w-3 h-3" />
              <span>
                {filters.minDiscount > 0
                  ? `${filters.minDiscount}%+ Discount`
                  : 'On Sale / Discounted'}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, onSaleOnly: false, minDiscount: 0 }))
                }
                className="hover:text-rose-950 p-0.5 rounded cursor-pointer"
                title="Remove deals filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* In Stock Chip */}
          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>In Stock Only</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
                className="hover:text-slate-950 p-0.5 rounded cursor-pointer"
                title="Remove in-stock filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Free Shipping Chip */}
          {filters.freeShippingOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold border border-indigo-200">
              <Truck className="w-3 h-3" />
              <span>Free Shipping</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, freeShippingOnly: false }))}
                className="hover:text-indigo-950 p-0.5 rounded cursor-pointer"
                title="Remove free shipping filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Featured Chip */}
          {filters.featuredOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-200">
              <Sparkles className="w-3 h-3" />
              <span>Featured Only</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, featuredOnly: false }))}
                className="hover:text-amber-950 p-0.5 rounded cursor-pointer"
                title="Remove featured filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Seller Chip */}
          {filters.sellerId !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-200">
              <Store className="w-3 h-3" />
              <span>
                Seller: {sellers.find((s) => s.id === filters.sellerId)?.storeName || filters.sellerId}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, sellerId: 'all' }))}
                className="hover:text-emerald-950 p-0.5 rounded cursor-pointer"
                title="Remove seller filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Clear All Button */}
          <button
            onClick={resetFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-auto hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs sticky top-24">
          {filterSidebarContent}
        </aside>

        {/* Product Catalog Area */}
        <main className="lg:col-span-9">
          {filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            /* Smart Empty State with Search Suggestions & Category Shortcuts */
            <div
              id="no-products-found-state"
              className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-6 shadow-2xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  No matching products found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {filters.searchQuery ? (
                    <>
                      We couldn't find any items matching "<strong>{filters.searchQuery}</strong>"
                      with your current filter configuration.
                    </>
                  ) : (
                    <>
                      No products match your active filter combination. Try adjusting price range, brands, or resetting filters.
                    </>
                  )}
                </p>
              </div>

              {/* Popular Searches Suggestions */}
              <div className="max-w-md mx-auto space-y-3">
                {popularSearches.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Try These Popular Searches
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {popularSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => executeSearch(term, 'all')}
                          className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category Quick Picks */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Explore Verified Categories
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => executeSearch('', cat.name)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {getCategoryIcon(cat.iconName)}
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Nova AI for Suggestions</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dynamic Recommended & Recently Viewed Section */}
      <div className="pt-8">
        <RecentlyViewedAndRecommended limit={8} />
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">Filter & Sort Catalog</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterSidebarContent}
            </div>

            <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Apply Filters ({filteredProducts.length} Items)</span>
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
