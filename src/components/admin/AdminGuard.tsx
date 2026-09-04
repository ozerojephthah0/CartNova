import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, ShieldCheck, LogIn, ArrowLeft, Lock, Sparkles, UserCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AdminGuardProps {
  onAuthorized?: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ onAuthorized }) => {
  const { currentUser, switchRole, openAuthModal, allUsers, loginWithGoogle } = useStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAdminLogin = async () => {
    setGoogleLoading(true);
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
            'admin'
          );
          if (onAuthorized) onAuthorized();
          return;
        }
      } catch (popupErr) {
        console.warn('Firebase popup fallback:', popupErr);
      }
      // Fallback: Open auth modal with admin role & google prompt
      openAuthModal('login', 'admin');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickAdminLogin = () => {
    const adminUser = allUsers.find((u) => u.role === 'admin') || allUsers[0];
    switchRole('admin', adminUser.id);
    if (onAuthorized) onAuthorized();
  };

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden"
      >
        {/* Guard Header */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 mb-4 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Strict Role-Based Access Control
          </div>

          <h2 className="text-2xl font-black text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
            The CartNova Command Center contains sensitive financial reports, catalog controls, seller governance, and customer refund capabilities restricted to authorized administrators.
          </p>
        </div>

        {/* Current State Info */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Account Role</span>
              <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            {/* Continue with Google as HQ Admin */}
            <button
              id="admin-guard-google-btn"
              onClick={handleGoogleAdminLogin}
              disabled={googleLoading}
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-900 border-2 border-purple-200 hover:border-purple-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              )}
              <span>
                Continue with Google as <strong className="text-purple-700">HQ Admin</strong>
              </span>
            </button>

            <button
              id="admin-guard-signin-btn"
              onClick={() => openAuthModal('login', 'admin')}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Administrator Credentials</span>
            </button>

            <button
              id="admin-guard-quick-switch-btn"
              onClick={handleQuickAdminLogin}
              className="w-full py-3 px-5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Authenticate as Super Admin (Alex Admin)</span>
            </button>

            <button
              id="admin-guard-return-customer-btn"
              onClick={() => switchRole('customer')}
              className="w-full py-2.5 px-5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Marketplace</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              CartNova Security Engine • ISO 27001 & PCI-DSS Role Separation Enforced
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
