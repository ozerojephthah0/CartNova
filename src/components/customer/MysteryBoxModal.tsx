import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Sparkles,
  Gift,
  Package,
  Trophy,
  Flame,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  Zap,
  Star,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MysteryBoxTier, MysteryBoxPrize } from '../../types';

export const MysteryBoxModal: React.FC = () => {
  const {
    mysteryBoxes,
    isMysteryBoxOpen,
    setIsMysteryBoxOpen,
    openMysteryBox,
    unboxedPrizes,
    claimMysteryPrize,
    formatPrice,
    addToast,
    setIsCartOpen,
  } = useStore();

  const [selectedTier, setSelectedTier] = useState<MysteryBoxTier>(mysteryBoxes[0]);
  const [isOpening, setIsOpening] = useState(false);
  const [currentWonPrize, setCurrentWonPrize] = useState<MysteryBoxPrize | null>(null);
  const [showOdds, setShowOdds] = useState(false);
  const [boxState, setBoxState] = useState<'idle' | 'shaking' | 'exploding' | 'revealed'>('idle');

  const triggerMysteryConfetti = (rarity: string) => {
    try {
      const colors =
        rarity === 'Legendary'
          ? ['#ffd700', '#ff007f', '#ff8c00', '#00f0ff']
          : rarity === 'Epic'
          ? ['#9333ea', '#c084fc', '#f472b6', '#3b82f6']
          : ['#10b981', '#3b82f6', '#f59e0b'];

      confetti({
        particleCount: rarity === 'Legendary' ? 140 : 80,
        spread: 100,
        origin: { y: 0.55 },
        colors,
      });
    } catch {}
  };

  const handleOpenBox = async () => {
    if (isOpening) return;
    setIsOpening(true);
    setCurrentWonPrize(null);
    setBoxState('shaking');

    // 1. Shaking animation
    setTimeout(async () => {
      setBoxState('exploding');
      const prize = await openMysteryBox(selectedTier.id);

      setTimeout(() => {
        setCurrentWonPrize(prize);
        setBoxState('revealed');
        setIsOpening(false);
        triggerMysteryConfetti(prize.rarity);
      }, 700);
    }, 1200);
  };

  const handleClaim = (prize: MysteryBoxPrize) => {
    claimMysteryPrize(prize);
    setIsMysteryBoxOpen(false);
    setIsCartOpen(true);
  };

  if (!isMysteryBoxOpen) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'from-amber-400 via-yellow-500 to-orange-500 text-amber-950 border-amber-300';
      case 'Epic':
        return 'from-purple-500 via-fuchsia-500 to-pink-500 text-white border-purple-300';
      case 'Rare':
        return 'from-blue-500 via-indigo-500 to-cyan-500 text-white border-blue-300';
      default:
        return 'from-emerald-500 to-teal-500 text-white border-emerald-300';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-700 via-indigo-600 to-fuchsia-600 p-5 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                  CartNova Mystery Vault • Blind Box Drops
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Unbox & Win Big <Gift className="w-6 h-6 text-yellow-300 animate-bounce" />
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  Guaranteed prizes in every crate! Win tech gadgets, ANC audio, smartwatches, or ₦250k cash sprees.
                </p>
              </div>
              <button
                onClick={() => setIsMysteryBoxOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Box Tier Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Select Mystery Crate:</span>
                <button
                  onClick={() => setShowOdds(!showOdds)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 normal-case text-xs font-semibold"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showOdds ? 'Hide Drop Odds' : 'View Drop Rates'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {mysteryBoxes.map((box) => {
                  const isSelected = selectedTier.id === box.id;
                  return (
                    <button
                      key={box.id}
                      onClick={() => {
                        setSelectedTier(box);
                        setCurrentWonPrize(null);
                        setBoxState('idle');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-yellow-400 bg-purple-950/60 ring-2 ring-yellow-400/40'
                          : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🎁</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/40 text-yellow-300 border border-yellow-400/30">
                          {box.guaranteedMinRarity}+
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white leading-tight line-clamp-1">{box.name}</p>
                        <p className="text-xs font-extrabold text-amber-400 mt-1">
                          {box.price === 0 ? 'FREE ₦0' : formatPrice(box.price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drop Odds Drawer */}
            <AnimatePresence>
              {showOdds && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2 text-xs"
                >
                  <h4 className="font-bold text-yellow-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> Drop Rates for {selectedTier.name}:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTier.prizes.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <span className="text-slate-300 line-clamp-1">{p.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            p.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-300' :
                            p.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                            p.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {p.rarity}
                          </span>
                          <span className="font-mono font-bold text-yellow-400">{p.chance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Unboxing Stage */}
            <div className="relative bg-gradient-to-b from-slate-800/60 to-slate-900/80 rounded-3xl p-6 border border-slate-700/80 text-center flex flex-col items-center justify-center min-h-[280px] overflow-hidden">
              {/* Radial glow background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />

              {boxState === 'revealed' && currentWonPrize ? (
                /* Prize Revealed View */
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="space-y-4 max-w-md w-full relative z-10"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs uppercase rounded-full shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-black" />
                    <span>{currentWonPrize.rarity} UNBOXED!</span>
                  </div>

                  <div className="relative mx-auto w-36 h-36 rounded-2xl overflow-hidden border-2 border-yellow-400/80 shadow-2xl bg-black">
                    <img
                      src={currentWonPrize.image}
                      alt={currentWonPrize.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {currentWonPrize.badge && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {currentWonPrize.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-white">{currentWonPrize.title}</h3>
                    <p className="text-sm text-yellow-400 font-bold">
                      Estimated Retail Value: {formatPrice(currentWonPrize.retailPrice)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleClaim(currentWonPrize)}
                      className="py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Claim Free (₦0)</span>
                    </button>
                    <button
                      onClick={handleOpenBox}
                      className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Open Another</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Unopened Mystery Box Animation */
                <div className="space-y-5 relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={
                      boxState === 'shaking'
                        ? {
                            rotate: [-5, 5, -8, 8, -4, 4, 0],
                            scale: [1, 1.05, 0.95, 1.1, 1],
                            y: [-2, 2, -4, 4, 0],
                          }
                        : { y: [0, -6, 0] }
                    }
                    transition={
                      boxState === 'shaking'
                        ? { duration: 0.8, repeat: Infinity }
                        : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                    }
                    className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center"
                  >
                    {/* Glowing Aura */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full blur-2xl opacity-40 animate-pulse" />

                    <div className="relative w-full h-full bg-gradient-to-tr from-purple-900 via-indigo-800 to-slate-900 rounded-3xl border-2 border-yellow-400/60 shadow-2xl p-4 flex flex-col items-center justify-center">
                      <Package className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]" />
                      <span className="text-[11px] font-black text-amber-300 mt-2 uppercase tracking-widest">
                        {selectedTier.name}
                      </span>
                    </div>
                  </motion.div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-white">{selectedTier.name}</h3>
                    <p className="text-xs text-slate-300 max-w-sm">{selectedTier.tagline}</p>
                  </div>

                  <button
                    onClick={handleOpenBox}
                    disabled={isOpening}
                    className="py-3.5 px-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>
                      {isOpening
                        ? 'Unboxing Secrets...'
                        : selectedTier.price === 0
                        ? 'OPEN FREE DAILY DROP (₦0)'
                        : `UNBOX NOW (${formatPrice(selectedTier.price)})`}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Unboxed History / Community Drop Stream */}
            {unboxedPrizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Your Unboxed Treasures ({unboxedPrizes.length}):
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {unboxedPrizes.map((prize, idx) => (
                    <div
                      key={`${prize.id}-${idx}`}
                      className="shrink-0 w-36 bg-slate-800/80 rounded-2xl p-2 border border-slate-700 text-center flex flex-col items-center"
                    >
                      <img
                        src={prize.image}
                        alt={prize.title}
                        className="w-12 h-12 rounded-xl object-cover mb-1 border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[11px] font-bold text-white line-clamp-1">{prize.title}</p>
                      <span className="text-[10px] text-amber-400 font-extrabold">{prize.rarity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
