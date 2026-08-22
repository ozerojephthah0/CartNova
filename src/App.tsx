import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastContainer } from './components/common/Toast';
import { Header } from './components/common/Header';
import { RoleSwitcher } from './components/common/RoleSwitcher';

// Customer Components
import { HeroBanner } from './components/customer/HeroBanner';
import { CategoryBar } from './components/customer/CategoryBar';
import { FlashDeals } from './components/customer/FlashDeals';
import { ProductGrid } from './components/customer/ProductGrid';
import { OrdersView } from './components/customer/OrdersView';
import { WishlistView } from './components/customer/WishlistView';
import { CustomerProfileView } from './components/customer/CustomerProfileView';
import { NotificationsView } from './components/customer/NotificationsView';
import { CustomerSupportView } from './components/customer/CustomerSupportView';
import { SeasonalEventsView } from './components/customer/SeasonalEventsView';
import { SeasonalEventBanner } from './components/customer/SeasonalEventBanner';
import { SeasonalEventModal } from './components/customer/SeasonalEventModal';
import { LiveSupportWidget } from './components/customer/LiveSupportWidget';
import { ProductDetailPage } from './components/customer/ProductDetailPage';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { AiAssistantModal } from './components/customer/AiAssistantModal';
import { AuthModal } from './components/customer/AuthModal';
import { QuickSearchModal } from './components/customer/QuickSearchModal';

// Temu & Amazon Features
import { TemuSpinWheelModal } from './components/customer/TemuSpinWheelModal';
import { TemuPriceSlashBar } from './components/customer/TemuPriceSlashBar';
import { TemuBargainZone } from './components/customer/TemuBargainZone';
import { PriceSlashModal } from './components/customer/PriceSlashModal';
import { MysteryBoxModal } from './components/customer/MysteryBoxModal';
import { NovaPrimeModal } from './components/customer/NovaPrimeModal';
import { OneClickBuyModal } from './components/customer/OneClickBuyModal';
import { LivePackageTrackerModal } from './components/customer/LivePackageTrackerModal';

// Seller & Admin
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Headphones,
  ShoppingBag,
  Store,
  Gift,
  Zap,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeRole, activeCustomerTab, currentUser, setActiveCustomerTab } = useStore();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-main)] flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Universal Sticky Header */}
      <Header
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onOpenSpinWheel={() => setIsSpinWheelOpen(true)}
      />

      {/* Main Container View Based on Active Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <>
            {activeCustomerTab === 'shop' && (
              <div>
                {/* Seasonal Events Promotional Banner Strip (20% OFF Guaranteed) */}
                <SeasonalEventBanner />

                {/* Temu Trust & Price Slash Bar */}
                <TemuPriceSlashBar onOpenSpinWheel={() => setIsSpinWheelOpen(true)} />

                {/* Hero Banner with Spin & Win CTA */}
                <HeroBanner onOpenSpinWheel={() => setIsSpinWheelOpen(true)} />

                {/* Flash Deals with Lightning Slashing */}
                <FlashDeals />

                {/* Temu Bargain Zone */}
                <TemuBargainZone />

                {/* Category Explorer */}
                <CategoryBar />

                {/* Product Catalog Grid */}
                <ProductGrid />
              </div>
            )}

            {activeCustomerTab === 'seasonal-events' && <SeasonalEventsView />}

            {activeCustomerTab === 'product-detail' && <ProductDetailPage />}

            {activeCustomerTab === 'orders' && <OrdersView />}

            {activeCustomerTab === 'wishlist' && <WishlistView />}

            {activeCustomerTab === 'profile' && <CustomerProfileView />}

            {activeCustomerTab === 'notifications' && <NotificationsView />}

            {activeCustomerTab === 'support' && <CustomerSupportView />}
          </>
        )}

        {/* SELLER VIEW */}
        {activeRole === 'seller' && <SellerDashboard />}

        {/* ADMIN VIEW */}
        {activeRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Floating Temu Spin & Win Launcher Button */}
      {activeRole === 'customer' && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
          <button
            id="floating-spin-win-btn"
            onClick={() => setIsSpinWheelOpen(true)}
            className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 border-2 border-yellow-300 transform hover:scale-108 active:scale-95 transition-all cursor-pointer animate-bounce"
            title="Spin Lucky Wheel for $100 Voucher Bundle"
          >
            <div className="relative">
              <Gift className="w-5 h-5 text-yellow-200 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping" />
            </div>
            <span className="font-black text-xs uppercase tracking-wider text-yellow-100">
              Spin & Win $100
            </span>
          </button>
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80 text-xs">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">CartNova</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The next-generation marketplace — Shop like a trillionaire with factory direct pricing, free shipping, and 90-day free returns.
              </p>
              <div className="flex items-center gap-2 text-orange-400 font-semibold pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Shop Like a Trillionaire</span>
              </div>
            </div>

            {/* Marketplace */}
            <div className="space-y-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                CartNova Categories
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Audio & Wireless Earbuds
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Smart Tech & Keyboards
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Footwear & Football Boots
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Fashion, Apparel & Bags
                  </button>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Customer Care & Hubs
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    onClick={() => {
                      setActiveCustomerTab('seasonal-events');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-300 text-amber-400 transition-colors cursor-pointer font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🎉 Seasonal Events (20% OFF)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsSpinWheelOpen(true)}
                    className="hover:text-yellow-300 text-yellow-400 transition-colors cursor-pointer font-bold flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Spin & Win $100 Bundle</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveCustomerTab('support');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Headphones className="w-3 h-3 text-cyan-400" />
                    <span>24/7 Customer Care & Support</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsRoleSwitcherOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Store className="w-3 h-3 text-emerald-400" />
                    <span>Merchant Seller Hub</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Buyer Trust Guarantees */}
            <div className="space-y-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                CartNova Guarantees
              </span>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Free Express Shipping On All Items</span>
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>90-Day Free Returns & Refunds</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Price Adjustment Guarantee</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 CartNova • Shop Like a Trillionaire. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-300 font-medium text-[11px]">
                Viewing as <strong>{currentUser.name}</strong> ({activeRole.toUpperCase()})
              </span>
              <button
                onClick={() => setIsRoleSwitcherOpen(true)}
                className="text-orange-400 hover:text-orange-300 font-bold ml-1 cursor-pointer"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <RoleSwitcher isOpen={isRoleSwitcherOpen} onClose={() => setIsRoleSwitcherOpen(false)} />
      <TemuSpinWheelModal isOpen={isSpinWheelOpen} onClose={() => setIsSpinWheelOpen(false)} />
      <PriceSlashModal />
      <MysteryBoxModal />
      <NovaPrimeModal />
      <SeasonalEventModal />
      <OneClickBuyModal />
      <LivePackageTrackerModal />
      <AuthModal />
      <QuickSearchModal />
      <CartDrawer />
      <CheckoutModal />
      <ProductDetailModal />
      <AiAssistantModal />
      {activeRole === 'customer' && <LiveSupportWidget />}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
