import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Gift,
  Share2,
  Copy,
  CheckCircle2,
  Flame,
  Award,
  Users,
  Wallet,
  Sparkles,
  TrendingUp,
  Ticket,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReferralRewardsView: React.FC = () => {
  const {
    referralData,
    claimDailyStreakReward,
    redeemRewardPoints,
    formatPrice,
    addToast,
    setActiveCustomerTab,
  } = useStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'streak' | 'redeem' | 'history' | 'rules'>('overview');
  const [claimingStreak, setClaimingStreak] = useState(false);

  const referralUrl = `https://cartnova.store/ref/${referralData.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    setCopiedCode(true);
    addToast('success', 'Code Copied!', 'Share this promo code with your friends to earn ₦5,000 per invite.');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    addToast('success', 'Link Copied!', 'Referral invite URL copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `🛍️ Join me on CartNova Store! Use my code ${referralData.referralCode} to get 40% OFF your first order + ₦5,000 instant shopping credit! Shop now: ${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(
      `🛍️ Join me on CartNova Store! Use code ${referralData.referralCode} for 40% OFF and instant voucher credits! ${referralUrl}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      `Get huge discounts and flash deals on @CartNovaStore! Use my invite code ${referralData.referralCode} for 40% OFF: ${referralUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleClaimStreak = () => {
    setClaimingStreak(true);
    setTimeout(() => {
      claimDailyStreakReward();
      setClaimingStreak(false);
    }, 400);
  };

  const streakDays = [
    { day: 1, points: 250, label: 'Day 1' },
    { day: 2, points: 500, label: 'Day 2' },
    { day: 3, points: 750, label: 'Day 3' },
    { day: 4, points: 1000, label: 'Day 4' },
    { day: 5, points: 1250, label: 'Day 5' },
    { day: 6, points: 1500, label: 'Day 6' },
    { day: 7, points: 1750, label: 'Day 7', isJackpot: true },
  ];

  const rewardShopItems = [
    {
      id: 'rw-wallet-5k',
      title: '₦5,000 Wallet Cash Deposit',
      cost: 1000,
      type: 'wallet' as const,
      icon: Wallet,
      badge: 'Most Popular',
      description: 'Instantly credits ₦5,000 to your spendable CartNova Wallet balance.',
    },
    {
      id: 'rw-coupon-40',
      title: 'VIP 40% OFF Storewide Voucher',
      cost: 1500,
      type: 'coupon' as const,
      icon: Ticket,
      badge: 'Huge Savings',
      description: 'Exclusive 40% discount on electronics, fashion, beauty & home items.',
    },
    {
      id: 'rw-wallet-12k',
      title: '₦12,000 Wallet Cash Deposit',
      cost: 2000,
      type: 'wallet' as const,
      icon: Wallet,
      badge: 'Best Value',
      description: 'Direct cash deposit into your CartNova Wallet for checkout purchases.',
    },
    {
      id: 'rw-shipping-vip',
      title: '1-Month Free Express Shipping Pass',
      cost: 800,
      type: 'shipping' as const,
      icon: Truck,
      badge: 'Nova Prime Perk',
      description: 'Unlimited zero-cost priority courier shipping on all orders for 30 days.',
    },
    {
      id: 'rw-wallet-30k',
      title: '₦30,000 Diamond Cash Bonus',
      cost: 4500,
      type: 'wallet' as const,
      icon: Sparkles,
      badge: 'VIP Elite',
      description: 'High-tier reward for dedicated CartNova advocates and super-referrers.',
    },
  ];

  const sampleReferrals = [
    {
      id: 'ref-1',
      name: 'Oluwaseun Adeyemi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      date: 'Yesterday, 14:30',
      status: 'Completed',
      earned: 5000,
      orderTotal: 42000,
    },
    {
      id: 'ref-2',
      name: 'Chinedu Eze',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      date: '3 days ago',
      status: 'Completed',
      earned: 5000,
      orderTotal: 68500,
    },
    {
      id: 'ref-3',
      name: 'Fatima Bello',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      date: '5 days ago',
      status: 'Completed',
      earned: 5000,
      orderTotal: 29000,
    },
    {
      id: 'ref-4',
      name: 'Tunde Bakare',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      date: '1 week ago',
      status: 'Pending First Order',
      earned: 0,
      orderTotal: 0,
    },
    {
      id: 'ref-5',
      name: 'Ngozi Okafor',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      date: '2 weeks ago',
      status: 'Completed',
      earned: 5000,
      orderTotal: 84000,
    },
  ];

  return (
    <div id="referrals-rewards-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setActiveCustomerTab('shop')}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900 dark:text-white">Referrals & VIP Rewards Hub</span>
          </div>
          <button
            onClick={() => setActiveCustomerTab('shop')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1"
          >
            Back to Shopping <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hero Card with Referral Code & Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" /> CartNova VIP Rewards Club
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Invite Friends, Earn ₦5,000 Cash + Unlimited Rewards
              </h1>
              <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
                Give your friends a <span className="font-bold text-white">40% discount voucher</span> on their first order. When they complete a purchase, you instantly receive <span className="font-bold text-white">₦5,000 cash credit</span> in your CartNova wallet plus 1,000 VIP Points!
              </p>

              {/* Share & Code Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 gap-3">
                  <span className="text-xs text-amber-200 uppercase font-semibold">Your Referral Code:</span>
                  <span className="font-mono font-bold tracking-wider text-sm sm:text-base">{referralData.referralCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                    title="Copy Code"
                  >
                    {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs sm:text-sm rounded-xl shadow transition-all active:scale-95"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
                  </button>

                  <button
                    onClick={shareViaWhatsApp}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow transition-all active:scale-95"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareViaTelegram}
                    className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow transition-all active:scale-95"
                    title="Share via Telegram"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* User VIP Stats Card */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 bg-black/20 backdrop-blur-md p-5 rounded-xl border border-white/20 min-w-[280px]">
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-amber-200 block">Available Points</span>
                <span className="text-xl sm:text-2xl font-black">{referralData.rewardPoints.toLocaleString()}</span>
                <span className="text-[10px] text-amber-300 block">VIP Points Balance</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-amber-200 block">Total Earned</span>
                <span className="text-xl sm:text-2xl font-black">{formatPrice(referralData.totalEarnedBonus)}</span>
                <span className="text-[10px] text-emerald-300 block">From 5 Completed</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-amber-200 block">VIP Tier</span>
                <span className="text-base sm:text-lg font-black text-yellow-300 flex items-center gap-1">
                  <Award className="w-4 h-4" /> {referralData.tier} Member
                </span>
                <span className="text-[10px] text-amber-200 block">Next: Platinum (8/10)</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-amber-200 block">Daily Streak</span>
                <span className="text-base sm:text-lg font-black text-orange-300 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-orange-400 text-orange-400" /> Day {referralData.dailyStreak}/7
                </span>
                <span className="text-[10px] text-amber-200 block">Jackpot at Day 7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'overview', label: 'Rewards Hub', icon: Sparkles },
            { id: 'streak', label: '7-Day Check-in Streak', icon: Flame },
            { id: 'redeem', label: 'Points Redemption Shop', icon: Gift },
            { id: 'history', label: 'My Referral Activity', icon: Users },
            { id: 'rules', label: 'Program Rules & FAQs', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 3 Step Guide */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> How CartNova Referrals Work
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Share Your Code / Link</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Send your link to friends, family, or social media followers via WhatsApp, Instagram, or SMS.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-lg shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">They Get 40% OFF</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your friend receives an exclusive 40% discount coupon and free delivery on their initial purchase.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">You Earn ₦5,000 Cash</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      As soon as their package is dispatched, ₦5,000 is credited straight into your spendable wallet!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Streak Highlight & Points Redemption Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Streak Preview Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> Daily Check-In Streak
                    </span>
                    <span className="text-xs font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2.5 py-0.5 rounded-full">
                      Day {referralData.dailyStreak} of 7 Active
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Check-in Daily to Win Up to 1,750 Pts & ₦5,000 Jackpot
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Claim your daily login bonus every 24 hours. Reach Day 7 to unlock the grand jackpot prize credited directly to your CartNova wallet.
                  </p>

                  {/* 7 Day Mini Progress */}
                  <div className="grid grid-cols-7 gap-1.5 my-4">
                    {streakDays.map((sd) => {
                      const isPast = sd.day <= referralData.dailyStreak;
                      const isCurrent = sd.day === referralData.dailyStreak;
                      return (
                        <div
                          key={sd.day}
                          className={`p-2 rounded-xl text-center border transition-all ${
                            isCurrent
                              ? 'bg-amber-600 text-white border-amber-600 font-bold scale-105 shadow-md'
                              : isPast
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className="text-[10px] block">{sd.label}</span>
                          <span className="text-xs font-black block">+{sd.points}</span>
                          {sd.isJackpot && <span className="text-[9px] text-yellow-300 font-black">🎁 JACKPOT</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleClaimStreak}
                  disabled={claimingStreak}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  {claimingStreak ? 'Claiming Daily Bonus...' : 'Claim Today\'s Streak Bonus (+Points & Cash)'}
                </button>
              </div>

              {/* VIP Tier Benefits Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <Award className="w-4 h-4" /> CartNova VIP Tier Progression
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      Gold Member Level
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Unlock Exclusive Member Privileges & Extra Cash
                  </h3>
                  <div className="space-y-3 mt-4 text-xs">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">5% Extra Cash Back:</strong>
                        <span className="text-slate-500 dark:text-slate-400 ml-1">On all invited friends' lifetime orders.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Zero-Fee Priority Logistics:</strong>
                        <span className="text-slate-500 dark:text-slate-400 ml-1">Express 24-48hr door delivery for all orders.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <Ticket className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Monthly ₦10,000 Mystery Voucher:</strong>
                        <span className="text-slate-500 dark:text-slate-400 ml-1">Automated discount coupon every 1st of the month.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('redeem')}
                  className="mt-4 w-full py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Redeem Rewards Points ({referralData.rewardPoints.toLocaleString()} Pts)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 7-Day Streak Calendar */}
        {activeTab === 'streak' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" /> Daily Check-In Streak Challenge
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Log in each day and tap Claim. Complete 7 consecutive days to receive bonus reward points and instant wallet cash.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Current Streak</span>
                  <span className="text-lg font-black text-orange-600 dark:text-orange-400">{referralData.dailyStreak} Days</span>
                </div>
                <button
                  onClick={handleClaimStreak}
                  disabled={claimingStreak}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all active:scale-95"
                >
                  {claimingStreak ? 'Claiming...' : 'Claim Today\'s Bonus'}
                </button>
              </div>
            </div>

            {/* Streak Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {streakDays.map((sd) => {
                const isClaimed = sd.day <= referralData.dailyStreak;
                const isToday = sd.day === referralData.dailyStreak;
                return (
                  <div
                    key={sd.day}
                    className={`relative rounded-2xl p-4 flex flex-col items-center justify-between text-center border-2 transition-all ${
                      isToday
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-lg scale-105'
                        : isClaimed
                        ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    {isClaimed && (
                      <span className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{sd.label}</span>
                    <div className="my-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto mb-1">
                        <Gift className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">+{sd.points} Pts</span>
                    </div>
                    {sd.isJackpot ? (
                      <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded-full">
                        ₦5,000 Cash + 1,750 Pts
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Reward points</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Rewards Redemption Shop */}
        {activeTab === 'redeem' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" /> CartNova Points Exchange Shop
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Convert your accumulated VIP rewards points into instant wallet balances, store coupons, or shipping passes.
                </p>
              </div>
              <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-right">
                <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold block">Your Available Balance</span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-200">
                  {referralData.rewardPoints.toLocaleString()} Points
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rewardShopItems.map((item) => {
                const Icon = item.icon;
                const canAfford = referralData.rewardPoints >= item.cost;
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Cost</span>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                          {item.cost.toLocaleString()} Points
                        </span>
                      </div>
                      <button
                        onClick={() => redeemRewardPoints(item.cost, item.type)}
                        disabled={!canAfford}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Now' : 'Need More Points'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Referral Activity */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> Invited Friends & Referral Commissions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track who joined using your invite code and your cash bonuses.
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">
                {referralData.successfulPurchases} Friends Completed Purchases
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sampleReferrals.map((friend) => (
                <div key={friend.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{friend.name}</h4>
                      <span className="text-[11px] text-slate-400">{friend.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block ${
                        friend.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {friend.status}
                    </span>
                    {friend.earned > 0 ? (
                      <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                        +{formatPrice(friend.earned)} Earned
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Pending Checkout</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Rules & FAQs */}
        {activeTab === 'rules' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Referral & Loyalty Program Guidelines
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <strong className="text-slate-900 dark:text-white block mb-1">When is my ₦5,000 referral bonus paid?</strong>
                Your ₦5,000 cash bonus is automatically credited to your CartNova Wallet as soon as your invited friend completes their first qualifying checkout (minimum order ₦10,000) and the order is verified by merchant dispatch.
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <strong className="text-slate-900 dark:text-white block mb-1">Is there a limit on how many people I can invite?</strong>
                No limit! You can invite as many friends, colleagues, and family members as you wish. Top referrers in Nigeria have earned upwards of ₦500,000 per month through social sharing.
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <strong className="text-slate-900 dark:text-white block mb-1">Can I withdraw wallet credits or use them for shopping?</strong>
                Yes, CartNova wallet credits can be used 100% at checkout to pay for any products, express delivery, or flash deals across all merchant categories.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
