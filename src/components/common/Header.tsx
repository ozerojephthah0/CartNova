import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ShieldCheck,
  Store,
  Sparkles,
  SlidersHorizontal,
  X,
  Package,
  Check,
  TrendingUp,
  Tag,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  LayoutGrid,
  Layers,
  Zap,
  ChevronRight,
  Headphones,
  Laptop,
  Home,
  Shirt,
  Gamepad2,
  Watch,
  Smartphone,
  Footprints,
  ShoppingBag,
  Mic,
  MicOff,
  Clock,
  ArrowRight,
  Star,
  Bell,
  LifeBuoy,
  Tablet,
  Swords,
  Crown,
  Truck,
  Calendar,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationPopover } from '../customer/NotificationPopover';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Gift } from 'lucide-react';

interface HeaderProps {
  onOpenRoleSwitcher: () => void;
  onOpenSpinWheel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRoleSwitcher, onOpenSpinWheel }) => {
  const {
    activeRole,
    currentUser,
    isLoggedIn,
    openAuthModal,
    logout,
    cartCount,
    cartSubtotal,
    orders,
    wishlist,
    setIsCartOpen,
    setIsAiAssistantOpen,
    filters,
    setFilters,
    products,
    categories,
    formatPrice,
    currentCurrency,
    setCurrency,
    activeCustomerTab,
    setActiveCustomerTab,
    unreadNotificationsCount,
    isNotificationPopoverOpen,
    setIsNotificationPopoverOpen,
    recentSearches,
    popularSearches,
    removeRecentSearch,
    clearRecentSearches,
    executeSearch,
    setIsSearchModalOpen,
    setQuickViewProduct,
    setIsSlashModalOpen,
    setIsMysteryBoxOpen,
    setIsNovaPrimeModalOpen,
    isNovaPrime,
    setIsTrackingModalOpen,
  } = useStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMegaMenuOpen, setIsCategoryMegaMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
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
        return <LayoutGrid className={className} />;
    }
  };

  // Sync search input
  useEffect(() => {
    setSearchInput(filters.searchQuery);
  }, [filters.searchQuery]);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchInput(transcript);
          executeSearch(transcript, filters.category);
          setSearchFocused(false);
          setIsMobileSearchOpen(false);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      // Simulation
      setIsListening(true);
      setTimeout(() => {
        const samples = ['Wireless Headphones', 'MacBook M3', 'Chelsea Boots', 'Mechanical Keyboard'];
        const chosen = samples[Math.floor(Math.random() * samples.length)];
        setSearchInput(chosen);
        executeSearch(chosen, filters.category);
        setIsListening(false);
        setSearchFocused(false);
      }, 1500);
    }
  };

  // Click outside to dismiss popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput, filters.category);
    setSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectSuggestedCategory = (catName: string) => {
    executeSearch('', catName);
    setSearchInput('');
    setSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectSuggestedProduct = (product: any) => {
    setSearchInput(product.title);
    setQuickViewProduct(product);
    setSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const q = searchInput.trim().toLowerCase();
  const searchSuggestions = products
    .filter((p) => {
      if (!q) return false;
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  const matchingBrands = Array.from(
    new Set(
      products
        .filter((p) => q && (p.brand.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)))
        .map((p) => p.brand)
    )
  ).slice(0, 4);

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'seller':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
            <Store className="w-3.5 h-3.5" />
            <span>Seller Mode ({currentUser.storeName?.split(' ')[0] || 'Merchant'})</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </span>
        );
    }
  };

  const customerOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.customerId === currentUser.id ||
        (currentUser.email && o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) ||
        (!isLoggedIn && (o.customerId === 'user-cust-1' || o.customerId === 'guest'))
    );
  }, [orders, currentUser.id, currentUser.email, isLoggedIn]);

  const activeOrdersCount = useMemo(() => {
    return customerOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [customerOrders]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-orange-950 px-2 py-0.5 rounded font-black text-[11px] uppercase tracking-wide animate-pulse">
              <Zap className="w-3 h-3 fill-orange-800 text-orange-800" /> CARTNOVA FLASH
            </span>
            <span className="hidden sm:inline text-white font-medium">
              🎁 Spin the Lucky Wheel for $100 Voucher Bundle • 🚚 Free Shipping On All Orders!
            </span>
            <span className="sm:hidden text-white font-semibold">🎁 Up to 90% OFF + Free Shipping!</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
            {onOpenSpinWheel && (
              <button
                onClick={onOpenSpinWheel}
                className="hidden md:flex items-center gap-1 text-yellow-200 hover:text-yellow-100 font-extrabold transition-colors cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Spin & Win $100</span>
              </button>
            )}

            {/* Theme Switcher in top bar */}
            <ThemeSwitcher variant="compact" />

            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-switcher-btn"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700 font-medium"
              >
                <span>{currentCurrency.code} ({currentCurrency.symbol})</span>
              </button>

              {isCurrencyDropdownOpen && (
                <div
                  id="currency-dropdown"
                  className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-slate-200"
                >
                  {([
                    { code: 'NGN', name: 'Nigerian Naira (₦)' },
                    { code: 'USD', name: 'US Dollar ($)' },
                    { code: 'EUR', name: 'Euro (€)' },
                    { code: 'GBP', name: 'British Pound (£)' },
                  ] as const).map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-xs flex items-center justify-between cursor-pointer"
                    >
                      <span>{curr.name}</span>
                      {currentCurrency.code === curr.code && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="role-switch-quick-btn"
              onClick={onOpenRoleSwitcher}
              className="flex items-center gap-1 text-indigo-300 hover:text-indigo-200 transition-colors font-medium cursor-pointer"
            >
              <span>Role: <strong className="capitalize text-white">{activeRole}</strong></span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded">Switch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Role Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchQuery: '', category: 'all' }));
                setActiveCustomerTab('shop');
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform border border-amber-300/40">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 dark:to-white bg-clip-text text-transparent">
                  Cart<span className="text-orange-600">Nova</span>
                </span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 -mt-1">
                  Shop Like a Trillionaire
                </span>
              </div>
            </button>

            <button
              id="header-role-badge"
              onClick={onOpenRoleSwitcher}
              className="hidden lg:block cursor-pointer hover:opacity-90 transition-opacity"
              title="Click to switch role / user"
            >
              {getRoleBadge()}
            </button>
          </div>

          {/* Smart Search Bar with Category Selector & Voice Search */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 rounded-xl border border-slate-200/80 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
                {/* Category Dropdown Prefix */}
                <div className="hidden sm:flex items-center pl-2 border-r border-slate-200/80">
                  <select
                    id="header-search-category-select"
                    value={filters.category}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, category: e.target.value }));
                      if (activeRole === 'customer') setActiveCustomerTab('shop');
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-700 hover:text-indigo-600 py-2 pl-1 pr-2 cursor-pointer focus:outline-hidden"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="main-product-search-input"
                    type="text"
                    placeholder="Search products, brands, specs..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    className="w-full pl-9 pr-28 py-2.5 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-hidden"
                  />

                  <div className="absolute right-1.5 flex items-center gap-1">
                    {/* Voice Search Button */}
                    <button
                      type="button"
                      id="header-voice-search-btn"
                      onClick={handleVoiceSearch}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'
                      }`}
                      title={isListening ? 'Listening... speak now' : 'Voice Search'}
                    >
                      {isListening ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>

                    {/* Quick Clear Button */}
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setFilters((prev) => ({ ...prev, searchQuery: '' }));
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Spotlight Modal trigger badge */}
                    <button
                      type="button"
                      onClick={() => setIsSearchModalOpen(true)}
                      className="hidden xl:flex items-center gap-0.5 px-1.5 py-1 bg-slate-200/80 hover:bg-slate-300 rounded text-[10px] font-mono text-slate-600 transition-colors cursor-pointer"
                      title="Spotlight Search (⌘K)"
                    >
                      <span>⌘K</span>
                    </button>

                    {/* Search Submit Button */}
                    <button
                      id="submit-search-btn"
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Smart Search Suggestions Dropdown */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  id="search-autocomplete-dropdown"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                >
                  {searchInput.trim() ? (
                    <div>
                      {/* Matching Brands */}
                      {matchingBrands.length > 0 && (
                        <div className="mb-3 pb-2.5 border-b border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Matching Brands
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {matchingBrands.map((brand) => (
                              <button
                                key={brand}
                                onClick={() => {
                                  setSearchInput(brand);
                                  executeSearch(brand, filters.category);
                                  setSearchFocused(false);
                                }}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Tag className="w-3 h-3 text-indigo-500" />
                                <span>{brand}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        <span>Matching Products ({searchSuggestions.length})</span>
                        <button
                          onClick={() => {
                            executeSearch(searchInput, filters.category);
                            setSearchFocused(false);
                          }}
                          className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>View all results</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {searchSuggestions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {searchSuggestions.map((prod) => (
                            <button
                              key={prod.id}
                              id={`suggest-prod-${prod.id}`}
                              onClick={() => handleSelectSuggestedProduct(prod)}
                              className="w-full flex items-center justify-between py-2 px-2 hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  className="w-10 h-10 object-cover rounded-md border border-slate-100 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {prod.title}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {prod.category} • {prod.brand}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-slate-900 shrink-0">
                                {formatPrice(prod.price)}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-slate-500 text-sm">
                          No direct matches found for "{searchInput}". Try searching by category, brand, or specs.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
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
                                className="inline-flex items-center bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs transition-colors group"
                              >
                                <button
                                  onClick={() => {
                                    setSearchInput(term);
                                    executeSearch(term, filters.category);
                                    setSearchFocused(false);
                                  }}
                                  className="px-2.5 py-1 text-slate-700 group-hover:text-indigo-700 font-medium cursor-pointer"
                                >
                                  {term}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeRecentSearch(term);
                                  }}
                                  className="pr-2 pl-0.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                                  title="Remove"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular Categories & Trending Searches */}
                      <div>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                          Popular Categories
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleSelectSuggestedCategory(cat.name)}
                              className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-full text-xs font-medium transition-colors cursor-pointer"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Trending: Headphones, Titanium Watch, Mechanical Keyboard
                        </span>
                        <button
                          onClick={() => {
                            setSearchFocused(false);
                            setIsAiAssistantOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Ask Nova AI
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Spin & Win Temu Button */}
            {onOpenSpinWheel && (
              <button
                id="header-spin-wheel-btn"
                onClick={onOpenSpinWheel}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-xl shadow-md shadow-orange-600/25 transition-all cursor-pointer transform hover:scale-105 active:scale-95 animate-pulse"
                title="Spin to Win $100 Coupon Bundle"
              >
                <Gift className="w-4 h-4 text-yellow-200" />
                <span className="hidden sm:inline">Spin & Win</span>
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              id="header-ai-assistant-btn"
              onClick={() => setIsAiAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Nova AI Shopping Assistant"
            >
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="hidden md:inline">Nova AI</span>
            </button>

            {/* Customer Specific Icons */}
            {activeRole === 'customer' && (
              <>
                {/* Wishlist */}
                <button
                  id="header-wishlist-btn"
                  onClick={() => setActiveCustomerTab('wishlist')}
                  className={`p-2.5 rounded-xl border transition-colors relative cursor-pointer ${
                    activeCustomerTab === 'wishlist'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Notifications Trigger & Popover */}
                <div className="relative">
                  <button
                    id="header-notifications-btn"
                    onClick={() => setIsNotificationPopoverOpen(!isNotificationPopoverOpen)}
                    className={`p-2.5 rounded-xl border transition-colors relative cursor-pointer ${
                      activeCustomerTab === 'notifications' || isNotificationPopoverOpen
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    aria-label="Customer Notifications"
                    title="Notifications & Alerts"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  <NotificationPopover
                    isOpen={isNotificationPopoverOpen}
                    onClose={() => setIsNotificationPopoverOpen(false)}
                  />
                </div>

                {/* Customer Support Button */}
                <button
                  id="header-support-btn"
                  onClick={() => setActiveCustomerTab('support')}
                  className={`p-2.5 rounded-xl border transition-colors relative cursor-pointer ${
                    activeCustomerTab === 'support'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  aria-label="Customer Support & Help Center"
                  title="24/7 Customer Care, Live Support & Tickets"
                >
                  <LifeBuoy className="w-5 h-5" />
                </button>

                {/* Orders Tab */}
                <button
                  id="header-orders-btn"
                  onClick={() => setActiveCustomerTab('orders')}
                  className={`px-3 py-2 rounded-xl border transition-all relative cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    activeCustomerTab === 'orders'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  aria-label="My Orders"
                  title="My Orders & Live Courier Tracking"
                >
                  <div className="relative">
                    <Package className="w-4 h-4" />
                    {activeOrdersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </div>
                  <span className="hidden sm:inline">Orders</span>
                  {customerOrders.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
                      {customerOrders.length}
                    </span>
                  )}
                </button>

                {/* Cart Drawer Trigger */}
                <button
                  id="header-cart-btn"
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
                  aria-label="Cart"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">{formatPrice(cartSubtotal)}</span>
                </button>
              </>
            )}

            {/* Visual Theme Switcher */}
            <div className="hidden sm:block">
              <ThemeSwitcher variant="dropdown" />
            </div>

            {/* Auth / Profile Area */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  id="header-sign-in-btn"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>

                <button
                  id="header-sign-up-btn"
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            ) : (
              <div ref={userMenuRef} className="relative ml-1">
                <button
                  id="header-user-profile-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                  title={`${currentUser.name} (${activeRole.toUpperCase()})`}
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Account Popover Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      id="header-account-popover"
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 divide-y divide-slate-100"
                    >
                      {/* User Profile Header */}
                      <div
                        onClick={() => {
                          if (activeRole === 'customer') {
                            setActiveCustomerTab('profile');
                            setIsUserMenuOpen(false);
                          }
                        }}
                        className={`px-4 py-3 ${activeRole === 'customer' ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email || 'Customer Account'}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase">
                            {currentUser.role}
                          </span>
                          {currentUser.authProvider === 'google' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                              </svg>
                              <span>Google Auth</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Navigation */}
                      <div className="py-1.5">
                        {activeRole === 'customer' && (
                          <>
                            <button
                              id="menu-profile-btn"
                              onClick={() => {
                                setActiveCustomerTab('profile');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-900 flex items-center gap-2.5 cursor-pointer"
                            >
                              <User className="w-4 h-4 text-indigo-600" />
                              <span>My Customer Profile</span>
                            </button>

                            <button
                              id="menu-notifications-btn"
                              onClick={() => {
                                setActiveCustomerTab('notifications');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <Bell className="w-4 h-4 text-indigo-500" />
                                <span>Notifications Center</span>
                              </div>
                              {unreadNotificationsCount > 0 && (
                                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                                  {unreadNotificationsCount}
                                </span>
                              )}
                            </button>

                            <button
                              id="menu-orders-btn"
                              onClick={() => {
                                setActiveCustomerTab('orders');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Package className="w-4 h-4 text-slate-400" />
                              <span>My Orders & Tracking</span>
                            </button>

                            <button
                              id="menu-wishlist-btn"
                              onClick={() => {
                                setActiveCustomerTab('wishlist');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Heart className="w-4 h-4 text-slate-400" />
                              <span>Saved Wishlist ({wishlist.length})</span>
                            </button>
                            <button
                              id="menu-support-btn"
                              onClick={() => {
                                setActiveCustomerTab('support');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2.5 cursor-pointer"
                            >
                              <LifeBuoy className="w-4 h-4 text-indigo-600" />
                              <span>Customer Support & FAQs</span>
                            </button>
                          </>
                        )}

                        <button
                          id="menu-role-switch-btn"
                          onClick={() => {
                            onOpenRoleSwitcher();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2.5 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Switch Persona / Role Hub</span>
                        </button>
                      </div>

                      {/* Log Out Action */}
                      <div className="py-1.5">
                        <button
                          id="header-logout-btn"
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOMER SUB-HEADER CATEGORY NAVIGATION BAR */}
      {activeRole === 'customer' && (
        <div className="border-t border-slate-100 bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 gap-2 overflow-x-auto text-xs scrollbar-none">
              {/* All Categories Mega Menu Button */}
              <div ref={categoryMenuRef} className="relative shrink-0">
                <button
                  id="mega-category-menu-btn"
                  onClick={() => setIsCategoryMegaMenuOpen(!isCategoryMegaMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    isCategoryMegaMenuOpen || filters.category !== 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isCategoryMegaMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Mega Menu Dropdown Panel */}
                <AnimatePresence>
                  {isCategoryMegaMenuOpen && (
                    <motion.div
                      id="category-mega-dropdown-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-[340px] sm:w-[480px] md:w-[620px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Explore Product Categories</h4>
                          <p className="text-[11px] text-slate-500">
                            Discover verified tech, apparel, boots, and smart gear
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, category: 'all', searchQuery: '' }));
                            setIsCategoryMegaMenuOpen(false);
                            setActiveCustomerTab('shop');
                          }}
                          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          View All ({products.length})
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {categories.map((cat) => {
                          const isSelected = filters.category.toLowerCase() === cat.name.toLowerCase();
                          const count = products.filter(
                            (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                          ).length;

                          return (
                            <button
                              key={cat.id}
                              id={`mega-cat-item-${cat.id}`}
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, category: cat.name, searchQuery: '' }));
                                setIsCategoryMegaMenuOpen(false);
                                setActiveCustomerTab('shop');
                              }}
                              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-600/60 ring-1 ring-indigo-600/30'
                                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                                }`}
                              >
                                {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-slate-900 truncate">
                                    {cat.name}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {count}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {cat.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Horizontal Category Links */}
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all' }));
                    setActiveCustomerTab('shop');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    filters.category === 'all'
                      ? 'text-indigo-600 font-bold bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>

                {categories.map((cat) => {
                  const isSelected = filters.category.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, category: cat.name, searchQuery: '' }));
                        setActiveCustomerTab('shop');
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-indigo-600 font-bold bg-indigo-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Specials, Amazon & Temu Features */}
              <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-100 dark:border-slate-800">
                <button
                  id="subnav-seasonal-events-btn"
                  onClick={() => setActiveCustomerTab('seasonal-events')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer shadow-xs ${
                    activeCustomerTab === 'seasonal-events'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 ring-2 ring-amber-400 font-extrabold'
                      : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-400/40 hover:from-amber-500/30 hover:to-orange-500/30'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Seasonal Events</span>
                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                    20% OFF
                  </span>
                </button>

                <button
                  onClick={() => setIsSlashModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-[11px] font-black hover:from-orange-700 hover:to-red-700 shadow-xs transition-all cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Slash to ₦0</span>
                  <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-1 rounded">FREE</span>
                </button>

                <button
                  onClick={() => setIsMysteryBoxOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black hover:from-purple-700 hover:to-indigo-700 shadow-xs transition-all cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Mystery Box</span>
                </button>

                <button
                  onClick={() => setIsNovaPrimeModalOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                    isNovaPrime
                      ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <Crown className={`w-3.5 h-3.5 ${isNovaPrime ? 'text-yellow-300 fill-yellow-300' : 'text-blue-600'}`} />
                  <span>{isNovaPrime ? 'Prime Active 👑' : 'Nova Prime'}</span>
                </button>

                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live Tracking</span>
                </button>

                <button
                  id="subnav-support-btn"
                  onClick={() => setActiveCustomerTab('support')}
                  className={`hidden lg:flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${
                    activeCustomerTab === 'support'
                      ? 'text-indigo-600'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>24/7 Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
