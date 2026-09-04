import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  Loader2,
  HelpCircle,
  Gift,
  Zap,
  Tag,
  Calendar,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store,
  Layers,
  Check,
  Copy,
  Smartphone,
  Tablet,
  Footprints,
  Headphones,
  Laptop,
  Home,
  Shirt,
  Gamepad2,
  Watch,
  LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SeasonalEvent } from '../../types';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    products,
    categories,
    seasonalEvents,
    setQuickViewProduct,
    addToCart,
    formatPrice,
    activeRole,
    activateSeasonalEventDiscount,
    appliedCoupon,
    addToast,
    setIsCartOpen,
  } = useStore();

  const [aiRoleMode, setAiRoleMode] = useState<'customer' | 'seller' | 'admin'>(activeRole || 'customer');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSeasonalEventFilter, setSelectedSeasonalEventFilter] = useState<SeasonalEvent | null>(null);
  const [activeMenuTab, setActiveMenuTab] = useState<'categories' | 'seasonal' | 'prompts'>('categories');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync role mode when opened
  useEffect(() => {
    if (isAiAssistantOpen && activeRole) {
      setAiRoleMode(activeRole);
    }
  }, [isAiAssistantOpen, activeRole]);

  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant';
      text: string;
      recommendedProductIds?: string[];
      featuredCategory?: string;
      seasonalEventCode?: string;
    }>
  >([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hi there! I'm **Nova**, your multi-role CartNova AI Concierge & Intelligence Engine. Browse categories, explore seasonal campaigns, or ask me for personalized shopping, merchant copy, and store audit insights!",
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const seasonalScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiAssistantOpen) {
      scrollToBottom();
    }
  }, [messages, isAiAssistantOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiAssistantOpen) {
        setIsAiAssistantOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiAssistantOpen, setIsAiAssistantOpen]);

  const scrollHorizontally = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Tablet':
      case 'Tablets':
      case 'Tablets & iPads':
        return <Tablet className={className} />;
      case 'Footprints':
        return <Footprints className={className} />;
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'Headphones':
        return <Headphones className={className} />;
      case 'Laptop':
        return <Laptop className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Shirt':
        return <Shirt className={className} />;
      case 'Gamepad2':
        return <Gamepad2 className={className} />;
      case 'Watch':
        return <Watch className={className} />;
      default:
        return <LayoutGrid className={className} />;
    }
  };

  const roleQuickPrompts: Record<'customer' | 'seller' | 'admin', string[]> = {
    customer: [
      '🎧 Best noise-cancelling headphones for travel',
      '🎁 Unique tech gift under ₦150,000',
      '⚡ Show me top deals for Black Friday Bonanza (20% OFF)',
      '👟 Trending luxury leather footwear',
      '📱 Flagship 5G smartphones with AMOLED display',
    ],
    seller: [
      '✍️ Generate high-converting product title & description for Smartphones',
      '📈 Pricing and inventory strategy for Audio & Wearables',
      '🔥 How to optimize listings for Cyber Week & Holiday campaigns',
      '📦 Low stock alerts and restock recommendations',
    ],
    admin: [
      '📊 Audit catalog inventory levels across all categories',
      '🏷️ Review all 14 Seasonal Event coupon codes and statuses',
      '🔍 Check price competitiveness in Electronics & Computers',
      '⭐ Summarize customer satisfaction across top brands',
    ],
  };

  const handleCopyAndApplyCode = (code: string, event?: SeasonalEvent) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (event) {
      activateSeasonalEventDiscount(event);
    } else {
      const match = seasonalEvents.find((e) => e.couponCode.toUpperCase() === code.toUpperCase());
      if (match) {
        activateSeasonalEventDiscount(match);
      } else {
        addToast({
          type: 'success',
          title: 'Coupon Copied!',
          message: `Code ${code} copied to clipboard (Flat 20% discount).`,
        });
      }
    }
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleSendMessage = async (textToSend?: string, customCategory?: string, customEvent?: SeasonalEvent | null) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    const cat = customCategory !== undefined ? customCategory : selectedCategoryFilter;
    const evt = customEvent !== undefined ? customEvent : selectedSeasonalEventFilter;

    if (!query && cat === 'all' && !evt && isLoading) return;

    const userDisplayText = query || (evt ? `Tell me about ${evt.name} and recommended products` : `Show top products in ${cat}`);
    const userMessageId = Date.now().toString();

    const newMessages = [
      ...messages,
      { id: userMessageId, role: 'user' as const, text: userDisplayText },
    ];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Send to server-side Gemini API endpoint with enriched category and seasonal event payload
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userDisplayText,
          role: aiRoleMode,
          category: cat,
          seasonalEvent: evt,
          seasonalEvents: seasonalEvents.map((e) => ({
            id: e.id,
            name: e.name,
            month: e.month,
            couponCode: e.couponCode,
            status: e.status,
            discountPercent: e.discountPercent,
          })),
          categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
          })),
          products: products.map((p) => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            category: p.category,
            price: p.price,
            rating: p.rating,
            description: p.description,
            stock: p.stock,
            tags: p.tags,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI assistant');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply || "Here's what I found from our catalog based on your selection!",
          recommendedProductIds: data.recommendedProductIds || [],
          featuredCategory: data.featuredCategory,
          seasonalEventCode: data.seasonalEventCode,
        },
      ]);
    } catch (err) {
      // Graceful fallback with real catalog matching
      const lowerQuery = userDisplayText.toLowerCase();
      const matched = products.filter((p) => {
        const catMatch = cat === 'all' || p.category.toLowerCase() === cat.toLowerCase();
        const queryMatch =
          !query ||
          p.title.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery);
        return catMatch && queryMatch;
      });

      const recommendedIds = matched.slice(0, 4).map((p) => p.id);

      let fallbackText = `I analyzed CartNova's catalog for **${userDisplayText}**!`;
      if (evt) {
        fallbackText = `🎉 **${evt.name} Campaign**: Apply promo code \`${evt.couponCode}\` to claim a guaranteed **20% discount**! Here are the spotlight items:`;
      } else if (cat !== 'all') {
        fallbackText = `📦 **Category Spotlight (${cat})**: Here are our verified best-selling items in this category with real-time stock:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: fallbackText,
          recommendedProductIds: recommendedIds.length > 0 ? recommendedIds : [products[0]?.id],
          featuredCategory: cat !== 'all' ? cat : undefined,
          seasonalEventCode: evt ? evt.couponCode : undefined,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPillClick = (catName: string) => {
    setSelectedCategoryFilter(catName);
    setSelectedSeasonalEventFilter(null);
    if (catName === 'all') {
      handleSendMessage('Show all top featured items across CartNova catalog', 'all', null);
    } else {
      handleSendMessage(`What are the top rated products and specs in ${catName}?`, catName, null);
    }
  };

  const handleSeasonalEventClick = (event: SeasonalEvent) => {
    setSelectedSeasonalEventFilter(event);
    setSelectedCategoryFilter('all');
    handleSendMessage(`Tell me about the ${event.name} campaign (${event.dateRange}) and show curated items with 20% discount code ${event.couponCode}`, 'all', event);
  };

  return (
    <AnimatePresence>
      {isAiAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            key="ai-assistant-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setIsAiAssistantOpen(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
          />

          {/* Modal Card Window */}
          <motion.div
            key="ai-assistant-card"
            initial={{ opacity: 0, scale: 0.93, y: 20, filter: 'blur(4px)' }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: {
                type: 'spring',
                stiffness: 380,
                damping: 28,
                mass: 0.9,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 16,
              filter: 'blur(2px)',
              transition: {
                duration: 0.18,
                ease: [0.4, 0, 1, 1],
              },
            }}
            id="ai-assistant-modal"
            className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col h-[700px] max-h-[92vh]"
          >
            {/* Header with Persona Switcher */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white p-4 sm:p-5 flex flex-col gap-3 border-b border-indigo-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-white tracking-tight">Nova AI Intelligence Engine</h3>
                      <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold rounded-md border border-indigo-400/20">
                        GEMINI 3.7 FLASH
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Multi-Role Concierge • Categories • Seasonal Events • Real-Time Inventory
                    </p>
                  </div>
                </div>

                <motion.button
                  id="close-ai-assistant-modal-btn"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsAiAssistantOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Role Perspective Switcher Chips */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  AI Mode:
                </span>
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setAiRoleMode('customer')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      aiRoleMode === 'customer'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Customer Concierge</span>
                  </button>

                  <button
                    onClick={() => setAiRoleMode('seller')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      aiRoleMode === 'seller'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Merchant Co-Pilot</span>
                  </button>

                  <button
                    onClick={() => setAiRoleMode('admin')}
                    className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      aiRoleMode === 'admin'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Store Auditor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Header Menu Navigation (Categories / Seasonal Events / Quick Prompts) */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMenuTab('categories')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeMenuTab === 'categories'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Categories ({categories.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveMenuTab('seasonal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeMenuTab === 'seasonal'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-300'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>Seasonal Events ({seasonalEvents.length})</span>
                    <span className="px-1 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded">
                      20% OFF
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveMenuTab('prompts')}
                    className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition-all cursor-pointer ${
                      activeMenuTab === 'prompts'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Prompts</span>
                  </button>
                </div>

                {/* Scroll Navigation Arrows */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      scrollHorizontally(
                        activeMenuTab === 'categories' ? categoriesScrollRef : seasonalScrollRef,
                        'left'
                      )
                    }
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      scrollHorizontally(
                        activeMenuTab === 'categories' ? categoriesScrollRef : seasonalScrollRef,
                        'right'
                      )
                    }
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Horizontally Scrollable Categories Menu Bar */}
              {activeMenuTab === 'categories' && (
                <div
                  ref={categoriesScrollRef}
                  className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
                >
                  {/* All Products Pill */}
                  <button
                    onClick={() => handleCategoryPillClick('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0 ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>All Products ({products.length})</span>
                  </button>

                  {/* Individual Category Pills */}
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryFilter.toLowerCase() === cat.name.toLowerCase();
                    const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryPillClick(cat.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {getCategoryIcon(cat.iconName)}
                        <span>{cat.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Horizontally Scrollable Seasonal Events Menu Bar */}
              {activeMenuTab === 'seasonal' && (
                <div
                  ref={seasonalScrollRef}
                  className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
                >
                  {seasonalEvents.map((evt) => {
                    const isSelected = selectedSeasonalEventFilter?.id === evt.id;
                    const isLive = evt.status === 'live_now';
                    return (
                      <button
                        key={evt.id}
                        onClick={() => handleSeasonalEventClick(evt)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0 ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-2 ring-amber-300'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{evt.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase ${
                            isLive
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                          }`}
                        >
                          {isLive ? 'Live 🔥' : '-20%'}
                        </span>
                        <span className="font-mono text-[10px] opacity-80">{evt.couponCode}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick AI Prompts */}
              {activeMenuTab === 'prompts' && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                  {roleQuickPrompts[aiRoleMode].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs space-y-3 shadow-2xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Seasonal Event Code Banner if attached to response */}
                    {msg.seasonalEventCode && (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">
                              Event 20% Discount Code:
                            </span>
                            <span className="text-xs font-black font-mono text-amber-950 dark:text-amber-200">
                              {msg.seasonalEventCode}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyAndApplyCode(msg.seasonalEventCode!)}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          {copiedCode === msg.seasonalEventCode || appliedCoupon?.code === msg.seasonalEventCode ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Apply 20%</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Recommended Products Carousel/Cards */}
                    {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                      <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                            Curated Catalog Recommendations:
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Real-Time Inventory</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.recommendedProductIds.map((prodId) => {
                            const prod = products.find((p) => p.id === prodId);
                            if (!prod) return null;
                            const hasSeasonalCode = !!msg.seasonalEventCode || !!appliedCoupon;
                            const discountedPrice = hasSeasonalCode ? Math.floor(prod.price * 0.8) : prod.price;

                            return (
                              <motion.div
                                key={prod.id}
                                whileHover={{ scale: 1.02, y: -1 }}
                                transition={{ duration: 0.15 }}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-2xs"
                              >
                                <div
                                  onClick={() => {
                                    setIsAiAssistantOpen(false);
                                    setQuickViewProduct(prod);
                                  }}
                                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                                >
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.title}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                      {prod.category}
                                    </span>
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                      {prod.title}
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black">
                                        {formatPrice(discountedPrice)}
                                      </span>
                                      {hasSeasonalCode && (
                                        <span className="text-[9px] text-slate-400 line-through">
                                          {formatPrice(prod.price)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    addToCart(prod, 1);
                                    addToast({
                                      type: 'success',
                                      title: 'Added to Cart',
                                      message: `${prod.title} added via Nova AI Concierge.`,
                                    });
                                  }}
                                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs shrink-0 cursor-pointer shadow-2xs"
                                  title="Add to Cart"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </motion.button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex gap-3 items-center text-xs text-slate-500"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="font-medium">Nova is analyzing categories, seasonal campaigns & inventory...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box with quick role prompt buttons */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  id="ai-assistant-input"
                  type="text"
                  placeholder={
                    aiRoleMode === 'seller'
                      ? 'Ask for high-converting titles, descriptions, or category pricing...'
                      : aiRoleMode === 'admin'
                      ? 'Ask for category inventory audits, seasonal campaign stats, or margins...'
                      : 'Ask anything about products, gifts, categories, or seasonal event discounts...'
                  }
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
                <motion.button
                  id="ai-assistant-send-btn"
                  type="submit"
                  whileHover={!isLoading && inputQuery.trim() ? { scale: 1.03 } : {}}
                  whileTap={!isLoading && inputQuery.trim() ? { scale: 0.97 } : {}}
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
