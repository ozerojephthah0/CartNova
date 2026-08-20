import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Prize {
  id: string;
  code: string;
  label: string;
  sublabel: string;
  color: string;
  textColor: string;
  icon: 'percent' | 'gift' | 'truck' | 'zap' | 'bundle' | 'cash';
  discountDescription: string;
}

const PRIZES: Prize[] = [
  {
    id: 'p1',
    code: 'TEMU100',
    label: '$100 BUNDLE',
    sublabel: 'Big Winner Voucher',
    color: '#ff5000',
    textColor: '#ffffff',
    icon: 'bundle',
    discountDescription: '₦100,000 Temu Big Winner Coupon Bundle',
  },
  {
    id: 'p2',
    code: 'SLASH90',
    label: '90% OFF',
    sublabel: 'Lightning Flash Pass',
    color: '#ffd000',
    textColor: '#803400',
    icon: 'percent',
    discountDescription: '90% OFF any order voucher',
  },
  {
    id: 'p3',
    code: 'FREESHIP',
    label: 'FREE SHIPPING',
    sublabel: 'Lifetime Express Pass',
    color: '#ff3366',
    textColor: '#ffffff',
    icon: 'truck',
    discountDescription: 'Free priority delivery on all items',
  },
  {
    id: 'p4',
    code: 'TEMU25',
    label: '$25 REWARD',
    sublabel: 'No Minimum Spend',
    color: '#9333ea',
    textColor: '#ffffff',
    icon: 'cash',
    discountDescription: '₦25,000 / $25 Off instant discount code',
  },
  {
    id: 'p5',
    code: 'BILLIONAIRE',
    label: '50% OFF',
    sublabel: 'Shop Like a Billionaire',
    color: '#ea580c',
    textColor: '#ffffff',
    icon: 'zap',
    discountDescription: '50% OFF "Shop Like a Billionaire" promo',
  },
  {
    id: 'p6',
    code: 'NOVA20',
    label: '20% EXTRA',
    sublabel: 'Storewide Pass',
    color: '#2563eb',
    textColor: '#ffffff',
    icon: 'gift',
    discountDescription: '20% extra off any cart total',
  },
];

