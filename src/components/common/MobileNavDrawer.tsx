import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ThemeMode, Product } from '../../types';
import {
  X,
  Home,
  ShoppingBag,
  Layers,
  Search,
  ShoppingCart,
  Package,
  CreditCard,
  User,
  LogIn,
  UserPlus,
  Palette,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Terminal,
  Smartphone,
  Tablet,
  Headphones,
  Laptop,
  Shirt,
  Gamepad2,
  Watch,
  Tv,
  Dumbbell,
  Baby,
  BookOpen,
  Car,
  Radio,
  Apple,
  Cpu,
  UtensilsCrossed,
  Gift,
  Swords,
  Crown,
  Truck,
  Bell,
  LifeBuoy,
  Store,
  Wallet,
  Zap,
  Tag,
  Star,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoleSwitcher: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenRoleSwitcher,
}) => {
  const {
    currentUser,
    isLoggedIn,
    activeRole,
    activeCustomerTab,
    setActiveCustomerTab,
    categories,
    filters,
    setFilters,
    products,
    wishlist,
    unreadNotificationsCount,
    openAuthModal,
    loginWithGoogle,
    logout,
    openSpinWheel,
    freeSpinsLeft,
    orders,
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    formatPrice,
    setIsCartOpen,
    walletBalance,
    creditWallet,
    setIsSlashModalOpen,
    setIsMysteryBoxOpen,
    setIsNovaPrimeModalOpen,
    isNovaPrime,
    setIsTrackingModalOpen,
    currentCurrency,
    setCurrency,
    setIsAiAssistantOpen,
    setIsSearchModalOpen,
    executeSearch,
    themeMode,
    setThemeMode,
    themeOptions,
    addToast,
    referralData,
    popularSearches,
  } = useStore();

  const [localSearch, setLocalSearch] = useState('');
  const [localCategorySearch, setLocalCategorySearch] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('section-home');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when full-screen menu is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Track active section for quick-jump highlight
  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      executeSearch(localSearch.trim());
      onClose();
      setActiveCustomerTab('shop');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        addToast('success', 'Google Sign-In Successful', 'Welcome to CartNova! You are now logged in.');
      }
    } catch {
      openAuthModal('login', 'customer');
    }
    onClose();
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    addToast('success', 'Added to Cart', `${product.title} has been added to your shopping cart.`);
  };

  const handleTopUpWallet = (amount: number) => {
    creditWallet(amount, 'Quick Deposit via Menu Payments');
    addToast('success', 'Wallet Credited', `Added ${formatPrice(amount)} to your CartNova Wallet.`);
  };

  const getThemeIcon = (id: ThemeMode, iconClass = 'w-4 h-4') => {
    switch (id) {
      case 'light':
        return <Sun className={`${iconClass} text-amber-500`} />;
      case 'dark':
        return <Moon className={`${iconClass} text-indigo-400`} />;
      case 'midnight':
        return <Sparkles className={`${iconClass} text-cyan-400`} />;
      case 'warm-sepia':
        return <Coffee className={`${iconClass} text-amber-700`} />;
      case 'cyberpunk':
        return <Terminal className={`${iconClass} text-emerald-400`} />;
      default:
        return <Palette className={`${iconClass} text-orange-500`} />;
    }
  };

  const getCategoryIcon = (iconName: string, iconClass = 'w-4 h-4') => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className={iconClass} />;
      case 'Tablet':
      case 'Tablets':
      case 'Tablets & iPads':
        return <Tablet className={iconClass} />;
      case 'ShoppingBag':
        return <ShoppingBag className={iconClass} />;
      case 'Headphones':
        return <Headphones className={iconClass} />;
      case 'Laptop':
        return <Laptop className={iconClass} />;
      case 'Home':
        return <Home className={iconClass} />;
      case 'Shirt':
        return <Shirt className={iconClass} />;
      case 'Gamepad2':
        return <Gamepad2 className={iconClass} />;
      case 'Watch':
        return <Watch className={iconClass} />;
      case 'Tv':
        return <Tv className={iconClass} />;
      case 'Dumbbell':
        return <Dumbbell className={iconClass} />;
      case 'Baby':
        return <Baby className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Car':
        return <Car className={iconClass} />;
      case 'Radio':
        return <Radio className={iconClass} />;
      case 'Apple':
        return <Apple className={iconClass} />;
      case 'Cpu':
        return <Cpu className={iconClass} />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className={iconClass} />;
      default:
        return <Layers className={iconClass} />;
    }
  };

  const currencies = [
    { code: 'NGN', name: '₦ NGN (Naira)' },
    { code: 'USD', name: '$ USD (US Dollar)' },
    { code: 'EUR', name: '€ EUR (Euro)' },
    { code: 'GBP', name: '£ GBP (British Pound)' },
  ];

  // Pick top trending items for quick shelf
  const trendingDeals = products.filter((p) => p.isTrending || p.isFlashDeal).slice(0, 3);
  const featuredQuickItems = trendingDeals.length >= 3 ? trendingDeals : products.slice(0, 3);

  // Active in-transit order check
  const inTransitOrder = orders.find((o) => o.status === 'shipped' || o.status === 'processing');

  // Filtered categories for menu drawer with case-insensitive & alias-aware matching
  const displayedDrawerCategories = categories.filter((cat) => {
    if (!localCategorySearch.trim()) return true;
    const q = localCategorySearch.trim().toLowerCase();
    const qClean = q.replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
    const name = cat.name.toLowerCase();
    const nameClean = name.replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
    const slugClean = cat.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const descClean = (cat.description || '').toLowerCase();
    return (
      name.includes(q) ||
      nameClean.includes(qClean) ||
      slugClean.includes(qClean) ||
      descClean.includes(q)
    );
  });

  // Quick navigation chips for all 12 sections
  const quickJumpSections = [
    { id: 'section-home', label: 'Home', icon: Home },
    { id: 'section-products', label: 'Products', icon: ShoppingBag },
    { id: 'section-categories', label: 'Categories', icon: Layers },
    { id: 'section-search', label: 'Search', icon: Search },
    { id: 'section-cart', label: `Cart (${cartCount})`, icon: ShoppingCart },
    { id: 'section-orders', label: `Orders (${orders.length})`, icon: Package },
    { id: 'section-payments', label: 'Payments', icon: CreditCard },
    { id: 'section-profile', label: 'Profile', icon: User },
    { id: 'section-auth', label: isLoggedIn ? 'Account' : 'Sign In', icon: isLoggedIn ? User : LogIn },
    { id: 'section-themes', label: 'Themes', icon: Palette },
    { id: 'section-admin', label: 'Admin', icon: ShieldCheck },
    { id: 'section-signout', label: isLoggedIn ? 'Sign Out' : 'Status', icon: LogOut },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/80 backdrop-blur-md flex flex-col overflow-hidden"
        id="menu-modal-container"
      >
        {/* Full-Screen Modern Navigation Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.99, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          id="menu-navigation-drawer"
          className="relative w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-hidden shadow-2xl"
        >
          {/* Top Panel Header (Full-Screen Hero Header) */}
          <header className="px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shrink-0 shadow-md">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs border border-white/30 shrink-0">
                  CN
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-black text-lg sm:text-2xl leading-tight tracking-tight text-white drop-shadow-xs">
                      CartNova Navigation
                    </h2>
                    <span className="text-[10px] sm:text-xs font-black bg-white/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-orange-50 border border-white/25">
                      {isLoggedIn ? `${currentUser.role.toUpperCase()} MODE` : 'GUEST MODE'}
                    </span>
                    <span className="hidden md:inline-flex text-[11px] font-bold bg-black/20 text-orange-100 px-2 py-0.5 rounded-full">
                      {products.length} Products • {categories.length} Categories
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-orange-100 font-medium mt-0.5 truncate">
                    Complete Store Directory: Catalog, Shopping Bag, Orders, Wallet & Immediate Controls
                  </p>
                </div>
              </div>

              {/* Close Button & Shortcut Indicator */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-orange-100 bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/15">
                  <kbd className="font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">ESC</kbd>
                  <span>to close</span>
                </div>

                <button
                  id="close-menu-drawer-btn"
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white font-black text-xs sm:text-sm transition-all cursor-pointer shadow-sm border border-white/30 focus:outline-hidden focus:ring-2 focus:ring-white/60"
                  aria-label="Close navigation menu"
                  title="Close Full-Screen Menu (Esc)"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                  <span className="font-black tracking-tight">Close</span>
                </button>
              </div>
            </div>

            {/* Quick-Jump Section Navigator Strip */}
            <div className="max-w-7xl mx-auto w-full mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
                {quickJumpSections.map((sec, idx) => {
                  const Icon = sec.icon;
                  const isActive = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-white text-orange-700 shadow-md font-black ring-2 ring-white/60 scale-105'
                          : 'bg-black/25 hover:bg-white/20 text-orange-50 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 font-mono">{idx + 1}.</span>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* Main Full-Screen Scrollable Content Panel */}
          <main
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-slate-50 dark:bg-slate-950"
          >
            <div className="max-w-7xl mx-auto space-y-8 divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {/* ========================================================================= */}
            {/* 1. HOME SECTION                                                           */}
            {/* ========================================================================= */}
            <section id="section-home" className="pt-2 first:pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Home
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Storefront, hero campaigns & daily highlights
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live Storefront
                </span>
              </div>

              {/* Primary Home Action Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="menu-nav-home-btn"
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', searchQuery: '', subcategory: '' }));
                    setActiveCustomerTab('shop');
                    onClose();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/60 border border-orange-200 dark:border-slate-700 hover:border-orange-400 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-orange-900 dark:text-orange-200 group-hover:text-orange-600">
                      Go to Home Storefront
                    </span>
                    <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Reset filters & view hero deals, flash sale & catalog
                  </p>
                </button>

                <button
                  id="menu-nav-seasonal-btn"
                  type="button"
                  onClick={() => {
                    setActiveCustomerTab('seasonal-events');
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-900 dark:text-amber-200 group-hover:text-amber-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Seasonal Events (20% OFF)
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Guaranteed seasonal vouchers & curated holiday bundles
                  </p>
                </button>
              </div>

              {/* Bonus Quick Action Strips */}
              <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openSpinWheel();
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Gift className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                  <span className="text-[11px] font-bold block text-slate-800 dark:text-slate-200">Free Spins</span>
                  <span className="text-[9px] text-slate-500">{freeSpinsLeft} Available</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsSlashModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Swords className="w-4 h-4 mx-auto text-red-500 mb-1" />
                  <span className="text-[11px] font-bold block text-slate-800 dark:text-slate-200">Price Slash</span>
                  <span className="text-[9px] text-red-600 font-bold">Cut to ₦0</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsNovaPrimeModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                  <span className="text-[11px] font-bold block text-slate-800 dark:text-slate-200">Nova Prime</span>
                  <span className="text-[9px] text-blue-600 font-bold">{isNovaPrime ? 'Active 👑' : 'VIP Pass'}</span>
                </button>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 2. PRODUCTS SECTION                                                       */}
            {/* ========================================================================= */}
            <section id="section-products" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Products
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Explore {products.length} products, deals & bestseller collections
                    </p>
                  </div>
                </div>

                <button
                  id="menu-view-all-products-btn"
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', searchQuery: '', subcategory: '' }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>All ({products.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Direct Product Filtering Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', onSaleOnly: true }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Tag className="w-3.5 h-3.5 text-rose-500" />
                    <span>Flash Deals</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Discounts up to 60%</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', featuredOnly: true }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Trending</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Top customer picks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', inStockOnly: true }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>In Stock</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Ready to ship now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', freeShippingOnly: true }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Free Shipping</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Zero delivery fee</span>
                </button>

                <button
                  type="button"
                  id="menu-quick-phones-tablets-btn"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'Phones & Tablets', searchQuery: '' }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 hover:border-orange-400 text-left transition-colors cursor-pointer col-span-2 sm:col-span-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-800 dark:text-orange-200">
                      <Smartphone className="w-4 h-4 text-orange-600" />
                      <span>Explore Phones & Tablets Collection</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200/80 text-orange-900 dark:bg-orange-900/80 dark:text-orange-100">
                      Top Rated
                    </span>
                  </div>
                </button>
              </div>

              {/* Hot Picks Preview Shelf */}
              <div className="pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Featured Product Highlights
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {featuredQuickItems.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[180px]">
                            {prod.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-orange-600 dark:text-orange-400">
                              {formatPrice(prod.price)}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">{prod.brand}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod)}
                        className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. CATEGORIES SECTION                                                     */}
            {/* ========================================================================= */}
            <section id="section-categories" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Categories
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {categories.length} Departments — Select to filter instantly
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: 'all', searchQuery: '' }));
                    setActiveCustomerTab('shop');
                    onClose();
                  }}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>

              {/* Integrated Category Search Bar in Menu */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="menu-category-filter-search"
                  type="text"
                  placeholder="Filter categories (e.g., Phones & Tablets, Shoes, Fashion)..."
                  value={localCategorySearch}
                  onChange={(e) => setLocalCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 transition-colors"
                />
                {localCategorySearch && (
                  <button
                    type="button"
                    onClick={() => setLocalCategorySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {displayedDrawerCategories.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No categories found matching "{localCategorySearch}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setLocalCategorySearch('')}
                    className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Reset category search
                  </button>
                </div>
              ) : (
                /* Multi-Column Responsive Categories Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {displayedDrawerCategories.map((cat) => {
                    const isSelected =
                      filters.category.toLowerCase() === cat.name.toLowerCase() ||
                      filters.category.toLowerCase() === cat.slug.toLowerCase();
                    const count = products.filter((p) => {
                      const pCat = (p.category || '').toLowerCase();
                      const cCat = cat.name.toLowerCase();
                      return (
                        pCat === cCat ||
                        (cCat.includes('phones & tablets') &&
                          (pCat.includes('phones & tablets') || pCat.includes('mobile')))
                      );
                    }).length;

                    return (
                      <button
                        key={cat.id}
                        id={`menu-cat-${cat.slug}`}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, category: cat.name, searchQuery: '', subcategory: '' }));
                          setActiveCustomerTab('shop');
                          onClose();
                        }}
                        className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-400 text-orange-700 dark:text-orange-300 font-bold shadow-xs ring-1 ring-orange-400'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-orange-600 text-white'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                          </div>
                          <span className="text-xs truncate">{cat.name}</span>
                        </div>

                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 ml-1">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ========================================================================= */}
            {/* 4. SEARCH SECTION                                                         */}
            {/* ========================================================================= */}
            <section id="section-search" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Search
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Find products, electronics, brands and specifications
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsSearchModalOpen(true);
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Spotlight (⌘K)</span>
                </button>
              </div>

              {/* Integrated Search Input Form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  id="menu-quick-search-input"
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products, brands (Sony, Samsung, LG)..."
                  className="w-full pl-9 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                
                <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => setLocalSearch('')}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Popular Search Terms Chips */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.slice(0, 8).map((query, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        executeSearch(query);
                        onClose();
                        setActiveCustomerTab('shop');
                      }}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. CART SECTION                                                           */}
            {/* ========================================================================= */}
            <section id="section-cart" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Cart
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cartCount} {cartCount === 1 ? 'item' : 'items'} in your active bag
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                  Subtotal: {formatPrice(cartSubtotal)}
                </span>
              </div>

              {/* Cart Details Card & Items */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Order Subtotal: </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>

                  <button
                    id="menu-open-checkout-cart-btn"
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsCartOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Full Cart & Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items in Cart */}
                {cart.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-700/60">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[160px] sm:max-w-[240px]">
                              {item.title}
                            </p>
                            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-600"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-600"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    Your cart is currently empty. Tap products above to add items!
                  </div>
                )}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 6. ORDERS SECTION                                                         */}
            {/* ========================================================================= */}
            <section id="section-orders" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Orders
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tracking, dispatch status & purchase history
                    </p>
                  </div>
                </div>

                <button
                  id="menu-view-orders-btn"
                  type="button"
                  onClick={() => {
                    setActiveCustomerTab('orders');
                    onClose();
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({orders.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* In-Transit Radar or Order Guarantee Card */}
              {inTransitOrder ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                        Order #{inTransitOrder.id.slice(-6).toUpperCase()} in transit
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        Status: {inTransitOrder.status.toUpperCase()} • Carrier dispatched
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsTrackingModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer shrink-0"
                  >
                    Track GPS
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Fast 1-Day Dispatch & Delivery Guarantee
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsTrackingModalOpen(true);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Live Radar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </section>

            {/* ========================================================================= */}
            {/* 7. PAYMENTS SECTION                                                       */}
            {/* ========================================================================= */}
            <section id="section-payments" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Payments
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Wallet balance, payment methods & currency settings
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Instant Deposit
                </span>
              </div>

              {/* Wallet Balance & Quick Top-Up Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      CartNova Digital Wallet
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(walletBalance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTopUpWallet(5000)}
                      className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer shadow-2xs"
                    >
                      +₦5,000
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTopUpWallet(10000)}
                      className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer shadow-2xs"
                    >
                      +₦10,000
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTopUpWallet(25000)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-2xs"
                    >
                      +₦25,000
                    </button>
                  </div>
                </div>

                {/* Accepted Payment Methods */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Accepted Payment Channels:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                      💳 Visa / Mastercard / Verve
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                      🏦 Direct Bank Transfer
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                      💵 Cash on Delivery
                    </span>
                  </div>
                </div>

                {/* Currency Switcher in Payments */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Display Currency:</span>
                  <select
                    value={currentCurrency.code}
                    onChange={(e) => {
                      const found = currencies.find((c) => c.code === e.target.value);
                      if (found) setCurrency({ code: found.code as any, symbol: found.name.split(' ')[0], name: found.name, rate: 1 });
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code} className="dark:bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 8. PROFILE SECTION                                                        */}
            {/* ========================================================================= */}
            <section id="section-profile" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Profile
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Account identity, member rewards & personal preferences
                    </p>
                  </div>
                </div>

                <button
                  id="menu-open-profile-btn"
                  type="button"
                  onClick={() => {
                    setActiveCustomerTab('profile');
                    onClose();
                  }}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Overview Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-violet-500/40 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {currentUser.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 uppercase">
                          {currentUser.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
                        {currentUser.email || 'Customer Profile'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Reward Points</span>
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                      {referralData?.rewardPoints ? referralData.rewardPoints.toLocaleString() : '3,450'} pts
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCustomerTab('wishlist');
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-violet-400 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 block">Wishlist</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{wishlist.length} Items</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCustomerTab('notifications');
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-violet-400 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 block">Alerts</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{unreadNotificationsCount} New</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 9. SIGN IN / SIGN UP SECTION                                              */}
            {/* ========================================================================= */}
            <section id="section-auth" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Sign In / Sign Up
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Authentication, Google 1-Click access & credentials
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                  {isLoggedIn ? 'Active Session' : '₦5,000 Welcome Bonus'}
                </span>
              </div>

              {!isLoggedIn ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Sign in to sync your cart across devices, view order tracking, and earn cash rewards.
                  </p>

                  {/* Primary Google Sign In Button */}
                  <button
                    id="menu-google-auth-btn"
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>Continue with Google (1-Click)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="menu-direct-signin-btn"
                      type="button"
                      onClick={() => {
                        onClose();
                        openAuthModal('login', 'customer');
                      }}
                      className="py-2.5 px-3 bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Sign In</span>
                    </button>

                    <button
                      id="menu-direct-signup-btn"
                      type="button"
                      onClick={() => {
                        onClose();
                        openAuthModal('signup', 'customer');
                      }}
                      className="py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Signed in as {currentUser.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentUser.email} • Verified Account
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRoleSwitcher();
                    }}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Switch Account
                  </button>
                </div>
              )}
            </section>

            {/* ========================================================================= */}
            {/* 10. THEMES & MODES SECTION                                                */}
            {/* ========================================================================= */}
            <section id="section-themes" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Themes & Modes
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Light mode, dark mode, OLED midnight, warm sepia & palettes
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300">
                  {themeOptions.length} Modes
                </span>
              </div>

              {/* 1-Tap Quick Toggle Row: Light vs Dark */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="menu-theme-btn-light"
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-white text-slate-900 border-amber-400 shadow-xs ring-1 ring-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-amber-600 ml-auto" />}
                </button>

                <button
                  id="menu-theme-btn-dark"
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-slate-900 text-white border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
                </button>
              </div>

              {/* All Visual Themes Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    id={`menu-theme-swatch-${opt.id}`}
                    type="button"
                    onClick={() => setThemeMode(opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer border ${
                      themeMode === opt.id
                        ? 'bg-white dark:bg-slate-900 border-2 border-orange-500 dark:border-orange-400 shadow-xs ring-1 ring-orange-400/50'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: opt.bgHex,
                          borderColor: `${opt.accentHex}40`,
                        }}
                      >
                        {getThemeIcon(opt.id, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {opt.name}
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    {themeMode === opt.id && (
                      <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 11. ADMIN SECTION                                                         */}
            {/* ========================================================================= */}
            <section id="section-admin" className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Admin
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Staff portal, catalog management & moderation
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 uppercase">
                  Staff Control
                </span>
              </div>

              {/* Admin Portal Action Card */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-purple-900 dark:text-purple-200">
                      Store Operations & Inventory Control
                    </h4>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      Manage product listings, fulfill pending orders, and review store statistics.
                    </p>
                  </div>
                </div>

                <button
                  id="menu-admin-portal-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    if (activeRole === 'admin') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      openAuthModal('login', 'admin');
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {activeRole === 'admin' ? 'Active Admin Dashboard' : 'Sign In to Admin Portal'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 12. SIGN OUT SECTION                                                      */}
            {/* ========================================================================= */}
            <section id="section-signout" className="pt-5 space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Sign Out
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Secure account sign out and session termination
                    </p>
                  </div>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                      End current session for {currentUser.name}?
                    </span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">
                      Your bag items and order history will remain securely saved.
                    </span>
                  </div>

                  <button
                    id="menu-sign-out-action-btn"
                    type="button"
                    onClick={() => {
                      logout();
                      onClose();
                      addToast('info', 'Signed Out', 'You have been safely signed out of CartNova.');
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Currently browsing in guest mode.</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal('login', 'customer');
                    }}
                    className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign In Now
                  </button>
                </div>
              )}
            </section>
            </div>
          </main>

          {/* Full-Screen Footer Bar with Quick Actions & Persistent Close Button */}
          <footer className="px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 shadow-xs z-10">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCustomerTab('support');
                    onClose();
                  }}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 font-bold cursor-pointer transition-colors"
                >
                  <LifeBuoy className="w-4 h-4 text-orange-500" />
                  <span className="hidden sm:inline">Need assistance?</span>
                  <span>24/7 Live Support</span>
                </button>

                {cartCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsCartOpen(true);
                    }}
                    className="hidden md:flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cart: {formatPrice(cartSubtotal)} ({cartCount})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  id="menu-footer-close-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Dismiss Fullscreen Menu</span>
                </button>
              </div>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
