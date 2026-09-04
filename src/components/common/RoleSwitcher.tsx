import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import { User, Store, ShieldCheck, Check, Sparkles, X, RefreshCw, LogIn, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ isOpen, onClose }) => {
  const { activeRole, currentUser, allUsers, switchRole, resetStoreData, openAuthModal, loginWithGoogle } = useStore();
  const [googleLoadingRole, setGoogleLoadingRole] = useState<UserRole | null>(null);

  if (!isOpen) return null;

  const handleGoogleLoginForRole = async (targetRole: UserRole) => {
    setGoogleLoadingRole(targetRole);
    try {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user && user.email) {
          await loginWithGoogle(
            {
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              avatar:
                user.photoURL ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user.displayName || user.email
                )}`,
            },
            targetRole
          );
          onClose();
          return;
        }
      } catch (popupErr) {
        console.warn('Firebase popup fallback for role:', targetRole, popupErr);
      }
      onClose();
      openAuthModal('login', targetRole);
    } finally {
      setGoogleLoadingRole(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          id="role-switcher-modal"
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
            <button
              id="close-role-switcher-btn"
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Multi-Role Platform Experience
            </div>
            <h2 className="text-xl font-extrabold text-white">Switch Role & User Persona</h2>
            <p className="text-xs text-slate-300 mt-1">
              Experience CartNova from the perspective of a Shopper, Merchant Seller, or HQ Admin.
            </p>
          </div>

          {/* CONTINUE WITH GOOGLE SECTION */}
          <div className="px-6 pt-5 pb-3 bg-slate-50 border-b border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                Continue with Google:
              </span>
              <span className="text-[10px] text-slate-400">1-Click Fast Auth</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Google Shopper */}
              <button
                id="role-switcher-google-shopper-btn"
                type="button"
                disabled={googleLoadingRole !== null}
                onClick={() => handleGoogleLoginForRole('customer')}
                className="p-2.5 bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-400 rounded-xl text-left transition-all cursor-pointer shadow-2xs group flex flex-col items-center text-center disabled:opacity-60"
              >
                {googleLoadingRole === 'customer' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 my-0.5" />
                ) : (
                  <ShoppingBag className="w-4 h-4 text-indigo-600 mb-0.5 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-slate-900 line-clamp-1">Shopper</span>
                <span className="text-[9px] text-indigo-600 font-semibold">Google</span>
              </button>

              {/* Google Merchant */}
              <button
                id="role-switcher-google-merchant-btn"
                type="button"
                disabled={googleLoadingRole !== null}
                onClick={() => handleGoogleLoginForRole('seller')}
                className="p-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-xl text-left transition-all cursor-pointer shadow-2xs group flex flex-col items-center text-center disabled:opacity-60"
              >
                {googleLoadingRole === 'seller' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 my-0.5" />
                ) : (
                  <Store className="w-4 h-4 text-emerald-600 mb-0.5 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-slate-900 line-clamp-1">Merchant</span>
                <span className="text-[9px] text-emerald-600 font-semibold">Google</span>
              </button>

              {/* Google HQ Admin */}
              <button
                id="role-switcher-google-admin-btn"
                type="button"
                disabled={googleLoadingRole !== null}
                onClick={() => handleGoogleLoginForRole('admin')}
                className="p-2.5 bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 rounded-xl text-left transition-all cursor-pointer shadow-2xs group flex flex-col items-center text-center disabled:opacity-60"
              >
                {googleLoadingRole === 'admin' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600 my-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-purple-600 mb-0.5 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-slate-900 line-clamp-1">HQ Admin</span>
                <span className="text-[9px] text-purple-600 font-semibold">Google</span>
              </button>
            </div>
          </div>

          {/* User Persona Cards */}
          <div className="p-6 space-y-3 max-h-[300px] overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Or Switch to Sample Persona:
            </span>
            {allUsers.map((user) => {
              const isSelected = currentUser.id === user.id && activeRole === user.role;

              const getIcon = () => {
                if (user.role === 'admin') return <ShieldCheck className="w-5 h-5 text-purple-600" />;
                if (user.role === 'seller') return <Store className="w-5 h-5 text-emerald-600" />;
                return <User className="w-5 h-5 text-indigo-600" />;
              };

              const getBadge = () => {
                if (user.role === 'admin') {
                  return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">ADMIN</span>;
                }
                if (user.role === 'seller') {
                  return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">SELLER</span>;
                }
                return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">CUSTOMER</span>;
              };

              return (
                <button
                  key={user.id}
                  id={`persona-select-${user.id}`}
                  onClick={() => {
                    switchRole(user.role, user.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center">
                        {getIcon()}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        {getBadge()}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user.storeName ? `Store: ${user.storeName}` : user.email}
                      </p>
                      {user.storeBio && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                          "{user.storeBio}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Direct Sign-In Role Triggers */}
          <div className="px-6 py-3 bg-slate-100/70 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Email & Credentials Sign In:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="role-switcher-signin-customer-btn"
                onClick={() => {
                  onClose();
                  openAuthModal('login', 'customer');
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer shadow-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shopper</span>
              </button>

              <button
                id="role-switcher-signin-merchant-btn"
                onClick={() => {
                  onClose();
                  openAuthModal('login', 'seller');
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer shadow-2xs"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>Merchant</span>
              </button>

              <button
                id="role-switcher-signin-admin-btn"
                onClick={() => {
                  onClose();
                  openAuthModal('login', 'admin');
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-purple-700 transition-colors cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>HQ Admin</span>
              </button>
            </div>
          </div>

          {/* Footer Reset & Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              id="reset-demo-data-btn"
              onClick={() => {
                if (confirm('Reset store data back to initial demo state?')) {
                  resetStoreData();
                  onClose();
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Store Demo Data</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
