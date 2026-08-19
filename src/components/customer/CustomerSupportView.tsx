import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  SupportCategory,
  SupportPriority,
  SupportStatus,
  SupportTicket,
  Order,
} from '../../types';
import {
  HelpCircle,
  MessageSquare,
  LifeBuoy,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Plus,
  Send,
  User,
  Bot,
  Package,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Paperclip,
  Check,
  FileText,
  BadgeAlert,
  Headphones,
  RefreshCw,
  X,
  CreditCard,
  Truck,
  Shield,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SupportSubTab = 'help_center' | 'live_chat' | 'tickets' | 'returns_disputes';

export const CustomerSupportView: React.FC = () => {
  const {
    currentUser,
    orders,
    supportTickets,
    activeTicketId,
    setActiveTicketId,
    activeTicket,
    faqs,
    supportChatMessages,
    createSupportTicket,
    addMessageToSupportTicket,
    updateTicketStatus,
    sendLiveSupportChatMessage,
    voteFaq,
    submitOrderDisputeOrRefund,
    setActiveCustomerTab,
    viewProductDetail,
    formatPrice,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<SupportSubTab>(
    activeTicketId ? 'tickets' : 'help_center'
  );

  // FAQ State
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [votedFaqs, setVotedFaqs] = useState<Record<string, boolean>>({});

  // Live Chat State
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [selectedOrderContext, setSelectedOrderContext] = useState<Order | null>(
    orders.length > 0 ? orders[0] : null
  );

  // Ticket State
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>('all');
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [newTicketForm, setNewTicketForm] = useState<{
    subject: string;
    category: SupportCategory;
    priority: SupportPriority;
    orderId: string;
    description: string;
    phone: string;
  }>({
    subject: '',
    category: 'order_issue',
    priority: 'normal' as any,
    orderId: orders[0]?.id || '',
    description: '',
    phone: currentUser.phone || '',
  });

  // Returns / Dispute Form State
  const [selectedDisputeOrderId, setSelectedDisputeOrderId] = useState<string>(
    orders[0]?.id || ''
  );
  const [disputeReason, setDisputeReason] = useState<string>('Damaged in Transit / Broken Seal');
  const [disputeRefundMethod, setDisputeRefundMethod] = useState<'wallet' | 'card' | 'replacement'>('wallet');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [disputeSubmittedRMA, setDisputeSubmittedRMA] = useState<string | null>(null);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCat =
        selectedFaqCategory === 'all' || f.category === selectedFaqCategory;
      const q = faqSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [faqs, selectedFaqCategory, faqSearchQuery]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      if (ticketFilterStatus === 'all') return true;
      if (ticketFilterStatus === 'open') return t.status === 'open' || t.status === 'in_progress';
      if (ticketFilterStatus === 'waiting_user') return t.status === 'waiting_user';
      if (ticketFilterStatus === 'resolved') return t.status === 'resolved' || t.status === 'closed';
      return true;
    });
  }, [supportTickets, ticketFilterStatus]);

  // Categories helper
  const categoryLabels: Record<SupportCategory, { label: string; color: string }> = {
    order_issue: { label: 'Order Inquiry', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    delivery_delay: { label: 'Delivery Delay', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    refund_return: { label: 'Refund / Return', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    damaged_item: { label: 'Damaged Item', color: 'bg-red-100 text-red-800 border-red-200' },
    payment_billing: { label: 'Billing & Payments', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    account_security: { label: 'Account Security', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    general_inquiry: { label: 'General Care', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  };

  const statusLabels: Record<SupportStatus, { label: string; bg: string; dot: string }> = {
    open: { label: 'Open', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    in_progress: { label: 'In Progress', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    waiting_user: { label: 'Waiting for You', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
    resolved: { label: 'Resolved', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
    closed: { label: 'Closed', bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  };

  const handleSendLiveChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const messageText = chatInput.trim();
    setChatInput('');
    setIsChatSending(true);

    try {
      await sendLiveSupportChatMessage(messageText, selectedOrderContext?.id);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleChatActionClick = (action: { label: string; actionType: string; payload?: string }) => {
    if (action.actionType === 'view_order') {
      setActiveCustomerTab('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action.actionType === 'refund') {
      setActiveTab('returns_disputes');
    } else if (action.actionType === 'open_ticket') {
      if (action.payload) {
        setNewTicketForm((prev) => ({ ...prev, category: action.payload as any }));
      }
      setIsCreateTicketModalOpen(true);
    } else if (action.actionType === 'faq') {
      setActiveTab('help_center');
      if (action.payload) {
        setSelectedFaqCategory(action.payload);
      }
    } else if (action.actionType === 'contact_agent') {
      addToast('info', 'Connecting to Priority Agent', 'Hotline +234 800-CARTNOVA is available 24/7');
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      addToast('error', 'Incomplete Form', 'Please enter a ticket subject and description');
      return;
    }

    const matchedOrder = orders.find((o) => o.id === newTicketForm.orderId);
    const created = createSupportTicket(
      {
        subject: newTicketForm.subject.trim(),
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        orderId: newTicketForm.orderId || undefined,
        orderNumber: matchedOrder?.orderNumber,
        productName: matchedOrder?.items[0]?.productTitle,
        customerPhone: newTicketForm.phone,
      },
      newTicketForm.description.trim()
    );

    setIsCreateTicketModalOpen(false);
    setNewTicketForm({
      subject: '',
      category: 'order_issue',
      priority: 'normal' as any,
      orderId: orders[0]?.id || '',
      description: '',
      phone: currentUser.phone || '',
    });
    setActiveTab('tickets');
    setActiveTicketId(created.id);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicket) return;

    addMessageToSupportTicket(activeTicket.id, ticketReplyText.trim(), 'customer');
    setTicketReplyText('');
    addToast('success', 'Reply Sent', 'Your message has been added to ticket history');
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeOrderId) {
      addToast('error', 'Select Order', 'Please select an order to request a return or dispute');
      return;
    }

    const result = submitOrderDisputeOrRefund(
      selectedDisputeOrderId,
      [],
      disputeReason,
      disputeRefundMethod,
      disputeDetails
    );

    setDisputeSubmittedRMA(result.rmaNumber);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 mb-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>24/7 Customer Care & Support Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            How can we help you today, {currentUser.name.split(' ')[0]}?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Search answers in our Help Center, chat in real-time with our Support Concierge, track order disputes, or open an expedited support ticket.
          </p>

          {/* Quick Stats & Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Avg. Response</p>
                <p className="text-xs font-bold text-white">&lt; 2 Minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Return Policy</p>
                <p className="text-xs font-bold text-white">14-Day Free Returns</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">CartNova Care</p>
                <p className="text-xs font-bold text-white">2-Yr Warranty</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Hotline (24/7)</p>
                <p className="text-xs font-bold text-white">+234 800-NOVA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1 scrollbar-none">
        <button
          id="support-tab-help"
          onClick={() => setActiveTab('help_center')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'help_center'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help Center & FAQs</span>
        </button>

        <button
          id="support-tab-chat"
          onClick={() => setActiveTab('live_chat')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'live_chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live Support Concierge</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </button>

        <button
          id="support-tab-tickets"
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer relative ${
            activeTab === 'tickets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Support Tickets</span>
          {supportTickets.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700">
              {supportTickets.length}
            </span>
          )}
        </button>

        <button
          id="support-tab-disputes"
          onClick={() => setActiveTab('returns_disputes')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'returns_disputes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returns & Order Dispute</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HELP CENTER & FAQS */}
      {/* ========================================================================= */}
      {activeTab === 'help_center' && (
        <div className="space-y-8">
          {/* FAQ Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="faq-search-input"
              type="text"
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword (e.g. 'refund', 'tracking', 'DHL', 'warranty', 'payment')..."
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
            />
            {faqSearchQuery && (
              <button
                onClick={() => setFaqSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FAQ Category Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Topics', icon: HelpCircle },
              { id: 'orders_shipping', label: 'Orders & Shipping', icon: Truck },
              { id: 'returns_refunds', label: 'Returns & Refunds', icon: RotateCcw },
              { id: 'payments_promos', label: 'Payments & Coupons', icon: CreditCard },
              { id: 'products_warranty', label: 'Products & Warranty', icon: Shield },
              { id: 'account_security', label: 'Account & Profile', icon: User },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFaqCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedFaqCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No matching articles found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Couldn’t find what you were looking for? Reach out to our 24/7 Live Support Concierge or submit a direct ticket.
                </p>
                <button
                  onClick={() => setActiveTab('live_chat')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Chat with Live Support Concierge
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const hasVoted = votedFaqs[faq.id];
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-white border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isExpanded
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 mt-1"
                        >
                          <p className="mb-4 text-slate-700 text-sm leading-relaxed">{faq.answer}</p>

                          {/* Tags & Helpful Rating */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {faq.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-slate-500">Was this answer helpful?</span>
                              <button
                                onClick={() => {
                                  if (!hasVoted) {
                                    voteFaq(faq.id, true);
                                    setVotedFaqs((prev) => ({ ...prev, [faq.id]: true }));
                                  }
                                }}
                                disabled={hasVoted}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                  hasVoted
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{faq.helpfulCount}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Help Channels Grid */}
          <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-center text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
              Need Direct Assistance? Choose a Channel
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center hover:border-indigo-200 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Live Concierge</h4>
                <p className="text-xs text-slate-500 mb-3">Instant answers & order assistance with AI & Care Agents</p>
                <button
                  onClick={() => setActiveTab('live_chat')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Start Live Chat
                </button>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center hover:border-indigo-200 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Submit Ticket</h4>
                <p className="text-xs text-slate-500 mb-3">File complex claims, warranty claims & damaged shipments</p>
                <button
                  onClick={() => setIsCreateTicketModalOpen(true)}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Create Support Ticket
                </button>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center hover:border-indigo-200 hover:shadow-xs transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Returns & RMA</h4>
                <p className="text-xs text-slate-500 mb-3">Initiate 14-day returns and instant wallet credit</p>
                <button
                  onClick={() => setActiveTab('returns_disputes')}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Return an Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE SUPPORT CONCIERGE CHAT */}
      {/* ========================================================================= */}
      {activeTab === 'live_chat' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
            {/* Chat Top Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Nova Support Concierge</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                      Online 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">CartNova Verified Intelligent Support</p>
                </div>
              </div>

              {/* Order Context Selector */}
              {orders.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Package className="w-4 h-4 text-indigo-400" />
                  <select
                    value={selectedOrderContext?.id || ''}
                    onChange={(e) => {
                      const match = orders.find((o) => o.id === e.target.value);
                      setSelectedOrderContext(match || null);
                    }}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-200">
                      Inquire about General Topics
                    </option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                        Order #{o.orderNumber} ({o.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {supportChatMessages.map((msg) => {
                const isUser = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs overflow-hidden">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt="You" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                    )}

                    <div className={`max-w-[80%] sm:max-w-[70%] space-y-2`}>
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>

                        <div
                          className={`mt-1.5 text-[10px] font-medium ${
                            isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {/* Suggested Action Buttons from AI/Agent */}
                      {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.suggestedActions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => handleChatActionClick(act)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isChatSending && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[11px] font-medium text-slate-400">Nova is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Inquiry Pills */}
            <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold text-slate-500 flex-shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Prompts:
              </span>
              {[
                'Where is my active package?',
                'I need to return an item',
                'Report a damaged delivery',
                'Speak with human supervisor',
                'How to use discount coupon',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(prompt);
                  }}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendLiveChatMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  id="live-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your question, order issue, or request assistance..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatSending}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer flex-shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY SUPPORT TICKETS */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              {['all', 'open', 'waiting_user', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    ticketFilterStatus === st
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'all'
                    ? 'All Tickets'
                    : st === 'open'
                    ? 'Active / Open'
                    : st === 'waiting_user'
                    ? 'Waiting on You'
                    : 'Resolved / Closed'}
                </button>
              ))}
            </div>

            <button
              id="open-ticket-btn"
              onClick={() => setIsCreateTicketModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Ticket</span>
            </button>
          </div>

          {/* Tickets View Grid (List on Left, Thread on Right on Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Tickets List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No support tickets found</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Have an inquiry or issue with an order?</p>
                  <button
                    onClick={() => setIsCreateTicketModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Open New Ticket
                  </button>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = activeTicket?.id === t.id;
                  const stConfig = statusLabels[t.status];
                  const catConfig = categoryLabels[t.category] || categoryLabels.general_inquiry;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {t.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catConfig.color}`}>
                            {catConfig.label}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${stConfig.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${stConfig.dot}`} />
                          <span>{stConfig.label}</span>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mb-1">{t.subject}</h4>

                      {t.orderNumber && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                          <Package className="w-3 h-3 text-slate-400" />
                          <span>Linked Order: #{t.orderNumber}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                        <span>{t.messages.length} message(s)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Ticket Details & Active Chat Thread */}
            <div className="lg:col-span-7">
              {activeTicket ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                  {/* Ticket Header Bar */}
                  <div className="p-5 border-b border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-indigo-700">
                          {activeTicket.ticketNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            statusLabels[activeTicket.status].bg
                          }`}
                        >
                          {statusLabels[activeTicket.status].label}
                        </span>
                      </div>

                      {/* Status Action Button */}
                      {activeTicket.status !== 'resolved' && activeTicket.status !== 'closed' ? (
                        <button
                          onClick={() => updateTicketStatus(activeTicket.id, 'resolved', 'Customer marked issue as resolved')}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark as Resolved</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateTicketStatus(activeTicket.id, 'open', 'Re-opened by customer')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reopen Ticket
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mb-1">{activeTicket.subject}</h3>

                    {activeTicket.assignedAgent && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                        <img
                          src={activeTicket.assignedAgent.avatar}
                          alt={activeTicket.assignedAgent.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800">{activeTicket.assignedAgent.name}</span>
                        <span className="text-slate-400">({activeTicket.assignedAgent.title})</span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Messages History */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
                    {activeTicket.messages.map((m) => {
                      const isMe = m.sender === 'customer';
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-3 ${
                            isMe ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                              isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white'
                            }`}
                          >
                            {isMe ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>

                          <div className="max-w-[80%] space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="font-bold text-slate-700">{m.senderName}</span>
                              <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div
                              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                              }`}
                            >
                              <p>{m.text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Reply Form */}
                  <form onSubmit={handleSendTicketReply} className="p-4 bg-white border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        placeholder="Write your update or reply to specialist..."
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                      <button
                        type="submit"
                        disabled={!ticketReplyText.trim()}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer flex-shrink-0"
                      >
                        <span>Reply</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
                  <h4 className="text-base font-bold text-slate-900 mb-1">Select a Ticket to View Details</h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    Choose any existing ticket from the left panel to inspect the communication history and specialist notes.
                  </p>
                  <button
                    onClick={() => setIsCreateTicketModalOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Open New Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RETURNS & ORDER DISPUTES */}
      {/* ========================================================================= */}
      {activeTab === 'returns_disputes' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {disputeSubmittedRMA ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-10 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Return Merchandise Authorization Created</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your RMA reference code is{' '}
                <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {disputeSubmittedRMA}
                </span>
                . Our courier partner will pick up the package or verify your dispute claim within 24 hours.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund Method:</span>
                  <span className="font-bold text-slate-800 uppercase">{disputeRefundMethod} (Instant Credit)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspection Protocol:</span>
                  <span className="font-bold text-emerald-600">Pre-Approved Return</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setDisputeSubmittedRMA(null);
                    setActiveTab('tickets');
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  View in Support Tickets
                </button>
                <button
                  onClick={() => {
                    setDisputeSubmittedRMA(null);
                    setActiveCustomerTab('orders');
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Go to Orders
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  14-Day Free Returns & Dispute Center
                </h3>
                <p className="text-xs text-slate-500">
                  Select your order, choose the reason for return or dispute, and specify your preferred refund destination.
                </p>
              </div>

              <form onSubmit={handleDisputeSubmit} className="space-y-5">
                {/* Select Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Select Eligible Order
                  </label>
                  {orders.length === 0 ? (
                    <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                      You do not have any past orders yet to file a return claim.
                    </div>
                  ) : (
                    <select
                      value={selectedDisputeOrderId}
                      onChange={(e) => setSelectedDisputeOrderId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.orderNumber} - {o.items.length} item(s) - {formatPrice(o.totalAmount || (o as any).total || 0)} ({o.status.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Reason for Return */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Primary Reason for Return or Dispute
                  </label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="Damaged in Transit / Broken Seal">Damaged in Transit / Broken Seal</option>
                    <option value="Defective or Malfunctioning Hardware">Defective or Malfunctioning Hardware</option>
                    <option value="Wrong Item or Incorrect Variant Received">Wrong Item or Incorrect Variant Received</option>
                    <option value="Size Does Not Fit (Footwear / Apparel)">Size Does Not Fit (Footwear / Apparel)</option>
                    <option value="Package Missing Expected Accessories">Package Missing Expected Accessories</option>
                    <option value="Delivery Delayed Significantly Beyond Window">Delivery Delayed Significantly Beyond Window</option>
                    <option value="Changed Mind / Unopened Return Window">Changed Mind / Unopened Return Window</option>
                  </select>
                </div>

                {/* Refund Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    3. Preferred Resolution Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'wallet', label: 'NovaCash Wallet', desc: 'Instant refund + 5% bonus', icon: CreditCard },
                      { id: 'card', label: 'Original Payment Card', desc: '3–5 business days', icon: ShieldCheck },
                      { id: 'replacement', label: 'Free Replacement Unit', desc: 'Dispatched in 24h', icon: RefreshCw },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setDisputeRefundMethod(m.id as any)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          disputeRefundMethod === m.id
                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <m.icon className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-900">{m.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    4. Additional Notes / Package Condition
                  </label>
                  <textarea
                    rows={3}
                    value={disputeDetails}
                    onChange={(e) => setDisputeDetails(e.target.value)}
                    placeholder="Provide any serial numbers, photos description, or pickup instructions..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orders.length === 0}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Submit Return Request & Generate RMA</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE SUPPORT TICKET */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Create Support Ticket</h3>
                    <p className="text-xs text-slate-500">Directly assigned to specialized care agent</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCreateTicketModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="order_issue">Order Processing / Modification</option>
                    <option value="delivery_delay">Delivery Delay & Courier Dispatch</option>
                    <option value="refund_return">Refund / Return Request</option>
                    <option value="damaged_item">Damaged in Transit / Defective Item</option>
                    <option value="payment_billing">Payment, Invoices & NovaCash</option>
                    <option value="account_security">Account Security & Sign-in</option>
                    <option value="general_inquiry">General Care & Warranty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    placeholder="e.g. Courier delivery rider status for Order #ORD-84920"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {orders.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Link Order (Optional)
                    </label>
                    <select
                      value={newTicketForm.orderId}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, orderId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">No linked order</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          #{o.orderNumber} - {o.items[0]?.productTitle || (o.items[0] as any)?.title || 'Item'} ({formatPrice(o.totalAmount || (o as any).total || 0)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Urgency / Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Low', color: 'text-slate-600' },
                      { id: 'medium', label: 'Medium', color: 'text-blue-600' },
                      { id: 'urgent', label: 'Urgent / High', color: 'text-rose-600' },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setNewTicketForm({ ...newTicketForm, priority: p.id as any })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          newTicketForm.priority === p.id
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detailed Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    placeholder="Describe your issue with as much detail as possible..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateTicketModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Ticket</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
