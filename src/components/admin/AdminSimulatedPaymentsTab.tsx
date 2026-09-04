import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { SimulatedTransaction, SimulatedPaymentStatus } from '../../types';
import {
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  ShieldAlert,
  Zap,
  Sliders,
  DollarSign,
  Package,
  ArrowUpRight,
  RotateCcw,
  Check,
  X,
  Copy,
  ExternalLink,
  Info,
  Layers,
  Terminal,
  Settings,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminSimulatedPaymentsTab: React.FC = () => {
  const {
    simulatedTransactions,
    simulatedPaymentConfig,
    selectedSimulatedTxn,
    setSelectedSimulatedTxn,
    isSimulatedAlertModalOpen,
    setIsSimulatedAlertModalOpen,
    recordSimulatedPayment,
    updateSimulatedTxnStatus,
    resendSimulatedTxnAlert,
    updateSimulatedConfig,
    triggerManualTestEmailAlert,
    fetchSimulatedTransactions,
    formatPrice,
    addToast,
  } = useStore();

  // Local state for configuration & manual simulation
  const [adminEmailInput, setAdminEmailInput] = useState(simulatedPaymentConfig.adminEmail);
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState(simulatedPaymentConfig.enableAutoAlerts);
  const [fiveMinWindowEnabled, setFiveMinWindowEnabled] = useState(simulatedPaymentConfig.enableFiveMinuteWindow);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Quick Dispatch Form State
  const [testAmount, setTestAmount] = useState<number>(45000);
  const [testCustomerName, setTestCustomerName] = useState('Chinedu Okafor');
  const [testPaymentMethod, setTestPaymentMethod] = useState('TEST_CARD');
  const [isDispatching, setIsDispatching] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SimulatedPaymentStatus>('ALL');

  // Preview tab in modal
  const [modalTab, setModalTab] = useState<'email' | 'metadata' | 'json'>('email');
  const [copiedText, setCopiedText] = useState(false);

  // Keep email input in sync if config updates
  useEffect(() => {
    setAdminEmailInput(simulatedPaymentConfig.adminEmail);
    setAutoAlertsEnabled(simulatedPaymentConfig.enableAutoAlerts);
    setFiveMinWindowEnabled(simulatedPaymentConfig.enableFiveMinuteWindow);
  }, [simulatedPaymentConfig]);

  // Handle Save Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminEmailInput.includes('@')) {
      addToast('error', 'Invalid Email', 'Please provide a valid Gmail address for test alerts.');
      return;
    }
    setIsSavingConfig(true);
    await updateSimulatedConfig({
      adminEmail: adminEmailInput.trim(),
      enableAutoAlerts: autoAlertsEnabled,
      enableFiveMinuteWindow: fiveMinWindowEnabled,
    });
    setIsSavingConfig(false);
  };

  // Handle Quick Test Dispatch
  const handleTriggerManualAlert = async () => {
    setIsDispatching(true);
    await triggerManualTestEmailAlert({
      adminEmail: adminEmailInput.trim(),
      amount: testAmount,
      customerName: testCustomerName,
      paymentMethod: testPaymentMethod,
    });
    setIsDispatching(false);
  };

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    addToast('info', 'Copied', 'Copied to clipboard');
  };

  // Filter transactions
  const filteredTransactions = simulatedTransactions.filter((txn) => {
    const matchesSearch =
      !searchQuery ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalVolume = simulatedTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const activeCount = simulatedTransactions.filter(
    (t) => t.status === 'TEST_RECEIVED' || t.status === 'TEST_PENDING'
  ).length;
  const expiredCount = simulatedTransactions.filter((t) => t.status === 'TEST_EXPIRED').length;
  const confirmedCount = simulatedTransactions.filter((t) => t.status === 'TEST_CONFIRMED').length;

  // Format countdown
  const getExpiryCountdown = (expiresAt: string, status: SimulatedPaymentStatus) => {
    if (status === 'TEST_EXPIRED') return 'Expired';
    if (status === 'TEST_CONFIRMED') return 'Settled';
    if (status === 'TEST_FAILED') return 'Failed';

    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expiring...';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} left`;
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ CRITICAL DEMO / TEST MODE BANNER */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider">
                TEST & SIMULATION MODE ONLY
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                Non-Deceptive Sandbox
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              CartNova Simulated Payment Alert System (Gmail Integration)
            </h2>
            <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
              Every checkout notification is explicitly marked as a <strong>“TEST PAYMENT / SIMULATED TRANSACTION”</strong>. 
              No genuine bank APIs, OPay, or financial accounts are touched, and no actual fiat currency is deposited or transferred.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            id="refresh-simulated-txns-btn"
            onClick={() => {
              fetchSimulatedTransactions();
              addToast('info', 'Refreshed', 'Simulated transaction ledger updated.');
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Simulated Volume</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(totalVolume)}</p>
          <span className="text-[11px] text-purple-600 font-bold">
            {simulatedTransactions.length} Test Transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active (5m Window)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{activeCount}</p>
          <span className="text-[11px] text-slate-500">Pending or Received</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Confirmed / Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{confirmedCount}</p>
          <span className="text-[11px] text-emerald-600 font-bold">Admin Verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Auto Expired (5-Min)</span>
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-700">{expiredCount}</p>
          <span className="text-[11px] text-slate-400">Timed Out Safely</span>
        </div>
      </div>

      {/* Configuration & Quick Dispatcher Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Admin Gmail Alert Config (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Admin Gmail Notification Settings</h3>
                <p className="text-xs text-slate-500">Target email address for all simulated alerts</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
              Active
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Alert Gmail Address:
              </label>
              <div className="relative">
                <input
                  id="simulated-admin-email-input"
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default: <strong className="text-slate-600">ozerojephthah0@gmail.com</strong>
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAlertsEnabled}
                  onChange={(e) => setAutoAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Auto-dispatch test alert email on every customer checkout
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fiveMinWindowEnabled}
                  onChange={(e) => setFiveMinWindowEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Enforce 5-minute auto-expiry window for test transactions
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                id="save-simulated-config-btn"
                type="submit"
                disabled={isSavingConfig}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSavingConfig ? 'Saving...' : 'Save Notification Config'}
              </button>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Nodemailer Engine</span>
              </div>
            </div>
          </form>
        </div>

        {/* Card 2: Instant Test Payment Alert Dispatcher (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Sandbox Test Payment Generator</h3>
                <p className="text-xs text-slate-500">Fire a simulated transaction & dispatch Gmail alert instantly</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-[10px] font-black uppercase">
              Sandbox Dispatcher
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Amount (₦):</label>
              <input
                id="quick-test-amount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Simulated Customer:</label>
              <input
                id="quick-test-customer"
                type="text"
                value={testCustomerName}
                onChange={(e) => setTestCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Channel:</label>
              <select
                id="quick-test-method"
                value={testPaymentMethod}
                onChange={(e) => setTestPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
              >
                <option value="TEST_CARD">💳 Simulated Card (Visa/Mastercard)</option>
                <option value="TEST_TRANSFER">🏦 Simulated Bank Transfer</option>
                <option value="TEST_USSD">📱 Simulated USSD (*737#)</option>
                <option value="TEST_WALLET">👛 Simulated CartNova Wallet</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              Target Gmail: <strong className="text-slate-900 font-mono">{adminEmailInput}</strong>
            </div>
            <button
              id="fire-test-alert-btn"
              onClick={handleTriggerManualAlert}
              disabled={isDispatching}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isDispatching ? 'Dispatching Test Alert...' : '⚡ Fire Test Alert to Gmail'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Transaction Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4">
        {/* Table Header & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md uppercase">
                Simulated Transaction Ledger
              </span>
              <span className="text-xs text-slate-500">
                ({filteredTransactions.length} records)
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Test Payments & Alert Dispatch History
            </h3>
            <p className="text-xs text-slate-500">
              Audit all test transactions, 5-minute expiry countdowns, and email alert delivery statuses.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                id="search-simulated-txns"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, customer, ID..."
                className="w-48 sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
              <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>

            <select
              id="filter-simulated-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="TEST_RECEIVED">🟢 TEST_RECEIVED</option>
              <option value="TEST_PENDING">🟡 TEST_PENDING</option>
              <option value="TEST_CONFIRMED">🔵 TEST_CONFIRMED</option>
              <option value="TEST_EXPIRED">⚫ TEST_EXPIRED</option>
              <option value="TEST_FAILED">🔴 TEST_FAILED</option>
            </select>
          </div>
        </div>

        {/* Ledger Content */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Mail className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700 text-sm">No simulated transactions found</p>
            <p className="max-w-sm mx-auto text-slate-500">
              Place a test order in the store or click "⚡ Fire Test Alert to Gmail" above to generate a new simulated transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Transaction / Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount & Channel</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">5-Min Countdown</th>
                  <th className="py-3 px-4">Gmail Alert</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((txn) => {
                  const isExpired = txn.status === 'TEST_EXPIRED';
                  const isConfirmed = txn.status === 'TEST_CONFIRMED';
                  const isReceived = txn.status === 'TEST_RECEIVED';
                  const countdown = getExpiryCountdown(txn.expiresAt, txn.status);

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Transaction / Order */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>#{txn.orderNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded font-normal">
                            DEMO
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 truncate block max-w-[140px]" title={txn.id}>
                          {txn.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{txn.customerName}</div>
                        <div className="text-[11px] text-slate-400">{txn.customerEmail}</div>
                      </td>

                      {/* Amount & Method */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">
                          {formatPrice(txn.amount)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">
                          {txn.paymentMethod.replace('TEST_', '')}
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isReceived
                              ? 'bg-emerald-100 text-emerald-800'
                              : isConfirmed
                              ? 'bg-blue-100 text-blue-800'
                              : isExpired
                              ? 'bg-slate-100 text-slate-600'
                              : txn.status === 'TEST_FAILED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isReceived
                                ? 'bg-emerald-500 animate-pulse'
                                : isConfirmed
                                ? 'bg-blue-500'
                                : isExpired
                                ? 'bg-slate-400'
                                : 'bg-amber-500'
                            }`}
                          />
                          {txn.status.replace('TEST_', '')}
                        </span>
                      </td>

                      {/* 5-Min Countdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={
                              isExpired
                                ? 'text-slate-400'
                                : isConfirmed
                                ? 'text-blue-600 font-bold'
                                : 'text-amber-600 font-bold animate-pulse'
                            }
                          >
                            {countdown}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Gmail Alert */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px]">
                          {txn.emailAlert.sent ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Dispatched</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold">Pending</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[130px]" title={txn.emailAlert.recipient}>
                          {txn.emailAlert.recipient}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Email Alert Preview */}
                          <button
                            id={`view-simulated-txn-${txn.id}`}
                            onClick={() => {
                              setSelectedSimulatedTxn(txn);
                              setIsSimulatedAlertModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-purple-50 text-purple-700 hover:text-purple-900 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Email Alert & Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Resend Alert */}
                          <button
                            id={`resend-simulated-txn-${txn.id}`}
                            onClick={() => resendSimulatedTxnAlert(txn.id)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="Resend Gmail Alert"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Confirm */}
                          {!isConfirmed && !isExpired && (
                            <button
                              id={`confirm-simulated-txn-${txn.id}`}
                              onClick={() => updateSimulatedTxnStatus(txn.id, 'TEST_CONFIRMED', 'Admin verified test payment in sandbox.')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}

                          {/* Expire / Fail */}
                          {!isExpired && !isConfirmed && (
                            <button
                              id={`expire-simulated-txn-${txn.id}`}
                              onClick={() => updateSimulatedTxnStatus(txn.id, 'TEST_EXPIRED', 'Manually expired by admin.')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Expire
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: EMAIL ALERT INSPECTOR & DISPATCH PREVIEW */}
      <AnimatePresence>
        {isSimulatedAlertModalOpen && selectedSimulatedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wider uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                        TEST EMAIL ALERT PREVIEW
                      </span>
                      <span className="text-xs font-mono text-purple-300">
                        Order #{selectedSimulatedTxn.orderNumber}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-md">
                      {selectedSimulatedTxn.emailAlert.subject}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsSimulatedAlertModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setModalTab('email')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modalTab === 'email' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:bg-slate-200'
                  }`}
                >
                  📧 Rendered Email Body
                </button>
                <button
                  onClick={() => setModalTab('metadata')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modalTab === 'metadata' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:bg-slate-200'
                  }`}
                >
                  📋 Audit & Timeline
                </button>
                <button
                  onClick={() => setModalTab('json')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modalTab === 'json' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:bg-slate-200'
                  }`}
                >
                  {'{ }'} Raw JSON Payload
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedSimulatedTxn, null, 2))}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => resendSimulatedTxnAlert(selectedSimulatedTxn.id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Resend to Admin</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {modalTab === 'email' && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white font-sans">
                    {/* Simulated Email Client Header */}
                    <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-1.5 text-xs text-slate-600">
                      <div>
                        <strong>From:</strong> CartNova Payment Simulation &lt;alerts@cartnova.dev&gt;
                      </div>
                      <div>
                        <strong>To:</strong> {selectedSimulatedTxn.emailAlert.recipient}
                      </div>
                      <div>
                        <strong>Subject:</strong>{' '}
                        <span className="font-bold text-slate-900">
                          {selectedSimulatedTxn.emailAlert.subject}
                        </span>
                      </div>
                      <div>
                        <strong>Timestamp:</strong>{' '}
                        {new Date(selectedSimulatedTxn.emailAlert.sentAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Email Content Body */}
                    <div className="p-6 space-y-6">
                      {/* Red Disclaimer Banner inside email */}
                      <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-4 text-center space-y-1">
                        <span className="inline-block px-3 py-1 bg-rose-600 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                          ⚠️ TEST PAYMENT — SIMULATED TRANSACTION
                        </span>
                        <p className="text-xs text-rose-950 font-medium">
                          This is a simulation testing notification. No genuine bank API, OPay, or financial account was charged or credited.
                        </p>
                      </div>

                      {/* Header */}
                      <div className="text-center space-y-1">
                        <h2 className="text-xl font-black text-slate-900">CartNova Test Payment Alert</h2>
                        <p className="text-xs text-slate-500">
                          Order #{selectedSimulatedTxn.orderNumber} successfully simulated in Sandbox mode.
                        </p>
                      </div>

                      {/* Transaction Summary Table */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Simulated Reference:</span>
                          <span className="font-mono font-bold text-slate-900">{selectedSimulatedTxn.id}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Customer Name:</span>
                          <span className="font-bold text-slate-900">{selectedSimulatedTxn.customerName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Customer Email:</span>
                          <span className="text-slate-800">{selectedSimulatedTxn.customerEmail}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Payment Channel:</span>
                          <span className="font-bold text-purple-700">{selectedSimulatedTxn.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between py-1 text-sm font-black text-slate-900 pt-2">
                          <span>Total Amount:</span>
                          <span className="text-emerald-700">{formatPrice(selectedSimulatedTxn.amount)}</span>
                        </div>
                      </div>

                      {/* Items Purchased */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Items in Order ({selectedSimulatedTxn.items.length})
                        </h4>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                          {selectedSimulatedTxn.items.map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-slate-900">{item.title}</p>
                                  <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-black text-slate-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Disclaimer */}
                      <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-100 space-y-1">
                        <p>CartNova E-Commerce Sandbox & Email Dispatcher Engine</p>
                        <p>Sent to: {selectedSimulatedTxn.emailAlert.recipient}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'metadata' && (
                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      <h4 className="font-black text-slate-900">Transaction Lifespan</h4>
                      <p className="text-slate-600">
                        This test transaction was generated at{' '}
                        <strong>{new Date(selectedSimulatedTxn.createdAt).toLocaleString()}</strong> and expires at{' '}
                        <strong>{new Date(selectedSimulatedTxn.expiresAt).toLocaleString()}</strong>.
                      </p>
                    </div>

                    <h4 className="font-black text-slate-900 pt-2">Audit Event Timeline</h4>
                    <div className="space-y-3">
                      {selectedSimulatedTxn.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{event.status}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">{event.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalTab === 'json' && (
                  <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    {JSON.stringify(selectedSimulatedTxn, null, 2)}
                  </pre>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Message ID: <strong className="font-mono text-slate-700">{selectedSimulatedTxn.emailAlert.messageId || 'sim-local'}</strong>
                </span>
                <button
                  onClick={() => setIsSimulatedAlertModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