interface TemuSpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemuSpinWheelModal: React.FC<TemuSpinWheelModalProps> = ({ isOpen, onClose }) => {
  const { applyCoupon, addToast, setIsCartOpen } = useStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(2);
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

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
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'win') {
        // High celebratory arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.4);
        });
      }
    } catch {}
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5000', '#ffd000', '#ff3366', '#ffffff', '#22c55e'],
      });
    } catch {}
  };

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setWinningPrize(null);

    // Pick a high-value prize (Temu always gives great odds!)
    // 0 = TEMU100, 1 = SLASH90, 4 = BILLIONAIRE
    const winningIndex = Math.random() > 0.4 ? 0 : Math.floor(Math.random() * PRIZES.length);
    const targetPrize = PRIZES[winningIndex];

    const sliceAngle = 360 / PRIZES.length;
    // Calculate final rotation so the slice lands directly at the top pointer (90 deg)
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetAngle = 360 * extraRounds + (360 - winningIndex * sliceAngle - sliceAngle / 2);

    setRotationAngle(targetAngle);

    // Tick audio loop
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playChime('tick');
      if (tickCount > 25) {
        clearInterval(tickInterval);
      }
    }, 140);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningPrize(targetPrize);
      setSpinsLeft((prev) => Math.max(0, prev - 1));
      setClaimedCodes((prev) => [...new Set([...prev, targetPrize.code])]);
      playChime('win');
      triggerConfetti();

      // Auto-apply to cart context!
      applyCoupon(targetPrize.code);
      addToast(
        'success',
        `🎉 YOU WON: ${targetPrize.label}!`,
        `Coupon ${targetPrize.code} is automatically applied to your cart!`
      );
    }, 4000);
  };

  const handleApplyClaimed = (code: string) => {
    applyCoupon(code);
    addToast('success', 'Coupon Applied!', `Voucher ${code} is active for your cart.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-yellow-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative sparkles */}
        <div className="absolute top-2 left-2 text-yellow-200 opacity-60 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-2 right-2 text-yellow-200 opacity-60 animate-pulse">
          <Gift className="w-8 h-8" />
        </div>

        {/* Close & Sound Toggle */}
        <div className="flex items-center justify-between relative z-10 mb-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-yellow-200 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="px-3 py-1 bg-yellow-400 text-orange-950 rounded-full font-black text-xs uppercase tracking-wider shadow-md animate-bounce">
            🎁 FREE TEMU SPIN
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-yellow-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-1 relative z-10 mb-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-200 drop-shadow-md">
            SPIN & WIN $100 BUNDLE!
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-orange-100">
            Shop Like a Billionaire • 100% Guaranteed Win Every Spin
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative flex flex-col items-center justify-center my-4">
          {/* Pointer Marker at the top */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-6 h-6 bg-yellow-300 transform rotate-45 rounded-sm shadow-xl border-2 border-orange-800" />
            <div className="w-3 h-3 bg-red-600 rounded-full -mt-2.5 shadow-sm" />
          </div>

          {/* Outer Wheel Rim */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 shadow-2xl border-4 border-yellow-100 flex items-center justify-center relative">
            {/* Spinning Wheel */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4000ms] ease-out shadow-inner"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
              }}
            >
              {PRIZES.map((prize, idx) => {
                const sliceAngle = 360 / PRIZES.length;
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
                      className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center text-center select-none"
                      style={{ color: prize.textColor }}
                    >
                      <span className="text-[11px] sm:text-xs font-black tracking-tight drop-shadow-sm whitespace-nowrap">
                        {prize.label}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold opacity-90 max-w-[70px] truncate">
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
              disabled={isSpinning || spinsLeft <= 0}
              className={`absolute z-20 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-300 to-amber-200 border-4 border-white shadow-xl flex flex-col items-center justify-center text-orange-950 font-black cursor-pointer transform hover:scale-105 active:scale-95 transition-all ${
                isSpinning ? 'opacity-80 cursor-not-allowed scale-95' : 'animate-pulse'
              }`}
            >
              <Zap className="w-5 h-5 fill-orange-600 text-orange-600 mb-0.5" />
              <span className="text-xs sm:text-sm font-extrabold uppercase">
                {isSpinning ? 'SPINNING...' : spinsLeft > 0 ? 'SPIN NOW' : 'CLAIMED'}
              </span>
              <span className="text-[9px] font-bold text-orange-800">
                {spinsLeft > 0 ? `${spinsLeft} Left` : '0 Left'}
              </span>
            </button>
          </div>
        </div>

        {/* Winning Prize Banner */}
        {winningPrize && (
          <div className="mt-4 p-4 rounded-2xl bg-white text-orange-950 shadow-xl border-2 border-yellow-300 text-center animate-in zoom-in-95 duration-300 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-orange-600 font-extrabold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>CONGRATULATIONS WINNER!</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {winningPrize.label} Unlocked!
            </div>
            <p className="text-xs text-slate-600">{winningPrize.discountDescription}</p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="px-3 py-1.5 bg-orange-100 border border-orange-300 rounded-xl font-mono font-black text-sm text-orange-700 tracking-wider">
                {winningPrize.code}
              </div>
              <button
                onClick={() => {
                  onClose();
                  setIsCartOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>View in Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Claimed Bundle Badges */}
        {claimedCodes.length > 0 && !winningPrize && (
          <div className="mt-3 p-3 rounded-xl bg-black/30 border border-yellow-300/40 text-center space-y-1.5">
            <span className="text-[11px] font-bold text-yellow-200">
              Active Claimed Rewards in Your Account:
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {claimedCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => handleApplyClaimed(code)}
                  className="px-2.5 py-1 bg-yellow-400 text-orange-950 font-mono font-bold text-[11px] rounded-lg shadow-xs hover:bg-yellow-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>{code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Guarantee Note */}
        <div className="mt-4 pt-3 border-t border-orange-500/40 flex items-center justify-center gap-4 text-[11px] text-orange-100">
          <span className="flex items-center gap-1 font-semibold">
            <Truck className="w-3.5 h-3.5 text-yellow-200" /> Free Shipping
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold">
            <Percent className="w-3.5 h-3.5 text-yellow-200" /> Price Adjustment
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold">
            <Flame className="w-3.5 h-3.5 text-yellow-200" /> 90-Day Returns
          </span>
        </div>
      </div>
    </div>
  );
};
