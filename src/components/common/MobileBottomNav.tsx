import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  LayoutGrid,
  Heart,
  ShoppingCart,
  User,
  Package,
  Gift,
  Sparkles,
  Store,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenCategories?: () => void;
  onOpenRoleSwitcher: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCategories,
  onOpenRoleSwitcher,
}) => {
  const {
    activeRole,
    activeCustomerTab,
    setActiveCustomerTab,
    cartCount,
    wishlist,
    freeSpinsLeft,
    setIsCartOpen,
    openSpinWheel,
    isLoggedIn,
    openAuthModal,
    currentUser,
  } = useStore();

  if (activeRole === 'customer') {
    return (
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-lg px-2 py-1.5 safe-area-pb"
      >
        <div className="flex items-center justify-around">
          {/* Shop / Home */}
          <button
            id="mobile-nav-shop"
            onClick={() => {
              setActiveCustomerTab('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeCustomerTab === 'shop'
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Home className={`w-5 h-5 ${activeCustomerTab === 'shop' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* Categories */}
          <button
            id="mobile-nav-categories"
            onClick={() => {
              if (onOpenCategories) {
                onOpenCategories();
              } else {
                setActiveCustomerTab('shop');
                const catElem = document.getElementById('category-bar-section');
                catElem?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
          >
            <LayoutGrid className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
          </button>

          {/* Spin & Win Center Highlight */}
          <button
            id="mobile-nav-spin"
            onClick={openSpinWheel}
            className="flex flex-col items-center justify-center flex-1 py-0.5 px-1 relative -mt-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-white dark:border-slate-900 group-active:scale-95 transition-transform animate-pulse">
              <Gift className="w-5 h-5 text-white" />
              {freeSpinsLeft > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-300 text-orange-950 font-black text-[9px] flex items-center justify-center border border-white">
                  {freeSpinsLeft}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 mt-0.5">Win $100</span>
          </button>

          {/* Wishlist */}
          <button
            id="mobile-nav-wishlist"
            onClick={() => setActiveCustomerTab('wishlist')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
              activeCustomerTab === 'wishlist'
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Heart className={`w-5 h-5 ${activeCustomerTab === 'wishlist' ? 'fill-orange-600 stroke-orange-600' : 'stroke-2'}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Wishlist</span>
          </button>

          {/* Cart */}
          <button
            id="mobile-nav-cart"
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-all relative cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 stroke-2" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-orange-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Cart</span>
          </button>

          {/* Account / Orders */}
          <button
            id="mobile-nav-account"
            onClick={() => {
              if (!isLoggedIn) {
                openAuthModal('login', 'customer');
              } else {
                setActiveCustomerTab('profile');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeCustomerTab === 'profile' || activeCustomerTab === 'orders'
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {isLoggedIn ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-orange-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-5 h-5 stroke-2" />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[45px]">
              {isLoggedIn ? 'Account' : 'Log In'}
            </span>
          </button>
        </div>
      </nav>
    );
  }

  // Seller Bottom Nav
  if (activeRole === 'seller') {
    return (
      <nav
        id="mobile-bottom-nav-seller"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-800 px-3 py-2"
      >
        <div className="flex items-center justify-around text-xs">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-1 text-emerald-400 font-bold"
          >
            <Store className="w-5 h-5" />
            <span>Store Hub</span>
          </button>
          <button
            onClick={onOpenRoleSwitcher}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
          >
            <Zap className="w-5 h-5" />
            <span>Switch Role</span>
          </button>
        </div>
      </nav>
    );
  }

  // Admin Bottom Nav
  if (activeRole === 'admin') {
    return (
      <nav
        id="mobile-bottom-nav-admin"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 text-white backdrop-blur-md border-t border-purple-900/50 px-3 py-2"
      >
        <div className="flex items-center justify-around text-xs">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-1 text-purple-400 font-bold"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Admin Center</span>
          </button>
          <button
            onClick={onOpenRoleSwitcher}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
          >
            <Zap className="w-5 h-5" />
            <span>Switch Role</span>
          </button>
        </div>
      </nav>
    );
  }

  return null;
};
