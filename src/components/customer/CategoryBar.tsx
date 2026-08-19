import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Headphones,
  Laptop,
  Home,
  Shirt,
  Gamepad2,
  Watch,
  Smartphone,
  Footprints,
  ShoppingBag,
  LayoutGrid,
  Grid,
  List,
  Sparkles,
  ArrowRight,
  X,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcategory / tag recommendations per category
const CATEGORY_TAG_SUGGESTIONS: Record<string, string[]> = {
  'Phones & Mobile': ['5G', 'Foldable', 'Flagship', 'AMOLED', 'Titanium', 'Charger'],
  'Boots & Footwear': ['Leather', 'Waterproof', 'Chelsea', 'Sneakers', 'Running', 'Handcrafted'],
  'Clothes & Fashion': ['Hoodie', 'Linen', 'Denim', 'Jacket', 'Silk', 'Streetwear'],
  'Bags & Luggage': ['Backpack', 'Commuter', 'Leather', 'Waterproof', 'Duffel', 'Sling'],
  'Audio & Wearables': ['Noise Cancelling', 'Wireless', 'Smartwatch', 'Spatial Audio', 'Titanium'],
  'Electronics & Computers': ['Laptop', '4K Monitor', 'USB-C', 'Ultralight', 'Ergonomic'],
  'Gaming & Gear': ['Mechanical', 'Wireless', 'RGB', 'Desk Mat', 'Precision'],
  'Smart Home & Living': ['Ambient Light', 'Smart Diffuser', 'Automation', 'Voice Control'],
};

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products, setFilters, filters } = useStore();
  const [viewStyle, setViewStyle] = useState<'pills' | 'cards'>('pills');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className={className} />;
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
        return <LayoutGrid className={className} />;
    }
  };

  const allCount = products.length;
  const activeCategoryObj = categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase());

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      setFilters((prev) => ({ ...prev, searchQuery: '' }));
    } else {
      setSelectedTag(tag);
      setFilters((prev) => ({ ...prev, searchQuery: tag }));
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedTag(null);
    setSelectedCategory(categoryName);
  };

  return (
    <section id="category-catalog-section" className="mb-8 space-y-4">
      {/* Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Browse by Category</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter through {categories.length} curated product categories with real-time stock
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setViewStyle('pills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewStyle === 'pills'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Compact Category Bar"
          >
            <List className="w-3.5 h-3.5" />
            <span>Pills</span>
          </button>
          <button
            type="button"
            onClick={() => setViewStyle('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewStyle === 'cards'
                ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Visual Category Showcase"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Showcase</span>
          </button>
        </div>
      </div>

      {/* Pill Style Navigation */}
      {viewStyle === 'pills' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {/* 'All Categories' Button */}
          <button
            id="category-pill-all"
            onClick={() => handleCategorySelect('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Products</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allCount}
            </span>
          </button>

          {/* Categories List */}
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;

            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Visual Showcase Cards Grid */}
      {viewStyle === 'cards' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {/* All Products Card */}
          <div
            onClick={() => handleCategorySelect('all')}
            className={`group relative overflow-hidden rounded-2xl p-4 cursor-pointer border transition-all duration-200 flex flex-col justify-between min-h-[130px] ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {allCount} items
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">All Catalog</h3>
              <p
                className={`text-[11px] mt-0.5 line-clamp-1 ${
                  selectedCategory === 'all' ? 'text-indigo-100' : 'text-slate-500'
                }`}
              >
                Entire boutique marketplace
              </p>
            </div>
          </div>

          {/* Individual Category Cards */}
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.id}`}
                onClick={() => handleCategorySelect(cat.name)}
                className={`group relative overflow-hidden rounded-2xl p-4 cursor-pointer border transition-all duration-200 flex flex-col justify-between min-h-[130px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-800'
                }`}
              >
                {/* Background Banner Preview (low opacity) */}
                {cat.bannerImage && (
                  <div
                    className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${cat.bannerImage})` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    }`}
                  >
                    {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count} items
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-sm tracking-tight">{cat.name}</h3>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {cat.description || 'Explore products'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Category Information Banner & Sub-Tags Bar */}
      <AnimatePresence>
        {activeCategoryObj && selectedCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden border border-indigo-800/40"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-indigo-300 shrink-0">
                  {getCategoryIcon(activeCategoryObj.iconName, 'w-6 h-6')}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                      Selected Category
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[11px] font-bold">
                      {products.filter((p) => p.category.toLowerCase() === activeCategoryObj.name.toLowerCase()).length} Products Available
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{activeCategoryObj.name}</h3>
                  <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                    {activeCategoryObj.description}
                  </p>
                </div>
              </div>

              {/* Reset to All Categories Button */}
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className="self-start md:self-auto px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Category Filter</span>
              </button>
            </div>

            {/* Subcategory Tag Pills */}
            {CATEGORY_TAG_SUGGESTIONS[activeCategoryObj.name] && (
              <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-300 font-medium text-[11px]">Popular Tags:</span>
                {CATEGORY_TAG_SUGGESTIONS[activeCategoryObj.name].map((tag) => {
                  const isTagActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        isTagActive
                          ? 'bg-indigo-500 text-white font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
