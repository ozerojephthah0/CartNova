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
  Menu,
  Tv,
  Dumbbell,
  Baby,
  BookOpen,
  Car,
  Radio,
  UtensilsCrossed,
  Armchair,
  Apple,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationPopover } from '../customer/NotificationPopover';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MobileNavDrawer } from './MobileNavDrawer';
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
    freeSpinsLeft,
    walletBalance,
    openSpinWheel,
  } = useStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMegaMenuOpen, setIsCategoryMegaMenuOpen] = useState(false);
  const [megaMenuCategorySearch, setMegaMenuCategorySearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
      case 'Tv':
        return <Tv className={className} />;
      case 'Dumbbell':
        return <Dumbbell className={className} />;
      case 'Baby':
        return <Baby className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className={className} />;
      case 'Armchair':
        return <Armchair className={className} />;
      case 'Apple':
        return <Apple className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
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

  const matchingCategories = useMemo(() => {
    if (!q) return [];
    const qClean = q.replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
    const qWords = q.split(/[\s,&/-]+/).filter(Boolean);

    return categories
      .filter((cat) => {
        const nameClean = cat.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
        const slugClean = cat.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        const descClean = (cat.description || '').toLowerCase();
        const subsClean = (cat.subcategories || []).map((s) => s.name.toLowerCase()).join(' ');

        return (
          nameClean.includes(qClean) ||
          slugClean.includes(qClean) ||
          descClean.includes(q) ||
          subsClean.includes(q) ||
          (qWords.length > 0 && qWords.some((w) => nameClean.includes(w) || slugClean.includes(w)))
        );
      })
      .slice(0, 4);
  }, [categories, q]);

  const filteredMegaCategories = useMemo(() => {
    const term = megaMenuCategorySearch.trim().toLowerCase();
    if (!term) return categories;
    const termClean = term.replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
    const termWords = term.split(/[\s,&/-]+/).filter(Boolean);

    return categories.filter((cat) => {
      const nameClean = cat.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
      const slugClean = cat.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      const descClean = (cat.description || '').toLowerCase();
      const subsClean = (cat.subcategories || []).map((s) => s.name.toLowerCase()).join(' ');

      if (
        nameClean.includes(termClean) ||
        slugClean.includes(termClean) ||
        descClean.includes(term) ||
        subsClean.includes(term)
      ) {
        return true;
      }
      return (
        termWords.length > 0 &&
        termWords.every(
          (w) =>
            nameClean.includes(w) ||
            slugClean.includes(w) ||
            descClean.includes(w) ||
            subsClean.includes(w)
        )
      );
    });
  }, [categories, megaMenuCategorySearch]);

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
              🎁 Free Spins: Win Cash of Any Amount, Tech Gadgets & Gourmet Food • 🚚 Free Shipping!
            </span>
            <span className="sm:hidden text-white font-semibold">🎁 Free Spins: Win Cash, Tech & Food!</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
            <button
              onClick={() => {
                if (onOpenSpinWheel) onOpenSpinWheel();
                else openSpinWheel();
              }}
              className="hidden md:flex items-center gap-1.5 text-yellow-200 hover:text-yellow-100 font-extrabold transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Free Spins ({freeSpinsLeft})</span>
            </button>

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
              className="hidden sm:flex items-center gap-1 text-indigo-300 hover:text-indigo-200 transition-colors font-medium cursor-pointer"
            >
              <span>Role: <strong className="capitalize text-white">{activeRole}</strong></span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded">Switch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchQuery: '', category: 'all' }));
                setActiveCustomerTab('shop');
              }}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left group cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform border border-amber-300/40">
                <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 dark:to-white bg-clip-text text-transparent">
                  Cart<span className="text-orange-600">Nova</span>
                </span>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 -mt-1">
                  Shop Smart. Shop CartNova.
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

          {/* Smart Search Bar with Category Selector & Voice Search (Tablet / Desktop) */}
          <div ref={searchContainerRef} className="hidden sm:block flex-1 max-w-2xl relative">
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
                      {/* Matching Categories */}
                      {matchingCategories.length > 0 && (
                        <div className="mb-3 pb-2.5 border-b border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Matching Categories
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {matchingCategories.map((cat) => (
                              <button
                                key={cat.id}
                                id={`search-suggest-cat-${cat.id}`}
                                onClick={() => {
                                  setFilters((prev) => ({ ...prev, category: cat.name, searchQuery: '' }));
                                  setActiveCustomerTab('shop');
                                  setSearchInput('');
                                  setSearchFocused(false);
                                  setIsMobileSearchOpen(false);
                                }}
                                className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {getCategoryIcon(cat.iconName, 'w-3 h-3 text-orange-600')}
                                <span>{cat.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

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

          {/* Right Action Icons - Uncluttered interface centering on the consolidated Menu button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Quick Search Button */}
            <button
              id="mobile-search-trigger-btn"
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="sm:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              aria-label="Search products"
              title="Search products"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Spotlight Search shortcut for desktop (⌘K) */}
            <button
              id="header-spotlight-search-btn"
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Spotlight Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search</span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* CONSOLIDATED PRIMARY MENU BUTTON
                Contains: Home, Products, Categories, Search, Cart, Orders, Payments, Profile,
                Sign In/Sign Up, Themes/Modes, Admin, and Sign Out */}
            <button
              id="main-menu-btn"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer border border-amber-300/40 shrink-0"
              aria-label="Open Navigation Menu"
              title="Menu: Home, Products, Categories, Search, Cart, Orders, Payments, Profile, Sign In/Sign Up, Themes/Modes, Admin, Sign Out"
            >
              {isLoggedIn && currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white/80 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
              )}
              <span className="font-extrabold tracking-tight">Menu</span>

              {/* Dynamic Shopping Cart badge inside Menu button */}
              {cartCount > 0 && (
                <span
                  id="menu-cart-count-badge"
                  className="px-1.5 py-0.5 rounded-full bg-yellow-300 text-orange-950 font-black text-[10px] sm:text-[11px] shadow-xs flex items-center gap-0.5"
                >
                  <ShoppingCart className="w-2.5 h-2.5 inline" />
                  <span>{cartCount}</span>
                </span>
              )}

              {/* Active Orders indicator */}
              {cartCount === 0 && activeOrdersCount > 0 && (
                <span
                  id="menu-active-orders-dot"
                  className="w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-white/40 animate-pulse"
                  title={`${activeOrdersCount} order in transit`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMER SUB-HEADER CATEGORY NAVIGATION BAR */}
      {activeRole === 'customer' && (
        <div className="hidden sm:block border-t border-slate-100 bg-white/95">
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

                      {/* Category Search Input */}
                      <div className="relative mb-3">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="mega-category-search-input"
                          type="text"
                          placeholder="Search categories (e.g., Phones & Tablets)..."
                          value={megaMenuCategorySearch}
                          onChange={(e) => setMegaMenuCategorySearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all"
                        />
                        {megaMenuCategorySearch && (
                          <button
                            type="button"
                            onClick={() => setMegaMenuCategorySearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            title="Clear category search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {filteredMegaCategories.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Layers className="w-6 h-6 mx-auto text-slate-300 mb-1.5" />
                          <p className="font-semibold text-slate-700">No categories matching "{megaMenuCategorySearch}"</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Try searching for "Phones & Tablets", "Tech", or "Shoes"</p>
                          <button
                            type="button"
                            onClick={() => setMegaMenuCategorySearch('')}
                            className="mt-2.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Reset Search
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                          {filteredMegaCategories.map((cat) => {
                            const isSelected = filters.category.toLowerCase() === cat.name.toLowerCase();
                            const count = products.filter((p) => {
                              const pCat = (p.category || '').toLowerCase();
                              const cCat = cat.name.toLowerCase();
                              return (
                                pCat === cCat ||
                                (cCat.includes('phones & tablets') && (pCat.includes('phones & tablets') || pCat.includes('mobile')))
                              );
                            }).length;

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
                      )}
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
                  id="subnav-referrals-btn"
                  onClick={() => setActiveCustomerTab('referrals')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer shadow-xs ${
                    activeCustomerTab === 'referrals'
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-300/40'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Earn ₦5,000</span>
                </button>

                <button
                  id="subnav-stores-btn"
                  onClick={() => setActiveCustomerTab('seller-store')}
                  className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    activeCustomerTab === 'seller-store'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300/40'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Stores</span>
                </button>

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

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenRoleSwitcher={onOpenRoleSwitcher}
      />
    </header>
  );
};
