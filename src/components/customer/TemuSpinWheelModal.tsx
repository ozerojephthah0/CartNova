import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { SpinWheelPrize } from '../../types';
import {
  Gift,
  Sparkles,
  X,
  Zap,
  CheckCircle2,
  Percent,
  Truck,
  ArrowRight,
  Flame,
  Award,
  Volume2,
  VolumeX,
  Coins,
  Coffee,
  ShoppingBag,
  Package,
  RefreshCw,
  Wallet,
  Utensils,
  ChevronRight,
  Copy,
  Check,
  Star,
  Clock,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TemuSpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemuSpinWheelModal: React.FC<TemuSpinWheelModalProps> = ({ isOpen, onClose }) => {
  const {
    spinWheelPrizes,
    freeSpinsLeft,
    decrementFreeSpins,
    replenishFreeSpins,
    walletBalance,
    claimedSpinRewards,
    claimSpinReward,
    setIsCartOpen,
    formatPrice,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'wheel' | 'history' | 'wallet'>('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winningPrize, setWinningPrize] = useState<SpinWheelPrize | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimedStatus, setClaimedStatus] = useState<{ message?: string; creditedAmount?: number; addedToCart?: boolean } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Curate a balanced 8-slice wheel selection covering Money, Tech Products, Gourmet Food, and Super Passes
  const activeWheelPrizes: SpinWheelPrize[] = useMemo(() => {
    if (spinWheelPrizes && spinWheelPrizes.length >= 8) {
      // Pick 2 money, 2 products, 2 foods, 2 coupons
      const money = spinWheelPrizes.filter((p) => p.category === 'money').slice(0, 2);
      const prods = spinWheelPrizes.filter((p) => p.category === 'product').slice(0, 2);
      const foods = spinWheelPrizes.filter((p) => p.category === 'food').slice(0, 2);
      const passes = spinWheelPrizes.filter((p) => p.category === 'coupon').slice(0, 2);

      const combined = [...money, ...prods, ...foods, ...passes];
      if (combined.length === 8) return combined;
      return spinWheelPrizes.slice(0, 8);
    }
    return spinWheelPrizes || [];
  }, [spinWheelPrizes]);

  const playChime = (type: 'tick' | 'win') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'win') {
        // High celebratory multi-octave arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.09);
          osc.stop(ctx.currentTime + i * 0.09 + 0.4);
        });
      }
    } catch {}
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#ff5000', '#ffd000', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
      });
    } catch {}
  };

  const handleSpin = () => {
    if (isSpinning || freeSpinsLeft <= 0 || activeWheelPrizes.length === 0) return;

    setIsSpinning(true);
    setWinningPrize(null);
    setClaimedStatus(null);
    decrementFreeSpins();

    // Select a winning prize from the 8 active prizes
    // We give great weights across all categories: Money, Products, Gourmet Food, Passes!
    const winningIndex = Math.floor(Math.random() * activeWheelPrizes.length);
    const targetPrize = activeWheelPrizes[winningIndex];

    const sliceAngle = 360 / activeWheelPrizes.length;
    // Align wheel slice directly to the top pointer
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetAngle = 360 * extraRounds + (360 - winningIndex * sliceAngle - sliceAngle / 2);

    setRotationAngle(targetAngle);

    // Dynamic ticking sound
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playChime('tick');
      if (tickCount > 28) {
        clearInterval(tickInterval);
      }
    }, 130);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningPrize(targetPrize);
      playChime('win');
      triggerConfetti();

      // Automatically register the claim in StoreContext
      const claimResult = claimSpinReward(targetPrize);
      setClaimedStatus({
        message: claimResult.message,
        creditedAmount: claimResult.addedToWallet,
        addedToCart: claimResult.addedToCart,
      });
    }, 4000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast('success', 'Voucher Copied!', `Code ${code} copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getCategoryBadge = (category: SpinWheelPrize['category']) => {
    switch (category) {
      case 'money':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Coins className="w-3 h-3 text-emerald-600" /> Real Cash
          </span>
        );
      case 'product':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300">
            <Package className="w-3 h-3 text-blue-600" /> Free Product
          </span>
        );
      case 'food':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
            <Utensils className="w-3 h-3 text-amber-700" /> Gourmet Food
          </span>
        );
      case 'coupon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300">
            <Percent className="w-3 h-3 text-rose-600" /> Super Pass
          </span>
        );
    }
  };

  const getPrizeIcon = (prize: SpinWheelPrize) => {
    if (prize.category === 'money') return <Coins className="w-4 h-4 text-emerald-200 drop-shadow-sm" />;
    if (prize.category === 'food') return <Utensils className="w-4 h-4 text-amber-200 drop-shadow-sm" />;
    if (prize.category === 'product') return <Package className="w-4 h-4 text-blue-200 drop-shadow-sm" />;
    return <Zap className="w-4 h-4 text-yellow-200 drop-shadow-sm" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-gradient-to-b from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-5 sm:p-7 text-white shadow-2xl border-4 border-yellow-300 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow & Sparkles */}
        <div className="absolute top-2 left-2 text-yellow-200 opacity-40 animate-pulse pointer-events-none">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="absolute bottom-2 right-2 text-yellow-200 opacity-40 animate-pulse pointer-events-none">
          <Gift className="w-10 h-10" />
        </div>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between relative z-10 mb-3 pb-2 border-b border-orange-400/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-yellow-200 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Wallet Balance Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/30 border border-emerald-400/50 rounded-full text-[11px] font-bold text-emerald-300">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wallet: ₦{walletBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-yellow-300/30 text-xs">
            <button
              onClick={() => setActiveTab('wheel')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'wheel' ? 'bg-yellow-400 text-orange-950 shadow-xs' : 'text-orange-100 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Spin</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'history' ? 'bg-yellow-400 text-orange-950 shadow-xs' : 'text-orange-100 hover:text-white'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>Rewards ({claimedSpinRewards.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-yellow-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB 1: LUCKY SPIN WHEEL */}
        {activeTab === 'wheel' && (
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Header Title */}
            <div className="text-center space-y-1 relative z-10 mb-3">
              <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-yellow-300 text-orange-950 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm animate-bounce">
                🎰 100% GUARANTEED PRIZES EVERY SPIN
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-100 drop-shadow-md">
                FREE LUCKY PRIZE WHEEL
              </h2>
              <p className="text-xs font-semibold text-orange-100">
                Win Cash of Any Amount • Tech Gadgets • Gourmet Food Hampers • 90% OFF
              </p>
            </div>

            {/* Wheel Container */}
            <div className="relative flex flex-col items-center justify-center my-3">
              {/* Pointer Marker at the top */}
              <div className="absolute -top-3.5 z-30 flex flex-col items-center pointer-events-none">
                <div className="w-6 h-6 bg-yellow-300 transform rotate-45 rounded-sm shadow-2xl border-2 border-orange-900 animate-pulse" />
                <div className="w-3 h-3 bg-red-600 rounded-full -mt-2.5 shadow-sm" />
              </div>

              {/* Outer Wheel Rim with lights */}
              <div className="w-64 h-64 sm:w-76 sm:h-76 rounded-full p-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 shadow-2xl border-4 border-yellow-100 flex items-center justify-center relative">
                {/* Spinning Wheel */}
                <div
                  className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4000ms] ease-out shadow-inner"
                  style={{
                    transform: `rotate(${rotationAngle}deg)`,
                    boxShadow: 'inset 0 0 24px rgba(0,0,0,0.5)',
                  }}
                >
                  {activeWheelPrizes.map((prize, idx) => {
                    const sliceAngle = 360 / activeWheelPrizes.length;
                    const rotation = idx * sliceAngle;
                    return (
                      <div
                        key={prize.id}
                        className="absolute inset-0 origin-center"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)',
                          backgroundColor: prize.color,
                        }}
                      >
                        <div
                          className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center text-center select-none"
                          style={{ color: prize.textColor }}
                        >
                          <div className="mb-0.5">{getPrizeIcon(prize)}</div>
                          <span className="text-[10px] sm:text-xs font-black tracking-tight drop-shadow-md whitespace-nowrap">
                            {prize.label}
                          </span>
                          <span className="text-[7.5px] sm:text-[8.5px] font-bold opacity-90 max-w-[65px] truncate">
                            {prize.sublabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center Spin Button / Hub */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || freeSpinsLeft <= 0}
                  className={`absolute z-20 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-300 to-amber-200 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-orange-950 font-black cursor-pointer transform hover:scale-105 active:scale-95 transition-all ${
                    isSpinning ? 'opacity-80 cursor-not-allowed scale-95' : 'animate-pulse'
                  }`}
                >
                  <Zap className="w-5 h-5 fill-orange-600 text-orange-600 mb-0.5" />
                  <span className="text-xs sm:text-sm font-extrabold uppercase">
                    {isSpinning ? 'SPINNING...' : freeSpinsLeft > 0 ? 'SPIN FREE' : 'NO SPINS'}
                  </span>
                  <span className="text-[9px] font-bold text-orange-800">
                    {freeSpinsLeft > 0 ? `${freeSpinsLeft} Free Left` : 'Reload Below'}
                  </span>
                </button>
              </div>
            </div>

            {/* Free Spins Refill & Actions Bar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-black/30 rounded-2xl border border-yellow-300/30 my-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-300/40 flex items-center justify-center text-yellow-300 font-black text-sm">
                  {freeSpinsLeft}
                </div>
                <div>
                  <span className="text-xs font-bold text-yellow-200 block">Free Spins Balance</span>
                  <span className="text-[10px] text-orange-200">100% Free Daily Spins for All Customers</span>
                </div>
              </div>

              <button
                onClick={() => replenishFreeSpins(3)}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-orange-950 rounded-xl font-black text-xs shadow-md flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+3 Free Spins</span>
              </button>
            </div>

            {/* Winning Prize Celebration Banner */}
            {winningPrize && (
              <div className="mt-3 p-4 rounded-2xl bg-white text-orange-950 shadow-2xl border-3 border-yellow-400 text-center animate-in zoom-in-95 duration-300 space-y-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  {getCategoryBadge(winningPrize.category)}
                  <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wide">
                    🎉 JACKPOT WINNER!
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {winningPrize.label} Won!
                </div>

                <p className="text-xs font-medium text-slate-600 max-w-md mx-auto">
                  {winningPrize.discountDescription}
                </p>

                {/* Specific Category Reward Details */}
                {winningPrize.category === 'money' && winningPrize.amount && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black">
                        ₦
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">Wallet Credited</span>
                        <span className="text-[11px] text-emerald-700">
                          +₦{winningPrize.amount.toLocaleString()} added to your CartNova balance
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-700">
                      ₦{walletBalance.toLocaleString()} New Total
                    </span>
                  </div>
                )}

                {(winningPrize.category === 'product' || winningPrize.category === 'food') && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-left">
                    <img
                      src={winningPrize.productInfo?.image || winningPrize.foodInfo?.image}
                      alt={winningPrize.label}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 truncate block">
                        {winningPrize.productInfo?.title || winningPrize.foodInfo?.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {winningPrize.productInfo?.description || winningPrize.foodInfo?.description}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-black text-emerald-600">₦0.00 FREE</span>
                        <span className="text-[10px] text-slate-400 line-through">
                          ₦{(winningPrize.productInfo?.originalPrice || winningPrize.foodInfo?.originalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {winningPrize.category === 'coupon' && winningPrize.code && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl font-mono font-black text-sm text-orange-700">
                      {winningPrize.code}
                    </div>
                    <button
                      onClick={() => handleCopyCode(winningPrize.code!)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === winningPrize.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Primary CTA button */}
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      setIsCartOpen(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <span>View in Shopping Cart (Claimed ₦0.00)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Available Rewards Matrix */}
            <div className="mt-4 pt-3 border-t border-orange-400/30">
              <span className="text-[11px] font-bold text-yellow-200 uppercase tracking-wider block mb-2 text-center">
                🎁 In Today's Free Spin Prize Pool:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-black/25 border border-emerald-400/30 text-center">
                  <Coins className="w-4 h-4 text-emerald-300 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-emerald-200 block">Up to ₦100,000</span>
                  <span className="text-[9px] text-orange-200">Real Cash Drop</span>
                </div>
                <div className="p-2 rounded-xl bg-black/25 border border-blue-400/30 text-center">
                  <Package className="w-4 h-4 text-blue-300 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-blue-200 block">Pro Headphones</span>
                  <span className="text-[9px] text-orange-200">Value ₦185,000</span>
                </div>
                <div className="p-2 rounded-xl bg-black/25 border border-amber-400/30 text-center">
                  <Utensils className="w-4 h-4 text-amber-300 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-amber-200 block">Belgian Truffles</span>
                  <span className="text-[9px] text-orange-200">Gourmet Treats</span>
                </div>
                <div className="p-2 rounded-xl bg-black/25 border border-rose-400/30 text-center">
                  <Percent className="w-4 h-4 text-rose-300 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-rose-200 block">90% OFF Pass</span>
                  <span className="text-[9px] text-orange-200">Lightning Voucher</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WON PRIZES & REWARDS HISTORY */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-yellow-100">My Spin Wheel Rewards</h3>
                <p className="text-xs text-orange-100">All prizes claimed to your account wallet & cart</p>
              </div>
              <button
                onClick={() => replenishFreeSpins(2)}
                className="px-3 py-1.5 bg-yellow-400 text-orange-950 rounded-xl font-bold text-xs hover:bg-yellow-300 cursor-pointer"
              >
                Get More Free Spins
              </button>
            </div>

            {claimedSpinRewards.length === 0 ? (
              <div className="py-12 text-center bg-black/30 rounded-2xl border border-yellow-300/30 p-6 space-y-3">
                <Gift className="w-12 h-12 text-yellow-300 mx-auto opacity-70 animate-bounce" />
                <h4 className="text-base font-bold text-yellow-100">No Spin Prizes Claimed Yet</h4>
                <p className="text-xs text-orange-100 max-w-sm mx-auto">
                  You have <strong>{freeSpinsLeft} Free Spins</strong> available right now! Spin the wheel to win instant cash drops, tech products, or gourmet food hampers.
                </p>
                <button
                  onClick={() => setActiveTab('wheel')}
                  className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-orange-950 rounded-xl font-extrabold text-xs shadow-md hover:from-yellow-300 hover:to-amber-300 transition-all cursor-pointer"
                >
                  Spin Now (100% Free)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {claimedSpinRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-3.5 bg-white text-slate-900 rounded-2xl shadow-md border border-yellow-300 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {reward.productInfo?.image ? (
                        <img
                          src={reward.productInfo.image}
                          alt={reward.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                          {reward.category === 'money' ? (
                            <Coins className="w-6 h-6 text-emerald-600" />
                          ) : reward.category === 'food' ? (
                            <Utensils className="w-6 h-6 text-amber-700" />
                          ) : (
                            <Gift className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {getCategoryBadge(reward.category)}
                          <span className="text-[10px] text-slate-400">
                            {new Date(reward.claimedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-slate-900 truncate">{reward.title}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{reward.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {reward.category === 'money' && reward.amount && (
                        <span className="text-xs font-black text-emerald-600">
                          +₦{reward.amount.toLocaleString()} (Credited)
                        </span>
                      )}
                      {(reward.category === 'product' || reward.category === 'food') && (
                        <button
                          onClick={() => {
                            onClose();
                            setIsCartOpen(true);
                          }}
                          className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>In Cart (₦0)</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {reward.category === 'coupon' && reward.code && (
                        <button
                          onClick={() => handleCopyCode(reward.code!)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-slate-300"
                        >
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>{reward.code}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guarantee Bottom Bar */}
        <div className="mt-3 pt-2.5 border-t border-orange-400/30 flex items-center justify-center gap-4 text-[10px] text-orange-100">
          <span className="flex items-center gap-1 font-semibold">
            <Truck className="w-3.5 h-3.5 text-yellow-200" /> 100% Free Shipping
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold">
            <Coins className="w-3.5 h-3.5 text-yellow-200" /> Real Cash Drops
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold">
            <Flame className="w-3.5 h-3.5 text-yellow-200" /> Instant Claim
          </span>
        </div>
      </div>
    </div>
  );
};
