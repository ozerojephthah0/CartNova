import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SupportTicket, SupportStatus, SupportPriority, SupportCategory } from '../../types';
import {
  LifeBuoy,
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Package,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminSupportDeskTab: React.FC = () => {
  const {
    supportTickets,
    addMessageToSupportTicket,
    updateTicketStatus,
    currentUser,
    orders,
    addToast,
  } = useStore();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    supportTickets.length > 0 ? supportTickets[0].id : null
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | SupportStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | SupportCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInput, setReplyInput] = useState('');

  const activeTicket = supportTickets.find((t) => t.id === selectedTicketId) || supportTickets[0] || null;

  const filteredTickets = supportTickets.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyInput.trim()) return;

    addMessageToSupportTicket(activeTicket.id, replyInput.trim(), 'agent');
    setReplyInput('');
    addToast('success', 'Admin Reply Sent', `Response posted to ticket #${activeTicket.ticketNumber}`);
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportStatus) => {
    updateTicketStatus(ticketId, newStatus, `Status updated by Admin (${currentUser.name})`);
  };

  return (
    <div className="space-y-6">
      {/* Support Desk Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase">
              Customer Success Operations
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {supportTickets.length} Total Tickets • {supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length} Active
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Customer Support & Live Helpdesk</h2>
          <p className="text-xs text-slate-500">
            Communicate directly with customers, escalate tickets, and resolve buyer disputes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_user">Waiting Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Two-Pane Ticket Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Ticket Queue */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Incoming Ticket Queue ({filteredTickets.length})</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No support tickets found matching filters.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = activeTicket?.id === ticket.id;
                const lastMsg = ticket.messages[ticket.messages.length - 1];

                return (
                  <button
                    key={ticket.id}
                    id={`admin-ticket-select-${ticket.id}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] text-slate-900">
                          #{ticket.ticketNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">{ticket.subject}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{lastMsg?.text || 'No messages'}</p>

                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            ticket.priority === 'urgent' || ticket.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ticket.status === 'open'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Ticket Detail & Live Chat Console */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {activeTicket ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-200/80 px-2 py-0.5 rounded">
                      #{activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      Category: {activeTicket.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Status:</span>
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleStatusChange(activeTicket.id, e.target.value as SupportStatus)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_user">Waiting Customer</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900">{activeTicket.subject}</h3>

                {/* Customer Snapshot */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                    <strong className="text-slate-900">{activeTicket.customerName}</strong> ({activeTicket.customerEmail})
                  </div>
                  {activeTicket.orderNumber && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Linked Order</span>
                      <span className="text-indigo-600 font-bold">#{activeTicket.orderNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="p-6 overflow-y-auto space-y-4 max-h-[350px] flex-1 bg-slate-50/30">
                {activeTicket.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent' || msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden ring-1 ring-slate-200">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600">
                            {isAgent ? 'A' : 'C'}
                          </div>
                        )}
                      </div>

                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
                          isAgent
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className={`font-bold text-[10px] ${isAgent ? 'text-indigo-100' : 'text-slate-600'}`}>
                            {msg.senderName} {isAgent && '★ (CartNova Support)'}
                          </span>
                          <span className={`text-[9px] ${isAgent ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendAdminReply} className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Type official response to customer..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 my-auto">
              <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">Select a ticket from the left panel to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
