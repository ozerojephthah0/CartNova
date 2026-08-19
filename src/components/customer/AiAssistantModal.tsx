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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    products,
    setQuickViewProduct,
    addToCart,
    formatPrice,
  } = useStore();

  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string; recommendedProductIds?: string[] }>
  >([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hi there! I'm Nova, your AI shopping concierge. Tell me what you're looking for, your budget, or who you are shopping for, and I'll find the perfect match from our catalog!",
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const quickPrompts = [
    '🎧 Best noise-cancelling headphones for travel',
    '🎁 Unique tech gift under ₦150,000',
    '⌚ Smartwatch for fitness tracking and sleep',
    '⌨️ Best ergonomic mechanical keyboard for coding',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessageId = Date.now().toString();
    const newMessages = [
      ...messages,
      { id: userMessageId, role: 'user' as const, text: query },
    ];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Send to server-side Gemini API endpoint
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          products: products.map((p) => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            category: p.category,
            price: p.price,
            rating: p.rating,
            description: p.description,
            stock: p.stock,
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
          text: data.reply || "Here's what I found from our catalog based on your needs!",
          recommendedProductIds: data.recommendedProductIds || [],
        },
      ]);
    } catch (err) {
      // Graceful fallback if backend call or API key is not ready
      const matched = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );

      const recommendedIds = matched.slice(0, 3).map((p) => p.id);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `I searched our inventory for "${query}" and found these top items for you!`,
          recommendedProductIds: recommendedIds.length > 0 ? recommendedIds : [products[0]?.id],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAiAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop with fade in/out animation */}
          <motion.div
            key="ai-assistant-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setIsAiAssistantOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Modal Card Window with spring entry and smooth exit */}
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
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col h-[600px] max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/40">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Nova AI Shopping Concierge</h3>
                    <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-400/20">
                      POWERED BY GEMINI
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">Live smart recommendations, gift ideas & tech specs</p>
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

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
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
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs space-y-3 shadow-2xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Recommended Products Carousel/Cards */}
                    {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                      <div className="pt-2 space-y-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-indigo-600 block">
                          Recommended Items from CartNova:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.recommendedProductIds.map((prodId) => {
                            const prod = products.find((p) => p.id === prodId);
                            if (!prod) return null;
                            return (
                              <motion.div
                                key={prod.id}
                                whileHover={{ scale: 1.02, y: -1 }}
                                transition={{ duration: 0.15 }}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-slate-100 hover:border-indigo-200 transition-colors shadow-2xs"
                              >
                                <div
                                  onClick={() => {
                                    setIsAiAssistantOpen(false);
                                    setQuickViewProduct(prod);
                                  }}
                                  className="flex items-center gap-2 min-w-0 cursor-pointer"
                                >
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.title}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-900 truncate">
                                      {prod.title}
                                    </p>
                                    <p className="text-[10px] text-indigo-600 font-extrabold">
                                      {formatPrice(prod.price)}
                                    </p>
                                  </div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => addToCart(prod, 1)}
                                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs shrink-0 cursor-pointer shadow-2xs"
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
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
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
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="font-medium">Nova is analyzing catalog & specs...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
                {quickPrompts.map((prompt, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border border-slate-200/50 hover:border-indigo-200"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-slate-200">
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
                  placeholder="Ask anything about products, gifts, or recommendations..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-indigo-600 focus:bg-white transition-colors"
                />
                <motion.button
                  id="ai-assistant-send-btn"
                  type="submit"
                  whileHover={!isLoading && inputQuery.trim() ? { scale: 1.03 } : {}}
                  whileTap={!isLoading && inputQuery.trim() ? { scale: 0.97 } : {}}
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
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
