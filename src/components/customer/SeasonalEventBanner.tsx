import React, { useState } from 'react';
import { Sparkles, Tag, ArrowRight, Gift, Percent, Clock, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SeasonalEventBanner: React.FC = () => {
  const {
    seasonalEvents,
    selectedSeasonalEvent,
    setSelectedSeasonalEvent,
    activateSeasonalEventDiscount,
    appliedCoupon,
    setActiveCustomerTab,
  } = useStore();

  const [copied, setCopied] = useState(false);

  // Get active or first featured seasonal event
  const currentEvent = seasonalEvents.find((e) => e.status === 'live_now') || seasonalEvents[0];

  if (!currentEvent) return null;

  const isApplied = appliedCoupon?.code === currentEvent.couponCode;

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentEvent.couponCode);
    setCopied(true);
    activateSeasonalEventDiscount(currentEvent);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="seasonal-promotional-strip-banner"
      onClick={() => {
        setSelectedSeasonalEvent(currentEvent);
        setActiveCustomerTab('seasonal-events');
      }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-3.5 sm:p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all group border border-amber-400/30 mb-6"
    >
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
            <Gift className="w-5 h-5 text-amber-200 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-slate-950/40 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-white/10">
                🎉 SEASONAL EVENTS &amp; CAMPAIGNS
              </span>
              <span className="text-xs font-bold text-amber-200">
                {currentEvent.name} ({currentEvent.dateRange})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
              Enjoy guaranteed <strong className="text-yellow-300 font-extrabold">20% OFF</strong> across all 14 holiday events &amp; celebrations!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleApply}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-950 text-amber-300 text-xs font-black border border-amber-400/50 shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copied || isApplied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">20% Applied!</span>
              </>
            ) : (
              <>
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span>Code: {currentEvent.couponCode} (-20%)</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSeasonalEvent(currentEvent);
              setActiveCustomerTab('seasonal-events');
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-amber-100 text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All 14 Events</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
