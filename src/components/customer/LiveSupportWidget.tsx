import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LifeBuoy,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileText,
  RotateCcw,
  PhoneCall,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LiveSupportWidget: React.FC = () => {
  const {
    currentUser,
    isLiveSupportOpen,
    setIsLiveSupportOpen,
    supportChatMessages,
    sendLiveSupportChatMessage,
    setActiveCustomerTab,
    openSupportTicket,
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      await sendLiveSupportChatMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: string }) => {
    if (action.actionType === 'view_order') {
      setIsLiveSupportOpen(false);
      setActiveCustomerTab('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action.actionType === 'open_ticket') {
      setIsLiveSupportOpen(false);
      setActiveCustomerTab('support');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action.actionType === 'refund') {
      setIsLiveSupportOpen(false);
      setActiveCustomerTab('support');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action.actionType === 'faq') {
      setIsLiveSupportOpen(false);
      setActiveCustomerTab('support');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          id="floating-support-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsLiveSupportOpen(!isLiveSupportOpen)}
          className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700 cursor-pointer group"
          aria-label="Customer Support Concierge"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
          </div>

          <div className="text-left pr-1 hidden sm:block">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">24/7 Care</p>
            <p className="text-xs font-bold text-white">Support Help</p>
          </div>
        </motion.button>
      </div>

      {/* Floating Chat Modal Box */}
      <AnimatePresence>
        {isLiveSupportOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[540px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Widget Top Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Nova Support Concierge</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Online &bull; Avg reply &lt; 1 min</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsLiveSupportOpen(false);
                    setActiveCustomerTab('support');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title="Open Full Support Center"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-xs font-semibold"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsLiveSupportOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Bar */}
            <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100/80 border-b border-slate-200 text-center">
              <button
                onClick={() => {
                  setIsLiveSupportOpen(false);
                  setActiveCustomerTab('support');
                }}
                className="py-1.5 px-2 rounded-xl bg-white hover:bg-indigo-50 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors border border-slate-200/60 shadow-2xs"
              >
                Help FAQs
              </button>
              <button
                onClick={() => {
                  setIsLiveSupportOpen(false);
                  openSupportTicket();
                }}
                className="py-1.5 px-2 rounded-xl bg-white hover:bg-indigo-50 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors border border-slate-200/60 shadow-2xs"
              >
                My Tickets
              </button>
              <button
                onClick={() => {
                  setIsLiveSupportOpen(false);
                  setActiveCustomerTab('support');
                }}
                className="py-1.5 px-2 rounded-xl bg-white hover:bg-indigo-50 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors border border-slate-200/60 shadow-2xs"
              >
                Returns & RMA
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
              {supportChatMessages.map((msg) => {
                const isMe = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isMe && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="max-w-[80%] space-y-1.5">
                      <div
                        className={`p-3 rounded-2xl leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>

                      {/* Suggested Actions */}
                      {!isMe && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-col gap-1 pt-1">
                          {msg.suggestedActions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => handleActionClick(act)}
                              className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 text-[11px] font-bold transition-all shadow-2xs flex items-center justify-between"
                            >
                              <span>{act.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt bar */}
            <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <button
                onClick={() => setInputMessage('Track my latest order status')}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded-md whitespace-nowrap text-slate-600 hover:text-indigo-600"
              >
                Track Order
              </button>
              <button
                onClick={() => setInputMessage('I want to return an item')}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded-md whitespace-nowrap text-slate-600 hover:text-indigo-600"
              >
                Start Return
              </button>
              <button
                onClick={() => setInputMessage('Contact support specialist')}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded-md whitespace-nowrap text-slate-600 hover:text-indigo-600"
              >
                Agent Chat
              </button>
            </div>

            {/* Widget Input Form */}
            <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question or describe issue..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
