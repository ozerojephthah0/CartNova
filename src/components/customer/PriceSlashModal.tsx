import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Zap,
  Flame,
  Users,
  Share2,
  Gift,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Award,
  Swords,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const PriceSlashModal: React.FC = () => {
  const {
    slashItems,
    activeSlashItem,
    setActiveSlashItem,
    slashPrice,
    simulateFriendSlash,
    claimSlashedItem,
    isSlashModalOpen,
    setIsSlashModalOpen,
    formatPrice,
    addToast,
  } = useStore();

  const [isSlashing, setIsSlashing] = useState(false);
  const [slashEffect, setSlashEffect] = useState<{ active: boolean; amount: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400 - 3200); // 23h+
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentItem = activeSlashItem || slashItems[0];

  // Play synthetic sword slicing sound effect using Web Audio API
  const playSlashSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Audio not permitted or supported in iframe
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff6b00', '#ffd700', '#10b981', '#3b82f6'],
      });
    } catch {}
  };

  const handleSlash = () => {
    if (!currentItem || currentItem.status === 'completed' || currentItem.status === 'claimed' || isSlashing) {
      return;
    }

    setIsSlashing(true);
    playSlashSound();

    const res = slashPrice(currentItem.id);
    setSlashEffect({ active: true, amount: res.amount });

    if (res.completed || res.remaining === 0) {
      triggerConfetti();
    }

    setTimeout(() => {
      setSlashEffect(null);
      setIsSlashing(false);
    }, 600);
  };

  const handleSimulateFriends = () => {
    if (!currentItem || currentItem.status === 'completed') return;
    playSlashSound();
    simulateFriendSlash(currentItem.id);
    triggerConfetti();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://cartnova.shop/slash/${currentItem?.id}?ref=trillionaire`);
    setCopiedLink(true);
    addToast('success', 'Referral Link Copied!', 'Share with friends to slash your price to ₦0 faster!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isSlashModalOpen || !currentItem) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isCompleted = currentItem.status === 'completed' || currentItem.currentPrice === 0;
  const isClaimed = currentItem.status === 'claimed';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl shadow-2xl border border-orange-200 dark:border-orange-500/20 overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 text-white p-5 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-xs font-bold text-amber-200 uppercase tracking-wider mb-2 border border-white/10">
                  <Swords className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  CartNova Slash It! • 100% Free ₦0 Prize
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Slash Down to ₦0 <Flame className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-bounce" />
                </h2>
                <p className="text-white/90 text-sm mt-1 max-w-md">
                  Tap to slash prices instantly or invite friends to drop the cost to <span className="font-extrabold text-yellow-300">₦0 for 100% FREE</span>!
                </p>
              </div>
              <button
                onClick={() => setIsSlashModalOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown Badge */}
            <div className="mt-4 flex items-center justify-between bg-black/25 backdrop-blur-sm rounded-xl px-4 py-2 text-xs font-medium border border-white/15">
              <div className="flex items-center gap-2 text-amber-200">
                <Clock className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Expires in:</span>
                <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">
                  {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="text-yellow-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentItem.slashesLeft} Direct Slashes Left</span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Prize Selector Tabs */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Your Free Prize to Slash:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {slashItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSlashItem(item)}
                    className={`relative p-2 rounded-2xl border text-left transition-all flex flex-col items-center text-center ${
                      currentItem.id === item.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-2 ring-orange-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-xl mb-1.5 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[11px] font-bold line-clamp-1 text-slate-800 dark:text-slate-200">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400">
                      {item.percentageSlashed}% Slashed
                    </span>
                    {item.status === 'completed' && (
                      <span className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Item Card & Progress */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    FREE ₦0 REWARD
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                    {currentItem.title}
                  </h3>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Original Value</span>
                      <span className="text-sm font-semibold text-slate-500 line-through">
                        {formatPrice(currentItem.originalPrice)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <span className="text-xs text-slate-400 block">Total Slashed</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        -{formatPrice(currentItem.slashedTotal)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <span className="text-xs text-slate-400 block">Price Remaining</span>
                      <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                        {currentItem.currentPrice === 0 ? '₦0 (FREE!)' : formatPrice(currentItem.currentPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-orange-500" />
                        {currentItem.percentageSlashed}% Slashed
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {currentItem.currentPrice === 0 ? 'Ready to Claim!' : `Only ${formatPrice(currentItem.currentPrice)} left`}
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-600">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, currentItem.percentageSlashed)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[move-bg_1s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slicing Animation Overlay */}
              <AnimatePresence>
                {slashEffect && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.5, y: -40 }}
                    className="absolute inset-0 flex items-center justify-center bg-orange-500/20 backdrop-blur-xs z-20 pointer-events-none"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-600 text-white font-black text-2xl sm:text-3xl px-6 py-3 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-3">
                      <Swords className="w-8 h-8 text-yellow-200 animate-spin" />
                      <span>SLASHED -{formatPrice(slashEffect.amount)}!</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isCompleted ? (
                <div className="space-y-3 text-center">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 p-4 rounded-2xl flex items-center justify-center gap-3">
                    <Trophy className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                    <div className="text-left">
                      <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm sm:text-base">
                        CONGRATULATIONS! 100% SLICE COMPLETE!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        You unlocked this item for ₦0. Claim to your cart for free express dispatch!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => claimSlashedItem(currentItem.id)}
                    disabled={isClaimed}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
                  >
                    <Gift className="w-6 h-6 animate-pulse" />
                    <span>{isClaimed ? 'Already Claimed to Cart' : 'Claim Free Item Now (₦0)'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleSlash}
                    disabled={isSlashing || currentItem.slashesLeft === 0}
                    className={`py-3.5 sm:py-4 px-4 bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer ${
                      isSlashing ? 'opacity-70 scale-98' : ''
                    }`}
                  >
                    <Swords className="w-6 h-6 text-yellow-200" />
                    <span>{isSlashing ? 'Slashing...' : 'SLASH PRICE NOW!'}</span>
                  </button>

                  <button
                    onClick={handleSimulateFriends}
                    className="py-3.5 sm:py-4 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
                  >
                    <Users className="w-5 h-5 text-blue-200" />
                    <span>Simulate Friend Slashes (₦0)</span>
                  </button>
                </div>
              )}

              {/* Referral Boost Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Share2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="hidden sm:inline">Invite friends to slash remaining price:</span>
                  <span className="sm:hidden">Share & invite:</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Friend Assist History Feed */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  Community Slash Activity ({currentItem.assists.length} helpers)
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">Live Active Feed</span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {currentItem.assists.map((ast) => (
                  <div
                    key={ast.id}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={ast.avatar}
                        alt={ast.name}
                        className="w-7 h-7 rounded-full object-cover border border-orange-300"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{ast.name}</p>
                        <p className="text-[10px] text-slate-400">{ast.time}</p>
                      </div>
                    </div>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                      Slashed -{formatPrice(ast.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Free Guaranteed</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award className="w-4 h-4 text-orange-500" />
                <span>Authentic Brand Gear</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>0 Hidden Shipping Fees</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
