import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, SupportTicket } from '../../types';
import {
  DollarSign,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Download,
  Check,
  X,
  Sparkles,
  ArrowUpRight,
  Wallet,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadDigitalInvoice } from '../../utils/invoiceGenerator';

export const AdminPaymentsRefundsTab: React.FC = () => {
  const {
    orders,
    supportTickets,
    simulatedTransactions,
    simulatedPaymentConfig,
    formatPrice,
    approveRefundDispute,
    rejectRefundDispute,
    addToast,
  } = useStore();

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'paid' | 'pending' | 'refunded'>('ALL');
  const [selectedDisputeTicket, setSelectedDisputeTicket] = useState<SupportTicket | null>(null);
  const [approvalNote, setApprovalNote] = useState('Refund authorized by Admin. Credited to customer CartNova Wallet.');
  const [rejectionReason, setRejectionReason] = useState('Item does not meet 30-day return eligibility policy.');
  const [customRefundAmount, setCustomRefundAmount] = useState<number | ''>('');

  // Refund / Return disputes from support tickets
  const returnDisputes = supportTickets.filter(
    (t) => t.category === 'refund_return' || t.subject.toLowerCase().includes('refund') || t.subject.toLowerCase().includes('return')
  );

  // Financial calculations
  const totalPaidVolume = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalRefundedVolume = orders
    .filter((o) => o.paymentStatus === 'refunded')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingDisputesCount = returnDisputes.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !paymentSearch ||
      o.orderNumber.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      o.paymentMethod.toLowerCase().includes(paymentSearch.toLowerCase());

    const matchesStatus = paymentStatusFilter === 'ALL' || o.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenApproveModal = (ticket: SupportTicket) => {
    setSelectedDisputeTicket(ticket);
    const relatedOrder = orders.find((o) => o.id === ticket.orderId || o.orderNumber === ticket.orderNumber);
    setCustomRefundAmount(relatedOrder ? relatedOrder.totalAmount : 0);
  };

  const handleConfirmApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeTicket) return;
    const relatedOrder = orders.find(
      (o) => o.id === selectedDisputeTicket.orderId || o.orderNumber === selectedDisputeTicket.orderNumber
    );
    const orderId = relatedOrder ? relatedOrder.id : selectedDisputeTicket.orderId || `ord-${Date.now()}`;
    const amount = typeof customRefundAmount === 'number' && customRefundAmount > 0 ? customRefundAmount : relatedOrder?.totalAmount || 0;

    approveRefundDispute(selectedDisputeTicket.id, orderId, amount, approvalNote);
    setSelectedDisputeTicket(null);
  };

  const handleConfirmReject = (ticket: SupportTicket) => {
    if (confirm(`Reject refund dispute for Ticket #${ticket.ticketNumber}?`)) {
      rejectRefundDispute(ticket.id, rejectionReason);
    }
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ Simulated Test Payments Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/40 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                TEST & SIMULATION MODE
              </span>
              <span className="text-xs text-purple-300 font-mono">
                Alert Email: {simulatedPaymentConfig.adminEmail}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Simulated Payment Alert Dispatcher Active
            </h3>
            <p className="text-xs text-purple-200/80 max-w-2xl">
              All sandbox checkouts trigger a verified <strong>“TEST PAYMENT / SIMULATED TRANSACTION”</strong> notification to your configured Gmail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-purple-800/80 border border-purple-600/50 rounded-xl text-xs font-bold text-purple-200">
            {simulatedTransactions.length} Test Records
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Settled Payments</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(totalPaidVolume)}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Secured Escrow & Gateways</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Refunds Processed</span>
            <RotateCcw className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(totalRefundedVolume)}</p>
          <span className="text-[11px] text-slate-500">
            {orders.filter((o) => o.paymentStatus === 'refunded').length} Refunded Orders
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active RMA / Return Claims</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingDisputesCount}</p>
          <span className="text-[11px] text-amber-600 font-bold">Requires Admin Decision</span>
        </div>
      </div>

      {/* Return & Refund RMA Disputes Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md uppercase">
                RMA Disputes Desk
              </span>
              {pendingDisputesCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full animate-pulse">
                  {pendingDisputesCount} Pending
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">Customer Returns & Refund Claims</h3>
            <p className="text-xs text-slate-500">
              Review customer RMA dispute cases, inspect order details, and issue instant wallet refunds or bank chargebacks.
            </p>
          </div>
        </div>

        {returnDisputes.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700">No active return disputes</p>
            <p>All customer orders and return claims are fully resolved.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {returnDisputes.map((ticket) => {
              const relatedOrder = orders.find(
                (o) => o.id === ticket.orderId || o.orderNumber === ticket.orderNumber
              );
              const isResolved = ticket.status === 'resolved';
              const isClosed = ticket.status === 'closed';

              return (
                <div key={ticket.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        #{ticket.ticketNumber}
                      </span>
                      {ticket.orderNumber && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Order #{ticket.orderNumber}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-700'
                            : isClosed
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {ticket.messages[0]?.text || 'No message provided'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Customer: <strong className="text-slate-800">{ticket.customerName}</strong> ({ticket.customerEmail})</span>
                      {relatedOrder && (
                        <span>Order Total: <strong className="text-slate-800">{formatPrice(relatedOrder.totalAmount)}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Dispute Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isResolved && !isClosed ? (
                      <>
                        <button
                          id={`approve-refund-btn-${ticket.id}`}
                          onClick={() => handleOpenApproveModal(ticket)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Refund</span>
                        </button>

                        <button
                          id={`reject-refund-btn-${ticket.id}`}
                          onClick={() => handleConfirmReject(ticket)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 italic">
                        {isResolved ? '✅ Refund Issued' : '❌ Declined'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Orders Payments & Transaction Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Payment Transactions Ledger</h3>
            <p className="text-xs text-slate-500">
              Audit all customer checkouts, gateway settlements, and refund statuses.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search payments..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-indigo-500"
              />
            </div>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="paid">Paid & Settled</option>
              <option value="pending">Pending Settlement</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3">Order Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 capitalize font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{order.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.paymentStatus === 'refunded'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          downloadDigitalInvoice(order, formatPrice);
                          addToast('success', 'Invoice Saved', `Receipt for #${order.orderNumber} exported.`);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedDisputeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedDisputeTicket(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase">
                <Wallet className="w-4 h-4" /> Authorize Customer Refund
              </div>
              <button
                onClick={() => setSelectedDisputeTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Refund Claim #{selectedDisputeTicket.ticketNumber}
            </h3>

            <form onSubmit={handleConfirmApprove} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Refund Amount (₦ / Local Value)</label>
                <input
                  type="number"
                  value={customRefundAmount}
                  onChange={(e) => setCustomRefundAmount(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Resolution Note to Customer</label>
                <textarea
                  rows={3}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Wallet Credit Action
                </p>
                <p>
                  Funds will be deposited immediately into the customer's CartNova Wallet balance, and the order will be marked Refunded.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeTicket(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Execute Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
