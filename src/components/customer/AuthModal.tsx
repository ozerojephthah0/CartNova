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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  } = useStore();

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
  const [showGoogleAccountPicker, setShowGoogleAccountPicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('ozerojephthah0@gmail.com');
  const [customGoogleName, setCustomGoogleName] = useState('Jephthah Ozero');

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
      setErrorMsg('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      // Success handled in context
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
      setErrorMsg('Please provide a valid email address');
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
      await signupWithEmail(name, email, password);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleContinue = async (selectedEmail?: string, selectedName?: string) => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const emailToUse = selectedEmail || customGoogleEmail || 'ozerojephthah0@gmail.com';
      const nameToUse = selectedName || customGoogleName || (emailToUse.includes('@') ? emailToUse.split('@')[0] : 'Google User');
      
      // Simulate Google identity validation
      await new Promise((resolve) => setTimeout(resolve, 600));
      await loginWithGoogle({
        email: emailToUse,
        name: nameToUse,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      });
    } catch (err: any) {
      setErrorMsg('Google authentication failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Predefined customer demo accounts for testing
  const customerDemoAccounts = allUsers.filter((u) => u.role === 'customer');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          id="auth-modal-dialog"
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 relative">
            <button
              id="close-auth-modal-btn"
              onClick={closeAuthModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>CartNova Secure Customer Access</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {authModalMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {authModalMode === 'login'
                ? 'Sign in to access your orders, saved wishlist, and fast checkout.'
                : 'Join CartNova to enjoy boutique shopping, fast delivery, and member rewards.'}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl mt-5 border border-slate-700/60">
              <button
                id="tab-mode-login-btn"
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
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
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <div>
              <button
                id="google-continue-btn"
                type="button"
                disabled={googleLoading || isLoading}
                onClick={() => handleGoogleContinue()}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
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
                <span>Continue with Google</span>
              </button>

              {/* Expand Google Account Selector / Quick Customization */}
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowGoogleAccountPicker(!showGoogleAccountPicker)}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto font-medium cursor-pointer"
                >
                  <span>Use custom Google account</span>
                  {showGoogleAccountPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showGoogleAccountPicker && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                    <p className="text-slate-600 font-medium">Select or enter Google profile:</p>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleGoogleContinue('ozerojephthah0@gmail.com', 'Jephthah Ozero')}
                        className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            J
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">Jephthah Ozero</p>
                            <p className="text-[10px] text-slate-500">ozerojephthah0@gmail.com</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-bold">Sign In</span>
                      </button>

                      <div className="pt-1 flex gap-2">
                        <input
                          type="email"
                          placeholder="your.email@gmail.com"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleGoogleContinue(customGoogleEmail, customGoogleName)}
                          className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 cursor-pointer"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or with Email
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* LOGIN FORM */}
            {authModalMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder="alex.morgan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setEmail('alex.morgan@example.com')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                    >
                      Fill demo email
                    </button>
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
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      placeholder="Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="signup-email-input"
                      type="email"
                      required
                      placeholder="sarah.jenkins@example.com"
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
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Free Account</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Customer Profiles Picker */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Quick One-Click Demo Customers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {customerDemoAccounts.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      loginWithEmail(user.email);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-4 h-4 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span>{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
