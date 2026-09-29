import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Store,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  LogIn,
} from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AccessDeniedPageProps {
  attemptedPath?: string;
  requiredRole?: UserRole;
  onNavigateHome?: () => void;
  onOpenLogin?: (role?: UserRole) => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  attemptedPath = '/admin',
  requiredRole = 'admin',
  onNavigateHome,
  onOpenLogin,
}) => {
  const {
    currentUser,
    activeRole,
    isLoggedIn,
    loginWithGoogle,
    openAuthModal,
    setActiveCustomerTab,
    switchRole,
  } = useStore();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleAuth = async () => {
    setGoogleError('');
    setGoogleLoading(true);
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
          requiredRole
        );
        return;
      }
    } catch (err: any) {
      console.warn('Google Popup issue in AccessDenied:', err?.code || err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setGoogleError('Google sign-in was cancelled. Please try again.');
      } else {
        // Fallback for iframe preview
        if (onOpenLogin) {
          onOpenLogin(requiredRole);
        } else {
          openAuthModal('login', requiredRole);
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const roleTitle =
    requiredRole === 'admin'
      ? 'CartNova HQ Admin Clearance'
      : requiredRole === 'seller'
      ? 'Verified Merchant Partner Clearance'
      : 'Customer Member Account';

  return (
    <div
      id="access-denied-security-screen"
      className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden"
      >
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 mb-4 shadow-lg">
            <ShieldAlert className="w-9 h-9 text-rose-100 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-400/40 text-rose-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 • Access Restricted</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unauthorized Route Access
          </h1>
          <p className="text-rose-100/90 text-sm mt-2 max-w-md mx-auto">
            You do not have the required permissions to access the protected endpoint{' '}
            <code className="bg-rose-950/60 px-2 py-0.5 rounded font-mono text-xs text-yellow-200 font-bold border border-rose-500/30">
              {attemptedPath}
            </code>
          </p>
        </div>

        {/* Security Audit Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Attempted Resource:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{attemptedPath}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Required Authorization:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {roleTitle}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Current Session:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isLoggedIn ? (
                  <span>
                    {currentUser.name}{' '}
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      {activeRole}
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Unauthenticated Guest</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Explanations */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>URL & Route Security Enforced:</strong> Direct browser URL navigation to
              administrative and merchant management tools is protected by role-based access control (RBAC).
              Please sign in with authorized credentials or return to the public shopping catalog.
            </p>
          </div>

          {googleError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {googleError}
            </div>
          )}

          {/* Authentication & Navigation Options */}
          <div className="space-y-3 pt-2">
            {/* Prominent Continue with Google Button */}
            <button
              id="access-denied-google-auth-btn"
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Continue with Google ({requiredRole === 'admin' ? 'Admin Access' : 'Sign In'})</span>
            </button>

            {/* Standard Email / Password Sign In */}
            <button
              id="access-denied-login-btn"
              type="button"
              onClick={() => {
                if (onOpenLogin) {
                  onOpenLogin(requiredRole);
                } else {
                  openAuthModal('login', requiredRole);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with {requiredRole === 'admin' ? 'Admin' : requiredRole === 'seller' ? 'Merchant' : 'Customer'} Password</span>
            </button>

            {/* Return to Safe Storefront Catalog */}
            <button
              id="access-denied-return-home-btn"
              type="button"
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                } else {
                  switchRole('customer');
                  setActiveCustomerTab('shop');
                  window.history.pushState({}, '', '/');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to CartNova Shopping Catalog</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
