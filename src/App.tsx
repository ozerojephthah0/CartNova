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
import { LiveSupportWidget } from './components/customer/LiveSupportWidget';
import { ProductDetailPage } from './components/customer/ProductDetailPage';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { AiAssistantModal } from './components/customer/AiAssistantModal';
import { AuthModal } from './components/customer/AuthModal';
import { QuickSearchModal } from './components/customer/QuickSearchModal';

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
  User,
  Heart,
  Package,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeRole, activeCustomerTab, currentUser, setActiveCustomerTab } = useStore();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Universal Sticky Header */}
      <Header onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} />

      {/* Main Container View Based on Active Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <>
            {activeCustomerTab === 'shop' && (
              <div>
                <HeroBanner />
                <FlashDeals />
                <CategoryBar />
                <ProductGrid />
              </div>
            )}

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

      {/* Global Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80 text-xs">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">CartNova</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The next-generation digital marketplace connecting conscious customers with verified boutique tech and lifestyle merchants worldwide.
              </p>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Gemini 3.7 Flash</span>
              </div>
            </div>

            {/* Marketplace */}
            <div className="space-y-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Marketplace
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Audio & Wearables
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Computer & Mechanical Keyboards
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Smart Home & Ambient Lighting
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveCustomerTab('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Apparel & Everyday Carry
                  </button>
                </li>
              </ul>
            </div>

            {/* Multi-Role Quick Switch */}
            <div className="space-y-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Platform Views
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    onClick={() => {
                      if (activeRole === 'customer') {
                        setActiveCustomerTab('profile');
                      } else {
                        setIsRoleSwitcherOpen(true);
                      }
                    }}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>Customer Profile & Hub</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveCustomerTab('orders');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Package className="w-3 h-3 text-blue-400" />
                    <span>My Orders & Live Tracking</span>
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
                <li>
                  <button
                    onClick={() => setIsRoleSwitcherOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                    <span>Platform Admin Command</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Buyer Trust Guarantees */}
            <div className="space-y-2.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Nova Assurance
              </span>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Buyer Protection & Warranty</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Tracked Express Shipping</span>
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 CartNova Marketplace, Inc. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-300 font-medium text-[11px]">
                Viewing as <strong>{currentUser.name}</strong> ({activeRole.toUpperCase()})
              </span>
              <button
                onClick={() => setIsRoleSwitcherOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 cursor-pointer"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <RoleSwitcher isOpen={isRoleSwitcherOpen} onClose={() => setIsRoleSwitcherOpen(false)} />
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
