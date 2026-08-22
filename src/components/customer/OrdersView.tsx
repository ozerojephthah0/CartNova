import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Printer,
  X,
  RotateCcw,
  ShoppingBag,
  Navigation,
  MapPin,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Play,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertCircle,
  Phone,
  Home,
  Zap,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Download,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  ArrowUpDown,
  DollarSign,
  Calendar,
  CheckCircle,
  Compass,
  PhoneCall,
  MessageSquare,
  Radio,
  CheckCheck,
  Box,
  Share2,
  Bell,
  Info,
  LifeBuoy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadDigitalInvoice, printDigitalInvoice } from '../../utils/invoiceGenerator';

interface TrackingStep {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const SHIPPING_STAGES: TrackingStep[] = [
  {
    key: 'pending',
    title: 'Order Placed',
    subtitle: 'Payment verified',
    icon: CheckCircle2,
  },
  {
    key: 'processing',
    title: 'Processing & Packed',
    subtitle: 'Quality inspected',
    icon: Package,
  },
  {
    key: 'shipped',
    title: 'In Transit',
    subtitle: 'With courier partner',
    icon: Truck,
  },
  {
    key: 'out_for_delivery',
    title: 'Out for Delivery',
    subtitle: 'Courier in neighborhood',
    icon: Navigation,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    subtitle: 'Signed & received',
    icon: Home,
  },
];

export const OrdersView: React.FC = () => {
  const {
    orders,
    currentUser,
    isLoggedIn,
    openAuthModal,
    cancelOrder,
    updateOrderStatus,
    formatPrice,
    setActiveCustomerTab,
    addToCart,
    products,
    addToast,
    viewProductDetail,
    setIsTrackingModalOpen,
  } = useStore();

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [expandedTrackerOrderId, setExpandedTrackerOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTrackCode, setQuickTrackCode] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [viewLayout, setViewLayout] = useState<'summaries' | 'radar'>('summaries');
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});
  const [simulatedSubStep, setSimulatedSubStep] = useState<Record<string, 'in_transit' | 'out_for_delivery'>>({});
  const [deliveryNotesModalOrder, setDeliveryNotesModalOrder] = useState<Order | null>(null);
  const [deliveryNoteText, setDeliveryNoteText] = useState('Please leave at front gate with security if unavailable.');
  const [trackingNotificationActive, setTrackingNotificationActive] = useState<Record<string, boolean>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(4);

  const customerOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.customerId === currentUser.id) return true;
      if (currentUser.email && o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser.id === 'user-cust-1' || !isLoggedIn) {
        return o.customerId === 'user-cust-1' || o.customerId === 'guest';
      }
      return false;
    });
  }, [orders, currentUser.id, currentUser.email, isLoggedIn]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, sortBy, pageSize]);

  // Auto-expand tracker for the most recent active order
  useEffect(() => {
    if (customerOrders.length > 0 && !expandedTrackerOrderId) {
      const activeOrder = customerOrders.find((o) => o.status !== 'delivered' && o.status !== 'cancelled');
      if (activeOrder) {
        setExpandedTrackerOrderId(activeOrder.id);
      } else {
        setExpandedTrackerOrderId(customerOrders[0].id);
      }
    }
  }, [customerOrders.length]);

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTrackingId(trackingNum);
    addToast('success', 'Tracking Code Copied', `${trackingNum} copied to clipboard`);
    setTimeout(() => setCopiedTrackingId(null), 2500);
  };

  const handleDownloadInvoice = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    downloadDigitalInvoice(order, formatPrice);
    addToast(
      'success',
      'Invoice Downloaded',
      `Official Digital Invoice for #${order.orderNumber} saved to device (.html/printable PDF)`
    );
  };

  const handlePrintInvoice = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    printDigitalInvoice(order, formatPrice);
  };

  const handleSimulateRefresh = (orderId: string) => {
    setIsRefreshing((prev) => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      setIsRefreshing((prev) => ({ ...prev, [orderId]: false }));
      addToast('info', 'Live Tracking Synced', 'Real-time GPS courier coordinates refreshed');
    }, 800);
  };

  // Helper to advance order to next shipping step in real time
  const handleAdvanceOrderStage = (order: Order) => {
    const isOutForDelivery = simulatedSubStep[order.id] === 'out_for_delivery';

    if (order.status === 'pending') {
      updateOrderStatus(
        order.id,
        'processing',
        'Package verified at merchant fulfillment center and prepared for carrier dispatch.'
      );
      addToast('info', 'Shipping Update', `Order #${order.orderNumber} is now Processing & Packing`);
    } else if (order.status === 'processing') {
      updateOrderStatus(
        order.id,
        'shipped',
        `Dispatched with ${order.carrier || 'Express Logistics'}. Tracking: ${order.trackingNumber || 'TRK-' + Math.floor(100000 + Math.random() * 900000)}.`
      );
      setSimulatedSubStep((prev) => ({ ...prev, [order.id]: 'in_transit' }));
      addToast('info', 'Package In Transit', `Order #${order.orderNumber} picked up by carrier`);
    } else if (order.status === 'shipped' && !isOutForDelivery) {
      setSimulatedSubStep((prev) => ({ ...prev, [order.id]: 'out_for_delivery' }));
      addToast('info', 'Out for Delivery', `Order #${order.orderNumber} is on the local delivery van!`);
    } else if (order.status === 'shipped' && isOutForDelivery) {
      updateOrderStatus(
        order.id,
        'delivered',
        `Delivered safely to ${order.shippingAddress.street}, ${order.shippingAddress.city}. Signed by recipient.`
      );
      addToast('success', 'Package Delivered!', `Order #${order.orderNumber} marked as successfully delivered!`);
    }

    // Also update selectedTrackingOrder if active
    if (selectedTrackingOrder && selectedTrackingOrder.id === order.id) {
      const updatedOrder = orders.find((o) => o.id === order.id);
      if (updatedOrder) {
        setSelectedTrackingOrder({ ...updatedOrder });
      }
    }
  };

  const handleQuickTrackSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickTrackCode.trim()) {
      addToast('error', 'Tracking Code Required', 'Please enter a tracking number or order ID');
      return;
    }
    const code = quickTrackCode.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === code ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === code) ||
        o.id.toLowerCase() === code
    );
    if (found) {
      setSelectedTrackingOrder(found);
      addToast('success', 'Package Found', `Tracking items for #${found.orderNumber}`);
    } else {
      const partial = orders.find(
        (o) =>
          o.orderNumber.toLowerCase().includes(code) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(code))
      );
      if (partial) {
        setSelectedTrackingOrder(partial);
        addToast('success', 'Package Found', `Located Order #${partial.orderNumber}`);
      } else {
        addToast(
          'error',
          'Tracking ID Not Found',
          `No parcel matched "${quickTrackCode}". Check your number or test with ${customerOrders[0]?.trackingNumber || 'TRK-849201'}`
        );
      }
    }
  };

  const handleCallCourier = (order: Order) => {
    addToast(
      'info',
      'Connecting to Dispatch Driver',
      `Simulated call placed to ${order.carrier || 'Logistics'} courier driver (+234 802 889 1234)`
    );
  };

  const handleToggleNotification = (orderId: string) => {
    setTrackingNotificationActive((prev) => {
      const nextVal = !prev[orderId];
      if (nextVal) {
        addToast('success', 'SMS & Email Alerts Activated', 'You will receive real-time notifications for each delivery checkpoint');
      } else {
        addToast('info', 'Alerts Muted', 'Live notifications disabled for this shipment');
      }
      return { ...prev, [orderId]: nextVal };
    });
  };

  // Calculate percentage and step index for progress bar
  const getProgressDetails = (order: Order) => {
    if (order.status === 'cancelled') {
      return { percentage: 100, activeIndex: -1, isCancelled: true, stageText: 'Order Cancelled' };
    }

    const isOutForDelivery = simulatedSubStep[order.id] === 'out_for_delivery';

    switch (order.status) {
      case 'pending':
        return { percentage: 15, activeIndex: 0, isCancelled: false, stageText: 'Order Confirmed' };
      case 'processing':
        return { percentage: 38, activeIndex: 1, isCancelled: false, stageText: 'Packing & Quality Check' };
      case 'shipped':
        if (isOutForDelivery) {
          return { percentage: 80, activeIndex: 3, isCancelled: false, stageText: 'Out for Delivery' };
        }
        return { percentage: 60, activeIndex: 2, isCancelled: false, stageText: 'In Transit with Courier' };
      case 'delivered':
        return { percentage: 100, activeIndex: 4, isCancelled: false, stageText: 'Delivered & Signed' };
      default:
        return { percentage: 15, activeIndex: 0, isCancelled: false, stageText: 'Order Placed' };
    }
  };

  const getStatusBadge = (status: OrderStatus, isOutForDelivery?: boolean) => {
    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Delivered & Completed</span>
        </span>
      );
    }
    if (status === 'shipped') {
      if (isOutForDelivery) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Navigation className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
            <span>Out for Delivery</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3.5 h-3.5 animate-bounce text-blue-600" />
          <span>In Transit</span>
        </span>
      );
    }
    if (status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
          <span>Processing</span>
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3.5 h-3.5" />
        <span>Order Placed</span>
      </span>
    );
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) addToCart(prod, item.quantity, item.selectedVariant);
    });
    addToast('success', 'Items Reordered', `Added items from order #${order.orderNumber} to your cart`);
    setActiveCustomerTab('shop');
  };

  // Filter and sort customer orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = customerOrders.filter((ord) => {
      // Tab filter
      if (statusFilter === 'active' && (ord.status === 'delivered' || ord.status === 'cancelled')) {
        return false;
      }
      if (statusFilter === 'delivered' && ord.status !== 'delivered') {
        return false;
      }
      if (statusFilter === 'cancelled' && ord.status !== 'cancelled') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrderNum = ord.orderNumber.toLowerCase().includes(q);
        const matchTracking = (ord.trackingNumber || '').toLowerCase().includes(q);
        const matchItem = ord.items.some(
          (it) =>
            it.productTitle.toLowerCase().includes(q) ||
            (it.sellerName || '').toLowerCase().includes(q)
        );
        return matchOrderNum || matchTracking || matchItem;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'amount_high') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'amount_low') {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    return result;
  }, [customerOrders, statusFilter, searchQuery, sortBy]);

  // Pagination calculations
  const totalOrders = filteredAndSortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalOrders);
  const paginatedOrders = useMemo(() => {
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, startIndex, endIndex]);

  const activeCount = customerOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredCount = customerOrders.filter((o) => o.status === 'delivered').length;
  const totalSpend = customerOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Live Orders Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Summaries & Tracking</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black">
              LIVE RADAR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse paginated purchase summaries, download official digital tax invoices, and track live courier dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsTrackingModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <Compass className="w-4 h-4 animate-spin text-emerald-200" />
            <span>Live GPS Radar Map</span>
          </button>

          <button
            onClick={() => setActiveCustomerTab('shop')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>

      {/* 2. Order Summary Metrics Cards */}
      {customerOrders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">{customerOrders.length}</div>
            <span className="text-[10px] text-slate-500 font-medium">Lifetime purchases</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed / Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono">{deliveredCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Invoices available</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Transit</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-700 font-mono">{activeCount}</div>
            <span className="text-[10px] text-blue-600 font-medium">Real-time GPS tracking</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Spent</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono truncate">
              {formatPrice(totalSpend)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Tax & shipping included</span>
          </div>
        </div>
      )}

      {/* 2.5 Quick Package & Item Tracking Lookup Widget */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-indigo-800/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Live Item & Package Radar
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Satellite GPS Active
              </span>
            </div>
            <p className="text-xs text-indigo-200/80">
              Track any ordered item in real time, view driver checkpoints, and inspect item-by-item fulfillment status.
            </p>
          </div>

          {customerOrders.length > 0 && customerOrders[0].trackingNumber && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-indigo-200 bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-700/40">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Latest Tracking:</span>
              <button
                onClick={() => {
                  setQuickTrackCode(customerOrders[0].trackingNumber!);
                  setSelectedTrackingOrder(customerOrders[0]);
                }}
                className="font-mono font-bold text-white hover:text-indigo-300 underline cursor-pointer"
              >
                {customerOrders[0].trackingNumber}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleQuickTrackSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="quick-track-input"
              type="text"
              value={quickTrackCode}
              onChange={(e) => setQuickTrackCode(e.target.value)}
              placeholder="Enter Tracking # (e.g. TRK-849201) or Order # (e.g. ORD-984210)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white text-slate-900 placeholder:text-indigo-200/70 rounded-xl text-xs sm:text-sm font-medium border border-indigo-700/60 focus:border-white focus:outline-none transition-all placeholder:font-normal"
            />
          </div>
          <button
            id="quick-track-submit-btn"
            type="submit"
            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors whitespace-nowrap"
          >
            <Navigation className="w-4 h-4" />
            <span>Track Item Radar</span>
          </button>
        </form>
      </div>

      {/* 3. Filters, View Mode Toggle & Search Toolbar */}
      {customerOrders.length > 0 && (
        <div className="space-y-3 p-3 bg-slate-100/90 rounded-2xl border border-slate-200">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                id="filter-orders-all"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                All Orders ({customerOrders.length})
              </button>
              <button
                id="filter-orders-active"
                onClick={() => setStatusFilter('active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'active'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>In Transit</span>
                {activeCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      statusFilter === 'active' ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                id="filter-orders-delivered"
                onClick={() => setStatusFilter('delivered')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'delivered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Delivered ({deliveredCount})</span>
              </button>
              <button
                id="filter-orders-cancelled"
                onClick={() => setStatusFilter('cancelled')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'cancelled'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                Cancelled
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 self-start lg:self-auto bg-white/70 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewLayout('summaries')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'summaries'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Summary list with instant invoice downloads"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Summaries & Invoices</span>
              </button>
              <button
                onClick={() => setViewLayout('radar')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'radar'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Detailed interactive live shipping progress bar"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Live GPS Radar</span>
              </button>
            </div>
          </div>

          {/* Search, Sort & Page Size Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/70 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-orders-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order #, item name, seller, or tracking..."
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-[11px] hidden sm:inline">Sort:</span>
                <select
                  id="sort-orders-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-indigo-500 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_high">Highest Amount</option>
                  <option value="amount_low">Lowest Amount</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 pl-2 border-l border-slate-300">
                <span className="font-semibold text-[11px] hidden sm:inline">Per page:</span>
                <select
                  id="page-size-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-700 font-medium focus:outline-indigo-500 cursor-pointer"
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Paginated Orders List Rendering */}
      {paginatedOrders.length > 0 ? (
        <div className="space-y-5">
          {/* Pagination Counter Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{startIndex + 1}–{endIndex}</strong> of{' '}
              <strong className="text-slate-800">{totalOrders}</strong> orders
              {statusFilter !== 'all' && (
                <span className="ml-1 text-indigo-600 font-semibold">({statusFilter})</span>
              )}
            </span>

            {totalPages > 1 && (
              <span className="font-medium text-slate-600">
                Page <strong className="text-slate-900">{safeCurrentPage}</strong> of {totalPages}
              </span>
            )}
          </div>

          {/* Render Cards according to viewLayout */}
          {paginatedOrders.map((order) => {
            const isOutForDelivery = simulatedSubStep[order.id] === 'out_for_delivery';
            const progress = getProgressDetails(order);
            const isExpanded = expandedTrackerOrderId === order.id;
            const refreshing = isRefreshing[order.id];
            const isDelivered = order.status === 'delivered';

            if (viewLayout === 'summaries') {
              // 4A. ENHANCED ORDER SUMMARY CARD WITH DIRECT INVOICE DOWNLOAD
              return (
                <div
                  key={order.id}
                  id={`order-summary-${order.id}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300/90"
                >
                  {/* Summary Card Header */}
                  <div className="p-5 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <span className="text-base font-black text-slate-900 font-mono">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.status, isOutForDelivery)}
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          Placed on{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {order.trackingNumber && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-600">Carrier:</span>
                          <span className="font-bold text-slate-800">{order.carrier || 'Logistics Express'}</span>
                          <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {order.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleCopyTracking(order.trackingNumber!)}
                            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title="Copy Tracking Number"
                          >
                            {copiedTrackingId === order.trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Top Invoicing, Tracking & Reorder Actions */}
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        id={`track-items-btn-${order.id}`}
                        onClick={() => setSelectedTrackingOrder(order)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Track items in live interactive GPS radar"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Track Items</span>
                      </button>

                      <button
                        id={`download-invoice-btn-${order.id}`}
                        onClick={(e) => handleDownloadInvoice(order, e)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Download official digital tax invoice (.html / printable PDF)"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Download Invoice</span>
                      </button>

                      <button
                        id={`view-invoice-btn-${order.id}`}
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View and print digital receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Card Items List */}
                  <div className="p-5 space-y-4">
                    <div className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            referrerPolicy="no-referrer"
                            onClick={() => {
                              const p = products.find((pr) => pr.id === item.productId);
                              if (p) viewProductDetail(p);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => {
                                const p = products.find((pr) => pr.id === item.productId);
                                if (p) viewProductDetail(p);
                              }}
                              className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors"
                            >
                              {item.productTitle}
                            </h4>
                            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-400 mt-0.5">
                              {item.sellerName && (
                                <span>
                                  Sold by <strong className="text-slate-600">{item.sellerName}</strong>
                                </span>
                              )}
                              {item.selectedVariant &&
                                Object.entries(item.selectedVariant).map(([k, v]) => (
                                  <span key={k} className="text-indigo-600 font-medium">
                                    • {k}: {v}
                                  </span>
                                ))}
                            </div>
                            <div className="text-xs text-slate-600 font-semibold mt-1">
                              Qty: <span className="font-bold text-slate-900">{item.quantity}</span> × {formatPrice(item.unitPrice)}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900 block">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Shipping Info Snippet */}
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800">Ship to: </span>
                          <span>
                            {order.shippingAddress.fullName || order.customerName} — {order.shippingAddress.street},{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {order.status === 'delivered' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Delivered successfully</span>
                          </span>
                        ) : order.status === 'cancelled' ? (
                          <span className="text-rose-600 font-bold">Cancelled & Refunded</span>
                        ) : (
                          <span className="text-indigo-600 font-bold flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            <span>ETA: {order.estimatedDelivery || 'In 1-2 Days'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Card Footer Breakdown & Actions */}
                  <div className="p-5 pt-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>Paid via <strong className="text-slate-800 uppercase">{order.paymentMethod.replace('_', ' ')}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-semibold bg-emerald-100/90 px-2 py-0.5 rounded text-[10px]">
                        Payment Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Total Paid:</span>
                        <span className="text-base font-black text-slate-900">{formatPrice(order.totalAmount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`track-items-footer-btn-${order.id}`}
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Track Items</span>
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel order #${order.orderNumber}? Payment will be refunded.`)) {
                                cancelOrder(order.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Buy Again</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveCustomerTab('support');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Get support, request return, or start dispute"
                        >
                          <LifeBuoy className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Need Help?</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // 4B. FULL INTERACTIVE RADAR TRACKING CARD
            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Card Top Header */}
                <div className="p-6 pb-5 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <span className="text-sm sm:text-base font-black text-slate-900 font-mono tracking-tight">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.status, isOutForDelivery)}
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {order.shippingSpeed === 'overnight'
                          ? '⚡ Overnight Express'
                          : order.shippingSpeed === 'express'
                          ? '🚀 Express Tracked'
                          : '📦 Standard Delivery'}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {order.trackingNumber && (
                        <>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 font-medium">Carrier:</span>
                            <span className="font-bold text-slate-800">{order.carrier || 'Express Courier'}</span>
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {order.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleCopyTracking(order.trackingNumber!)}
                              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                              title="Copy Tracking Number"
                            >
                              {copiedTrackingId === order.trackingNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
                    <button
                      onClick={(e) => handleDownloadInvoice(order, e)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Invoice</span>
                    </button>

                    <button
                      id={`invoice-btn-${order.id}`}
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>

                    {order.status === 'pending' && (
                      <button
                        id={`cancel-order-btn-${order.id}`}
                        onClick={() => {
                          if (confirm(`Cancel order #${order.orderNumber}? Payment will be refunded.`)) {
                            cancelOrder(order.id);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Buy Again</span>
                    </button>
                  </div>
                </div>

                {/* REAL-TIME SHIPPING PROGRESS BAR SECTION */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 space-y-6">
                  {/* Progress Bar Header with Live Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Real-Time Shipping Status
                      </h3>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-indigo-600">
                        {order.status === 'delivered'
                          ? 'Package Delivered'
                          : order.status === 'cancelled'
                          ? 'Order Voided'
                          : `Estimated Arrival: ${order.estimatedDelivery || 'In 2-3 Days'}`}
                      </span>
                    </div>

                    {/* Live Simulation & Refresh Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulateRefresh(order.id)}
                        disabled={refreshing}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Ping courier GPS for live updates"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
                        <span>{refreshing ? 'Syncing...' : 'Ping Courier'}</span>
                      </button>

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleAdvanceOrderStage(order)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          title="Simulate advancing to next shipping stage in real time"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>
                            {order.status === 'pending'
                              ? 'Simulate: Start Packing'
                              : order.status === 'processing'
                              ? 'Simulate: Dispatch Courier'
                              : isOutForDelivery
                              ? 'Simulate: Mark Delivered'
                              : 'Simulate: Out for Delivery'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Multi-Step Progress Bar Container */}
                  {order.status === 'cancelled' ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">This order was cancelled</p>
                        <p className="text-[11px] text-rose-600 mt-0.5">
                          A full refund has been initiated to your original payment method ({order.paymentMethod.toUpperCase()}).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Interactive Progress Meter Line */}
                      <div className="relative pt-2 pb-2">
                        {/* Background Track */}
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          {/* Animated Active Progress Fill */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-gradient-to-r from-indigo-500 via-emerald-500 to-emerald-600'
                                : 'bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-500'
                            }`}
                          />
                        </div>

                        {/* Step Nodes along the bar */}
                        <div className="flex justify-between items-start -mt-3.5 relative">
                          {SHIPPING_STAGES.map((stage, idx) => {
                            const IconComponent = stage.icon;
                            const isCompleted = idx < progress.activeIndex || order.status === 'delivered';
                            const isCurrent = idx === progress.activeIndex && order.status !== 'delivered';

                            return (
                              <div
                                key={stage.key}
                                className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[110px]"
                              >
                                {/* Step Circle Indicator */}
                                <div
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all z-10 ${
                                    isCompleted
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                      : isCurrent
                                      ? 'bg-indigo-600 border-white ring-4 ring-indigo-500/25 text-white scale-110 shadow-md animate-pulse'
                                      : 'bg-white border-slate-300 text-slate-400'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-4 h-4 text-white stroke-[3]" />
                                  ) : (
                                    <IconComponent className="w-3.5 h-3.5" />
                                  )}
                                </div>

                                {/* Step Label */}
                                <div className="mt-2 space-y-0.5">
                                  <span
                                    className={`text-[11px] sm:text-xs font-bold block leading-tight ${
                                      isCurrent
                                        ? 'text-indigo-600 font-extrabold'
                                        : isCompleted
                                        ? 'text-slate-900'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {stage.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 hidden sm:block">
                                    {stage.subtitle}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live Courier Radar Status Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 gap-3 text-xs shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            {order.status === 'delivered' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Truck className="w-5 h-5 text-indigo-600 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">
                                {order.status === 'delivered'
                                  ? 'Delivered & Signed'
                                  : isOutForDelivery
                                  ? 'Courier Out for Delivery (3 stops away)'
                                  : order.status === 'shipped'
                                  ? 'In Transit to Regional Distribution Hub'
                                  : order.status === 'processing'
                                  ? 'Items Packed at Merchant Warehouse'
                                  : 'Order Confirmed & Payment Verified'}
                              </span>
                              {order.status !== 'delivered' && (
                                <span className="px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  ON SCHEDULE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {order.status === 'delivered'
                                ? `Delivered to ${order.shippingAddress.fullName} at ${order.shippingAddress.street}`
                                : `Destination: ${order.shippingAddress.city}, ${order.shippingAddress.state} • ${order.carrier || 'Express Logistics'}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeliveryNotesModalOrder(order)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Navigation className="w-3 h-3 text-indigo-600" />
                            <span>Drop-off Notes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items in this Order */}
                <div className="p-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Purchased Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.productTitle}</p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Price Breakdown Footer */}
                <div className="p-6 pt-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Paid with</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                      Payment Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Total Order Value:</span>
                      <span className="text-base font-black text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 5. RESPONSIVE PAGINATION CONTROLS BAR */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500">
                Showing <strong className="text-slate-900">{startIndex + 1}–{endIndex}</strong> of{' '}
                <strong className="text-slate-900">{totalOrders}</strong> results
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  id="pagination-first-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  id="pagination-prev-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {/* Page Numeric Badges */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Only show current, neighbors, first, and last if many pages
                  const isCurrent = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      id={`pagination-page-${pageNum}-btn`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  id="pagination-next-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                  id="pagination-last-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : !isLoggedIn ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign in to track your orders</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log in to view past purchase summaries, download digital tax invoices, or track active carrier dispatches in real time.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              Sign In / Log In
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <span>Continue as Guest</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {searchQuery ? 'No matching orders found' : 'No orders in this filter'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `We could not find any order matching "${searchQuery}". Try searching by a different order #, item, or carrier.`
              : 'When you make purchases on CartNova, your paginated order history and downloadable tax invoices will appear here.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Clear Search Filter
            </button>
          ) : (
            <button
              onClick={() => setActiveCustomerTab('shop')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              Start Shopping Now
            </button>
          )}
        </div>
      )}

      {/* 6. Delivery Instructions Modal */}
      {deliveryNotesModalOrder && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setDeliveryNotesModalOrder(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4 text-slate-800 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Courier Delivery Instructions</h3>
                </div>
                <button
                  onClick={() => setDeliveryNotesModalOrder(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Provide custom delivery drop-off directions or gate codes for courier order{' '}
                  <strong className="text-slate-800">#{deliveryNotesModalOrder.orderNumber}</strong>.
                </p>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Special Instructions / Gate Code:</label>
                  <textarea
                    rows={3}
                    value={deliveryNoteText}
                    onChange={(e) => setDeliveryNoteText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Leave with gate security or call upon arrival..."
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Instructions are immediately transmitted to the assigned carrier driver via dispatch telemetry.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setDeliveryNotesModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    addToast('success', 'Instructions Saved', 'Courier dispatch has updated delivery notes');
                    setDeliveryNotesModalOrder(null);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Instructions
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* 7. Enhanced Digital Printable Tax Invoice Modal with Direct File Download */}
      {selectedInvoiceOrder && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setSelectedInvoiceOrder(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6 text-slate-800 border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">CartNova Official Receipt</h3>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                      TAX INVOICE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Invoice #{selectedInvoiceOrder.orderNumber} • TIN: CARTNOVA-NG-9842109
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="modal-download-invoice-btn"
                    onClick={() => handleDownloadInvoice(selectedInvoiceOrder)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Download digital invoice file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>

                  <button
                    id="modal-print-invoice-btn"
                    onClick={() => handlePrintInvoice(selectedInvoiceOrder)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Print or Save as PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>

                  <button
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Billed To & Order Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">
                    Billed & Shipped To:
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedInvoiceOrder.shippingAddress.fullName || selectedInvoiceOrder.customerName}
                  </p>
                  <p className="text-slate-600">{selectedInvoiceOrder.shippingAddress.street}</p>
                  <p className="text-slate-600">
                    {selectedInvoiceOrder.shippingAddress.city}, {selectedInvoiceOrder.shippingAddress.state}{' '}
                    {selectedInvoiceOrder.shippingAddress.zip}
                  </p>
                  <p className="text-slate-500 pt-1">Email: {selectedInvoiceOrder.customerEmail}</p>
                  {selectedInvoiceOrder.customerPhone && (
                    <p className="text-slate-500">Phone: {selectedInvoiceOrder.customerPhone}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-left sm:text-right">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">
                    Transaction Details:
                  </span>
                  <p className="font-bold text-slate-900">
                    Date:{' '}
                    {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-slate-600">
                    Payment:{' '}
                    <strong className="text-slate-800 uppercase">
                      {selectedInvoiceOrder.paymentMethod.replace('_', ' ')}
                    </strong>
                  </p>
                  <p className="text-slate-600">
                    Status:{' '}
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                      {selectedInvoiceOrder.paymentStatus ? selectedInvoiceOrder.paymentStatus.toUpperCase() : 'PAID & VERIFIED'}
                    </span>
                  </p>
                  {selectedInvoiceOrder.trackingNumber && (
                    <p className="text-slate-500 font-mono text-[11px] pt-1">
                      Tracking: {selectedInvoiceOrder.trackingNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left font-bold text-[11px]">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoiceOrder.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-900">
                          <div>{it.productTitle}</div>
                          {it.sellerName && (
                            <div className="text-[10px] text-slate-400">Sold by {it.sellerName}</div>
                          )}
                          {it.selectedVariant && (
                            <div className="text-[10px] text-indigo-600">
                              {Object.entries(it.selectedVariant)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center text-slate-600 font-semibold">{it.quantity}</td>
                        <td className="p-3 text-right text-slate-600">{formatPrice(it.unitPrice)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatPrice(it.unitPrice * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Breakdown Footer */}
              <div className="space-y-1.5 text-xs text-right border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(selectedInvoiceOrder.subtotal)}</span>
                </div>
                {selectedInvoiceOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount / Promo ({selectedInvoiceOrder.couponCode || 'PROMO'})</span>
                    <span>-{formatPrice(selectedInvoiceOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Tax & VAT (7.5%)</span>
                  <span className="font-semibold text-slate-800">{formatPrice(selectedInvoiceOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping & Delivery Fee</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInvoiceOrder.shippingFee === 0
                      ? 'FREE'
                      : formatPrice(selectedInvoiceOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Paid</span>
                  <span className="text-indigo-600">{formatPrice(selectedInvoiceOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Modal Bottom CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">
                  CartNova Technologies Ltd. • Official Digital Record
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoiceOrder)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Invoice (.html)</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* 8. Comprehensive Live Item-by-Item Tracking Radar Modal */}
      {selectedTrackingOrder && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div
              onClick={() => setSelectedTrackingOrder(null)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-5 sm:p-7 z-10 space-y-6 text-slate-800 border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <Compass className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                          #{selectedTrackingOrder.orderNumber}
                        </h3>
                        {getStatusBadge(
                          selectedTrackingOrder.status,
                          simulatedSubStep[selectedTrackingOrder.id] === 'out_for_delivery'
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Live Satellite Item Radar & Dispatch Telemetry
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleSimulateRefresh(selectedTrackingOrder.id)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Refresh GPS Coordinates"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRefreshing[selectedTrackingOrder.id] ? 'animate-spin text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setSelectedTrackingOrder(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Carrier & Tracking Code Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                      Assigned Carrier
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedTrackingOrder.carrier || 'Logistics Express'} •{' '}
                      <span className="text-indigo-300 capitalize">
                        {selectedTrackingOrder.shippingSpeed} Airfreight
                      </span>
                    </span>
                  </div>
                </div>

                {selectedTrackingOrder.trackingNumber && (
                  <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 self-start sm:self-auto">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {selectedTrackingOrder.trackingNumber}
                    </span>
                    <button
                      onClick={() => handleCopyTracking(selectedTrackingOrder.trackingNumber!)}
                      className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                      title="Copy Tracking ID"
                    >
                      {copiedTrackingId === selectedTrackingOrder.trackingNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Live Stage Progress Indicator */}
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Current Milestone: {getProgressDetails(selectedTrackingOrder).stageText}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {selectedTrackingOrder.status === 'delivered'
                      ? 'Package Handed Over'
                      : `ETA: ${selectedTrackingOrder.estimatedDelivery || 'In 1-2 Days'}`}
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressDetails(selectedTrackingOrder).percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500"
                    />
                  </div>
                </div>

                {/* 5-Stage Stepper Grid */}
                <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                  {SHIPPING_STAGES.map((stg, i) => {
                    const currentProg = getProgressDetails(selectedTrackingOrder);
                    const isStepComplete = currentProg.activeIndex > i || selectedTrackingOrder.status === 'delivered';
                    const isStepActive = currentProg.activeIndex === i && selectedTrackingOrder.status !== 'delivered';

                    return (
                      <div key={stg.key} className="space-y-1">
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs transition-all ${
                            isStepComplete
                              ? 'bg-emerald-600 text-white'
                              : isStepActive
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isStepComplete ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{i + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold block leading-tight ${
                            isStepActive
                              ? 'text-indigo-600'
                              : isStepComplete
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {stg.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Advance Stage Simulation Button */}
                {selectedTrackingOrder.status !== 'delivered' && selectedTrackingOrder.status !== 'cancelled' && (
                  <div className="pt-2 flex justify-end border-t border-slate-200/70">
                    <button
                      onClick={() => handleAdvanceOrderStage(selectedTrackingOrder)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>
                        Simulate Next Step:{' '}
                        {selectedTrackingOrder.status === 'pending'
                          ? 'Merchant Packing'
                          : selectedTrackingOrder.status === 'processing'
                          ? 'Dispatch to Courier'
                          : simulatedSubStep[selectedTrackingOrder.id] !== 'out_for_delivery'
                          ? 'Out on Delivery Van'
                          : 'Confirm Doorstep Delivery'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Item-by-Item Tracking Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Ordered Items in this Parcel ({selectedTrackingOrder.items.length})
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">All items dispatched together</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {selectedTrackingOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-start gap-3.5 hover:bg-slate-50/50 transition-colors">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.productTitle}
                          </h5>
                          <span className="text-xs font-black text-slate-900 font-mono shrink-0">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-x-2 text-[11px] text-slate-400 mt-0.5">
                          {item.sellerName && <span>Seller: <strong className="text-slate-600">{item.sellerName}</strong></span>}
                          {item.selectedVariant &&
                            Object.entries(item.selectedVariant).map(([k, v]) => (
                              <span key={k} className="text-indigo-600 font-medium">
                                • {k}: {v}
                              </span>
                            ))}
                        </div>

                        {/* Item Fulfillment Status Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                              selectedTrackingOrder.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : selectedTrackingOrder.status === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <Box className="w-3 h-3" />
                            <span>
                              {selectedTrackingOrder.status === 'delivered'
                                ? 'Delivered & Inspected'
                                : selectedTrackingOrder.status === 'shipped'
                                ? simulatedSubStep[selectedTrackingOrder.id] === 'out_for_delivery'
                                  ? 'On Delivery Van with Courier'
                                  : 'In Transit on Route'
                                : 'Packed at Fulfillment Hub'}
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Qty: <strong className="text-slate-800">{item.quantity}</strong> unit(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier Driver & Delivery Checkpoints Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Courier Driver Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dispatch Courier Driver
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      EA
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">Emmanuel Adebayo</strong>
                      <span className="text-slate-500 text-[11px]">Toyota Hiace Van • Plate: KJA-482-XA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleCallCourier(selectedTrackingOrder)}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Driver</span>
                    </button>
                    <button
                      onClick={() => handleToggleNotification(selectedTrackingOrder.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                        trackingNotificationActive[selectedTrackingOrder.id]
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Receive SMS / Email alerts on each milestone"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{trackingNotificationActive[selectedTrackingOrder.id] ? 'Alerts On' : 'Alert Me'}</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Address & Security PIN */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Drop-off Destination
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedTrackingOrder.shippingAddress.fullName || selectedTrackingOrder.customerName}
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedTrackingOrder.shippingAddress.street}, {selectedTrackingOrder.shippingAddress.city},{' '}
                    {selectedTrackingOrder.shippingAddress.state}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/70 text-[11px]">
                    <span className="text-slate-500">Delivery PIN:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                      7291
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(selectedTrackingOrder)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Tax Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      const ord = selectedTrackingOrder;
                      setSelectedTrackingOrder(null);
                      setSelectedInvoiceOrder(ord);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedTrackingOrder(null)}
                  className="w-full sm:w-auto px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Close Radar
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};
