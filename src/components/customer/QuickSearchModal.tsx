import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
  ShoppingBag,
  Star,
  Layers,
  Store,
  Tag,
  Check,
  RotateCcw,
} from 'lucide-react';

export const QuickSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    products,
    categories,
    filters,
    setFilters,
    executeSearch,
    recentSearches,
    popularSearches,
    removeRecentSearch,
    clearRecentSearches,
    formatPrice,
    setQuickViewProduct,
    viewProductDetail,
    setIsAiAssistantOpen,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          executeSearch(transcript, selectedCategory);
          setIsListening(false);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, [selectedCategory, executeSearch]);

  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      // Simulated voice search fallback
      setIsListening(true);
      setTimeout(() => {
        const samples = ['Wireless Noise Cancelling', 'Mechanical Keyboard', 'Leather Boots', 'Smart Watch'];
        const chosen = samples[Math.floor(Math.random() * samples.length)];
        setSearchQuery(chosen);
        setIsListening(false);
      }, 1800);
      return;
    }

    if (isListening) {
      recognitionInstance?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionInstance?.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isSearchModalOpen) {
      setSearchQuery(filters.searchQuery || '');
      setSelectedCategory(filters.category || 'all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchModalOpen, filters]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K and /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when focused in an input/textarea
      const activeEl = document.activeElement;
      const isInput =
        activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true');

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  // Filter products for live preview
  const q = searchQuery.trim().toLowerCase();
  const matchingProducts = products
    .filter((p) => {
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      const title = (p.title || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      const desc = `${p.description || ''} ${p.shortDescription || ''}`.toLowerCase();
      return (
        title.includes(q) ||
        brand.includes(q) ||
        category.includes(q) ||
        tags.some((t) => t.includes(q)) ||
        desc.includes(q)
      );
    })
    .slice(0, 6);

  // Extract matching brands
  const matchingBrands = Array.from(
    new Set(
      products
        .filter((p) => {
          if (!q) return true;
          return (
            p.brand.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        })
        .map((p) => p.brand)
    )
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery, selectedCategory);
  };

  const handleSelectProduct = (product: any) => {
    viewProductDetail(product);
    setIsSearchModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[88vh]"
        >
          {/* Top Search Input Header */}
          <form onSubmit={handleSubmit} className="relative border-b border-slate-200/90 bg-slate-50/70">
            <div className="flex items-center px-4 py-3.5 gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5" />
              </div>

              {/* Category Selector */}
              <div className="hidden sm:block">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-2.5 rounded-lg focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Search Input */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  id="spotlight-product-search-input"
                  type="text"
                  placeholder="Search products, brands, sneakers, tech gadgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base sm:text-lg font-medium outline-hidden pr-20"
                />
              </div>

              {/* Voice Search Button */}
              <button
                type="button"
                id="voice-search-toggle-btn"
                onClick={toggleVoiceSearch}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice Search'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Clear Input Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listening Indicator Banner */}
            {isListening && (
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Listening... Speak clearly (e.g., "Apple AirPods", "Leather Jacket")
                </span>
                <span className="text-[11px] opacity-90">Click mic to finish</span>
              </div>
            )}
          </form>

          {/* Modal Body - Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-5 space-y-6">
            {/* Quick Filter Tags (Recent Searches & Trending) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center bg-white border border-slate-200 rounded-lg text-xs hover:border-indigo-400 group transition-all"
                      >
                        <button
                          onClick={() => {
                            setSearchQuery(term);
                            executeSearch(term, selectedCategory);
                          }}
                          className="px-2.5 py-1 text-slate-700 group-hover:text-indigo-600 font-medium cursor-pointer"
                        >
                          {term}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(term);
                          }}
                          className="pr-2 pl-0.5 text-slate-300 hover:text-rose-500 cursor-pointer"
                          title="Remove search term"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular / Trending Searches */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Trending & Popular
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(term);
                        executeSearch(term, selectedCategory);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matching Brands */}
            {matchingBrands.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Matching Brands
                </span>
                <div className="flex flex-wrap gap-2">
                  {matchingBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        setSearchQuery(brand);
                        executeSearch(brand, selectedCategory);
                      }}
                      className="px-3 py-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{brand}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Product Matches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {q ? `Matching Products (${matchingProducts.length})` : 'Popular Products'}
                </span>
                {q && (
                  <button
                    onClick={() => executeSearch(searchQuery, selectedCategory)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {matchingProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200/60 shrink-0 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-600">{prod.brand}</span>
                          <span>•</span>
                          <span>{prod.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {prod.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-extrabold text-slate-900">
                            {formatPrice(prod.price)}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{prod.rating}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">No direct product matches for "{searchQuery}"</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Try searching with broader terms, changing the category, or asking Nova AI.
                    </p>
                  </div>
                  <div className="pt-1 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        setIsAiAssistantOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Nova AI for Recommendations</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">
                  ↵ Enter
                </kbd>{' '}
                to search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">
                  Esc
                </kbd>{' '}
                to close
              </span>
            </div>

            <button
              onClick={() => executeSearch(searchQuery, selectedCategory)}
              className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Search Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
