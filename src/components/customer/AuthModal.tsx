import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AtSign,
  ShoppingBag,
  Crown,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    allUsers,
    activeRole,
  } = useStore();

  // Role selection state: 'customer' or 'admin'
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>(() =>
    activeRole === 'admin' ? 'admin' : 'customer'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom Gmail input state
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  if (!isAuthModalOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email or Gmail address');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail(email, password, selectedRole);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email or Gmail address');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Please agree to the Terms of Service & Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      await signupWithEmail(name, email, password, selectedRole);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleContinue = async (explicitEmail?: string, explicitName?: string) => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      // If user typed or provided their own Gmail explicitly
      if (explicitEmail && explicitEmail.trim()) {
        const cleanEmail = explicitEmail.trim().toLowerCase();
        const cleanName =
          explicitName?.trim() ||
          cleanEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
        await loginWithGoogle(
          {
            email: cleanEmail,
            name: cleanName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
          },
          selectedRole
        );
        return;
      }

      // Try Firebase Auth Google Provider popup
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
            selectedRole
          );
          return;
        }
      } catch (popupErr: any) {
        console.warn('Firebase Google Auth fallback triggered:', popupErr?.code || popupErr);
        // Fallback for iframe preview: prompt direct Gmail
        setErrorMsg(`Enter your Gmail address below to sign in as ${selectedRole === 'admin' ? 'an Admin' : 'a Customer'}.`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Please enter your Gmail address below to sign in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Predefined demo accounts
  const customerDemoAccounts = allUsers.filter((u) => u.role === 'customer');
  const adminDemoAccounts = allUsers.filter((u) => u.role === 'admin');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          id="auth-modal-dialog"
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Header Banner */}
          <div
            className={`text-white p-6 relative transition-colors duration-300 ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900'
                : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950'
            }`}
          >
            <button
              id="close-auth-modal-btn"
              onClick={closeAuthModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge */}
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5">
              {selectedRole === 'admin' ? (
                <div className="flex items-center gap-1 text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-700/50">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>CartNova Admin Management Portal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-700/50">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  <span>CartNova Customer Shopper Access</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {authModalMode === 'login'
                ? selectedRole === 'admin'
                  ? 'Sign In as Admin'
                  : 'Sign In as Customer'
                : selectedRole === 'admin'
                ? 'Create Admin Account'
                : 'Create Customer Account'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {selectedRole === 'admin'
                ? 'Access catalog management, sales analytics, orders & platform configuration.'
                : 'Shop boutique products, enjoy 20% seasonal discounts, spin wheels, and track orders.'}
            </p>

            {/* Mode Switcher Tabs (Log In vs Sign Up) */}
            <div className="flex bg-slate-800/90 p-1 rounded-xl mt-4 border border-slate-700/60">
              <button
                id="tab-mode-login-btn"
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? selectedRole === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-mode-signup-btn"
                type="button"
                onClick={() => {
                  setAuthModalMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'signup'
                    ? selectedRole === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* ROLE SELECTOR BY PREFERRED ICON */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Select Sign-In Identity (Choose Preferred Icon):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Customer Icon Option */}
                <button
                  id="auth-role-customer-btn"
                  type="button"
                  onClick={() => {
                    setSelectedRole('customer');
                    setErrorMsg('');
                  }}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                    selectedRole === 'customer'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  {selectedRole === 'customer' && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                      ✓
                    </span>
                  )}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                      selectedRole === 'customer'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                    Customer / Shopper
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    Shop & track orders
                  </span>
                </button>

                {/* Admin Icon Option */}
                <button
                  id="auth-role-admin-btn"
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setErrorMsg('');
                  }}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                    selectedRole === 'admin'
                      ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  {selectedRole === 'admin' && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                      ✓
                    </span>
                  )}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                      selectedRole === 'admin'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                    Store Admin / HQ
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    Catalog & analytics
                  </span>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* GOOGLE AUTHENTICATION SECTION (AVAILABLE FOR BOTH ROLES) */}
            <div className="space-y-2.5">
              <button
                id="google-continue-btn"
                type="button"
                disabled={googleLoading || isLoading}
                onClick={() => handleGoogleContinue()}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs ${
                  selectedRole === 'admin'
                    ? 'border-purple-200 hover:border-purple-300'
                    : 'border-indigo-200 hover:border-indigo-300'
                }`}
              >
                {googleLoading ? (
                  <Loader2
                    className={`w-5 h-5 animate-spin ${
                      selectedRole === 'admin' ? 'text-purple-600' : 'text-indigo-600'
                    }`}
                  />
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
                  Continue with Google as{' '}
                  <span
                    className={`font-black ${
                      selectedRole === 'admin' ? 'text-purple-700' : 'text-indigo-700'
                    }`}
                  >
                    {selectedRole === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </span>
              </button>

              {/* Direct Gmail Input Form for Google Sign-In */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  selectedRole === 'admin'
                    ? 'bg-purple-50/50 border-purple-200/80'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <AtSign
                      className={`w-3.5 h-3.5 ${
                        selectedRole === 'admin' ? 'text-purple-600' : 'text-indigo-600'
                      }`}
                    />
                    <span>Sign in with any Gmail</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedRole === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    As {selectedRole === 'admin' ? 'ADMIN' : 'CUSTOMER'}
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail.trim()) {
                      handleGoogleContinue(customGoogleEmail, customGoogleName);
                    }
                  }}
                  className="space-y-2"
                >
                  <input
                    id="custom-gmail-input"
                    type="email"
                    required
                    placeholder={`Enter Gmail for ${selectedRole} (e.g. name@gmail.com)`}
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                  />

                  <div className="flex gap-2">
                    <input
                      id="custom-name-input"
                      type="text"
                      placeholder="Display Name (Optional)"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={googleLoading || !customGoogleEmail.trim()}
                      className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
                        selectedRole === 'admin'
                          ? 'bg-purple-700 hover:bg-purple-800'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {googleLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        `Sign in as ${selectedRole === 'admin' ? 'Admin' : 'Customer'}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Or with Email & Password
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* LOGIN FORM */}
            {authModalMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder={
                        selectedRole === 'admin'
                          ? 'admin@cartnova.com'
                          : 'youremail@example.com'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    {selectedRole === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => setEmail('admin@cartnova.com')}
                        className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
                      >
                        Fill admin demo email
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEmail('alex.morgan@example.com')}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        Fill demo email
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email address.')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading || googleLoading}
                  className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedRole === 'admin'
                      ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/25'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        Sign In as {selectedRole === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {selectedRole === 'admin' ? 'Admin / Full Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      placeholder={
                        selectedRole === 'admin'
                          ? 'Admin Supervisor / Your Name'
                          : 'Your Full Name'
                      }
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email Address (Gmail supported)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="signup-email-input"
                      type="email"
                      required
                      placeholder={
                        selectedRole === 'admin'
                          ? 'admin.name@cartnova.com or your.gmail@gmail.com'
                          : 'your.email@gmail.com'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Create Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="signup-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className="font-bold text-slate-700">{strength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1">
                        <div className={`rounded-full ${strength.level >= 1 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`rounded-full ${strength.level >= 2 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`rounded-full ${strength.level >= 3 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`rounded-full ${strength.level >= 4 ? strength.color : 'bg-slate-200'}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="signup-confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300 shrink-0"
                  />
                  <span>
                    I agree to the <span className="text-indigo-600 font-semibold underline">Terms of Service</span> and{' '}
                    <span className="text-indigo-600 font-semibold underline">Privacy Policy</span>.
                  </span>
                </label>

                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={isLoading || googleLoading}
                  className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-purple-600/25'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-600/25'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        Create {selectedRole === 'admin' ? 'Admin' : 'Customer'} Account
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Accounts Picker for Instant 1-Click Sign-In */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Quick Demo Accounts (1-Click Instant Login):
              </span>
              
              <div className="space-y-1.5">
                {/* Admin Quick Login */}
                {adminDemoAccounts.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      loginWithEmail(user.email, undefined, 'admin');
                    }}
                    className="w-full flex items-center justify-between p-2 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl text-xs font-semibold text-purple-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-purple-300"
                        referrerPolicy="no-referrer"
                      />
                      <span>{user.name}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ADMIN LOGIN
                    </span>
                  </button>
                ))}

                {/* Customer Quick Login */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customerDemoAccounts.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        loginWithEmail(user.email, undefined, 'customer');
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-4 h-4 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span>{user.name} (Customer)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
