import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Sparkles,
  Tag,
  Clock,
  Check,
  Copy,
  Gift,
  Flame,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Percent,
  Star,
  ExternalLink,
  ChevronRight,
  Eye,
  Zap,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SeasonalEvent, EventSeason, Product } from '../../types';

export const SeasonalEventsView: React.FC = () => {
  const {
    seasonalEvents,
    selectedSeasonalEvent,
    setSelectedSeasonalEvent,
    activateSeasonalEventDiscount,
    appliedCoupon,
    products,
    formatPrice,
    addToCart,
    viewProductDetail,
    setIsCartOpen,
    setIsSeasonalEventModalOpen,
  } = useStore();

  const [activeSeasonFilter, setActiveSeasonFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live countdown timer calculation for spotlight event
  const currentSpotlightEvent = selectedSeasonalEvent || seasonalEvents[0];
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 12,
    hours: 18,
    minutes: 45,
    seconds: 20,
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!currentSpotlightEvent?.targetCountdownDate) return;
      const target = new Date(currentSpotlightEvent.targetCountdownDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [currentSpotlightEvent]);

  const handleCopyCode = (code: string, event: SeasonalEvent) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    activateSeasonalEventDiscount(event);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const filteredEvents = useMemo(() => {
    if (activeSeasonFilter === 'all') return seasonalEvents;
    if (activeSeasonFilter === 'live') return seasonalEvents.filter((e) => e.status === 'live_now');
    return seasonalEvents.filter((e) => e.categoryType === activeSeasonFilter);
  }, [seasonalEvents, activeSeasonFilter]);

  // Curated products for the selected/spotlight event
  const spotlightProducts = useMemo(() => {
    if (!currentSpotlightEvent) return products.slice(0, 4);
    const curated = products.filter((p) => currentSpotlightEvent.curatedProductIds.includes(p.id));
    if (curated.length >= 2) return curated;
    return products.slice(0, 4);
  }, [currentSpotlightEvent, products]);

  const filterTabs = [
    { id: 'all', label: 'All 14 Events', icon: Sparkles, count: seasonalEvents.length },
    { id: 'live', label: 'Live Now 🔥', icon: Flame, count: seasonalEvents.filter((e) => e.status === 'live_now').length },
    { id: 'holiday', label: 'Festive Holidays 🎄', icon: Gift, count: seasonalEvents.filter((e) => e.categoryType === 'holiday').length },
    { id: 'shopping_festival', label: 'Mega Sales ⚡', icon: Tag, count: seasonalEvents.filter((e) => e.categoryType === 'shopping_festival').length },
    { id: 'national', label: 'National & Naija 🇳🇬', icon: Calendar, count: seasonalEvents.filter((e) => e.categoryType === 'national').length },
    { id: 'cultural', label: 'Eid & Cultural 🌙', icon: Star, count: seasonalEvents.filter((e) => e.categoryType === 'cultural').length },
    { id: 'family', label: 'Family & Loved Ones 💖', icon: HeartHandshake, count: seasonalEvents.filter((e) => e.categoryType === 'family').length },
    { id: 'seasonal', label: 'Back to School 📚', icon: Percent, count: seasonalEvents.filter((e) => e.categoryType === 'seasonal').length },
  ];

  return (
    <div id="seasonal-events-view-container" className="space-y-8 pb-16">
      {/* Hero Showcase Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-10 border border-amber-500/30 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-rose-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official CartNova Promotional Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-white">Flat 20% Discount Guaranteed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Seasonal Events &amp; <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                Shopping Campaigns
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Celebrate every holiday, national jubilee, cultural milestone, and blockbuster shopping festival with an{' '}
              <strong className="text-amber-300 font-bold">automatic 20% discount</strong> across CartNova&apos;s entire catalog.
              From Christmas and Black Friday to Nigeria Independence and Eid celebrations!
            </p>

            {/* Guaranteed Perks Quick Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <Percent className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-white">20% Discount</p>
                  <p className="text-slate-400 text-[10px]">All 14 Events</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-white">Free Express</p>
                  <p className="text-slate-400 text-[10px]">Holiday Dispatch</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <Gift className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-white">Gift Wrapping</p>
                  <p className="text-slate-400 text-[10px]">Free Ribbon Pack</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-white">90-Day Returns</p>
                  <p className="text-slate-400 text-[10px]">Zero Risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spotlight Event Quick Banner Card */}
          {currentSpotlightEvent && (
            <div className="lg:col-span-5 bg-white/10 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>SPOTLIGHT EVENT</span>
                </span>
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentSpotlightEvent.dateRange}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">{currentSpotlightEvent.name}</h2>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{currentSpotlightEvent.tagline}</p>
              </div>

              {/* Countdown Clock */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Event Countdown
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900 rounded-lg py-1.5 px-1 border border-slate-800">
                    <span className="block text-lg font-black text-white">{timeLeft.days}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Days</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg py-1.5 px-1 border border-slate-800">
                    <span className="block text-lg font-black text-white">{timeLeft.hours}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg py-1.5 px-1 border border-slate-800">
                    <span className="block text-lg font-black text-white">{timeLeft.minutes}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg py-1.5 px-1 border border-slate-800">
                    <span className="block text-lg font-black text-amber-400 animate-pulse">{timeLeft.seconds}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Quick Coupon Code Activator */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950/90 border border-dashed border-amber-400/60 rounded-xl px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Coupon Code</span>
                    <span className="text-sm font-black text-amber-300 font-mono tracking-wider">
                      {currentSpotlightEvent.couponCode}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md">
                    20% OFF
                  </span>
                </div>
                <button
                  id={`copy-spotlight-${currentSpotlightEvent.id}`}
                  onClick={() => handleCopyCode(currentSpotlightEvent.couponCode, currentSpotlightEvent)}
                  className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedCode === currentSpotlightEvent.couponCode || appliedCoupon?.code === currentSpotlightEvent.couponCode ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Apply 20%</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSeasonFilter === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-season-${tab.id}`}
              onClick={() => setActiveSeasonFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-2 ring-orange-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Event Spotlight Showcase & Curated Deals */}
      {currentSpotlightEvent && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  🎉 {currentSpotlightEvent.discountPercent}% OFF ACTIVE
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled: {currentSpotlightEvent.exactDateInfo} ({currentSpotlightEvent.dateRange})
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentSpotlightEvent.name} — Curated Event Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {currentSpotlightEvent.description}
              </p>
            </div>

            <button
              id="activate-spotlight-btn"
              onClick={() => {
                activateSeasonalEventDiscount(currentSpotlightEvent);
                setIsCartOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
            >
              <Zap className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              <span>Claim 20% &amp; View Cart</span>
            </button>
          </div>

          {/* Curated Product Cards with Event 20% Price Badging */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-orange-500" />
                <span>Featured {currentSpotlightEvent.shortName} Gift Picks &amp; Flagships</span>
              </h3>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                Prices shown include 20% event savings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {spotlightProducts.map((prod) => {
                const eventPrice = Math.floor(prod.price * 0.8);
                return (
                  <div
                    key={prod.id}
                    className="group bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-xs">
                            -20% {currentSpotlightEvent.shortName.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {prod.title}
                        </h4>
                      </div>

                      {/* Pricing with Event 20% calculation */}
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-orange-600 dark:text-orange-400">
                            {formatPrice(eventPrice)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(prod.price)}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold">
                          Save {formatPrice(prod.price - eventPrice)} with {currentSpotlightEvent.couponCode}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => viewProductDetail(prod)}
                        className="py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => {
                          addToCart(prod, 1);
                          activateSeasonalEventDiscount(currentSpotlightEvent);
                        }}
                        className="py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-black transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Perks & Gift Guide Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-amber-500/10 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-500/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                <span>Special Event Benefits Included</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {currentSpotlightEvent.highlightPerks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-500/10 dark:bg-indigo-950/30 rounded-2xl p-4 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Shopper Gifting &amp; Delivery Tips</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {currentSpotlightEvent.giftGuideTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* All 14 Seasonal Events Grid Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span>All 14 Seasonal Events &amp; Shopping Holidays</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any event card to view the curated collection, activate the 20% discount code, or preview holiday details.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start">
            Showing {filteredEvents.length} of {seasonalEvents.length} Campaigns
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const isSelected = currentSpotlightEvent?.id === event.id;
            const isCouponActive = appliedCoupon?.code === event.couponCode;

            return (
              <motion.div
                key={event.id}
                id={`event-card-${event.id}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-orange-400/50'
                }`}
              >
                {/* Event Image Banner with gradient overlay */}
                <div className="relative h-44 overflow-hidden bg-slate-800">
                  <img
                    src={event.bannerImage}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                        event.status === 'live_now'
                          ? 'bg-rose-600 animate-pulse'
                          : 'bg-slate-900/80 backdrop-blur-md border border-white/20'
                      }`}
                    >
                      {event.status === 'live_now' ? '🔥 Live Event' : `📅 ${event.month}`}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md">
                      20% OFF
                    </span>
                  </div>

                  {/* Bottom Image Title */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      {event.dateRange}
                    </p>
                    <h3 className="text-lg font-black text-white leading-snug drop-shadow-sm">
                      {event.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Highlight perks chips */}
                  <div className="space-y-1">
                    {event.highlightPerks.slice(0, 2).map((perk, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Strip */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">20% Promo Code</span>
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">
                        {event.couponCode}
                      </span>
                    </div>

                    <button
                      id={`btn-apply-event-${event.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(event.couponCode, event);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                        isCouponActive || copiedCode === event.couponCode
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xs'
                      }`}
                    >
                      {isCouponActive || copiedCode === event.couponCode ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Apply 20%</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      id={`btn-view-spotlight-${event.id}`}
                      onClick={() => {
                        setSelectedSeasonalEvent(event);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
                    >
                      View Deals
                    </button>
                    <button
                      id={`btn-open-modal-${event.id}`}
                      onClick={() => {
                        setSelectedSeasonalEvent(event);
                        setIsSeasonalEventModalOpen(true);
                      }}
                      className="py-2 px-3 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Quick Preview Modal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Annual 12-Month Calendar & Schedule Roadmap */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Annual Seasonal Events Calendar</h2>
            <p className="text-xs text-slate-400">
              Mark your calendar! 20% discounts are automatically triggered for all 14 shopping events throughout the year.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {seasonalEvents.map((evt, idx) => (
            <div
              key={evt.id}
              onClick={() => {
                setSelectedSeasonalEvent(evt);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 transition-all cursor-pointer group hover:bg-slate-950"
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-mono text-slate-400 font-bold">
                  #{String(idx + 1).padStart(2, '0')} • {evt.month}
                </span>
                <span className="px-1.5 py-0.2 bg-orange-600/20 text-orange-300 font-black text-[10px] rounded border border-orange-500/30">
                  -20%
                </span>
              </div>
              <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                {evt.name}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5 text-amber-400" />
                <span>Code: </span>
                <strong className="text-amber-300 font-mono">{evt.couponCode}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
