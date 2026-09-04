import React, { useState } from 'react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Truck,
  Phone,
  PhoneCall,
  MessageSquare,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Box,
  Download,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Play,
  ChevronRight,
  Info,
  ExternalLink,
  KeyRound,
  Sparkles,
  Receipt,
  Navigation,
  Bell,
  Home,
  AlertTriangle,
  User,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderInformationMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  isOutForDelivery?: boolean;
  onAdvanceStage?: (order: Order) => void;
  onCallCourier?: (order: Order) => void;
  onToggleAlerts?: (orderId: string) => void;
  isAlertActive?: boolean;
  onDownloadInvoice?: (order: Order, e?: React.MouseEvent) => void;
  onViewReceipt?: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  onOpenDropoffNotes?: (order: Order) => void;
}

type MenuSection = 'all' | 'driver' | 'delivery' | 'items' | 'payment' | 'address';

export const OrderInformationMenuDrawer: React.FC<OrderInformationMenuDrawerProps> = ({
  isOpen,
  onClose,
  order,
  isOutForDelivery = false,
  onAdvanceStage,
  onCallCourier,
  onToggleAlerts,
  isAlertActive = false,
  onDownloadInvoice,
  onViewReceipt,
  onCancelOrder,
  onOpenDropoffNotes,
}) => {
  const { formatPrice, viewProductDetail, products, addToCart, addToast } = useStore();
  const [activeSection, setActiveSection] = useState<MenuSection>('all');
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    addToast('success', 'Tracking Code Copied', `${code} copied to clipboard`);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, item.quantity, item.selectedVariant);
      }
    });
    addToast('success', 'Items Added to Cart', `${order.items.length} item(s) added from Order #${order.orderNumber}`);
    onClose();
  };

  const stages = [
    { key: 'pending', title: 'Order Placed', subtitle: 'Payment verified', icon: CheckCircle2 },
    { key: 'processing', title: 'Merchant Packed', subtitle: 'Quality inspected', icon: Package },
    { key: 'shipped', title: 'In Transit', subtitle: 'With carrier dispatch', icon: Truck },
    { key: 'out_for_delivery', title: 'Out for Delivery', subtitle: 'Courier in neighborhood', icon: Navigation },
    { key: 'delivered', title: 'Delivered', subtitle: 'Signed & verified', icon: Home },
  ];

  const getStageIndex = () => {
    if (order.status === 'delivered') return 4;
    if (order.status === 'shipped') return isOutForDelivery ? 3 : 2;
    if (order.status === 'processing') return 1;
    return 0;
  };

  const currentStageIndex = getStageIndex();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Slide-out Drawer Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            id={`order-info-menu-drawer-${order.id}`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-white truncate">
                      Order Menu & Details
                    </h3>
                    <span className="font-mono text-xs font-extrabold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-500/30">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <button
                id="close-order-info-menu-btn"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filter Section Tabs */}
            <div className="flex items-center gap-1.5 p-2.5 sm:px-4 bg-slate-100/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0 text-xs">
              {[
                { id: 'all', label: 'All Info' },
                { id: 'driver', label: 'Driver & Contact' },
                { id: 'delivery', label: 'Delivery Status' },
                { id: 'address', label: 'Address & PIN' },
                { id: 'items', label: 'Order Items' },
                { id: 'payment', label: 'Payment & Total' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as MenuSection)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeSection === tab.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content Sections */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* SECTION 1: DRIVER INFORMATION & CONTACT OPTIONS */}
              {(activeSection === 'all' || activeSection === 'driver') && (
                <div
                  id="menu-section-driver"
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 dark:from-slate-800/90 dark:via-slate-800/50 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Driver & Courier Information
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.carrier || 'CartNova Priority Express'} • Telemetry Active
                        </span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Assigned Driver
                    </span>
                  </div>

                  {/* Driver Bio Card */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3.5">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                      alt="Assigned Driver"
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                          Emmanuel Adebayo (Babatunde)
                        </strong>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Toyota HiAce Van • White • <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Plate: KJA-482-XA</span>
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        ⭐ 4.98 Rating • 1,420 Completed Deliveries
                      </p>
                    </div>
                  </div>

                  {/* Contact Options Grid */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                      Direct Contact & Alert Options
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        id="menu-call-driver-btn"
                        onClick={() => onCallCourier ? onCallCourier(order) : addToast('info', 'Connecting...', 'Calling assigned driver')}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </button>

                      <button
                        id="menu-toggle-alerts-btn"
                        onClick={() => onToggleAlerts ? onToggleAlerts(order.id) : null}
                        className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          isAlertActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>{isAlertActive ? 'SMS Alerts Active' : 'Enable SMS Alerts'}</span>
                      </button>

                      {onOpenDropoffNotes && (
                        <button
                          id="menu-dropoff-notes-btn"
                          onClick={() => onOpenDropoffNotes(order)}
                          className="sm:col-span-2 p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Add Drop-off Instructions / Gate Notes for Driver</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: DELIVERY STATUS & LIVE PROGRESS */}
              {(activeSection === 'all' || activeSection === 'delivery') && (
                <div
                  id="menu-section-delivery"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Delivery Status & Milestones
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.status === 'delivered' ? 'Completed & Signed' : `Estimated Delivery: ${order.estimatedDelivery || 'In 1-2 Days'}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      ETA: {order.status === 'delivered' ? 'Delivered' : 'Today, 2:30 PM'}
                    </span>
                  </div>

                  {/* Step Progress Stepper */}
                  <div className="space-y-3 pt-2">
                    {stages.map((stg, i) => {
                      const isComplete = currentStageIndex > i || order.status === 'delivered';
                      const isCurrent = currentStageIndex === i && order.status !== 'delivered';

                      return (
                        <div key={stg.key} className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 transition-all ${
                              isComplete
                                ? 'bg-emerald-600 shadow-xs'
                                : isCurrent
                                ? 'bg-orange-600 ring-4 ring-orange-500/20 animate-pulse'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                            }`}
                          >
                            {isComplete ? <Check className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-bold leading-tight ${
                                isComplete
                                  ? 'text-slate-900 dark:text-slate-100'
                                  : isCurrent
                                  ? 'text-orange-600 dark:text-orange-400 font-extrabold'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {stg.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {stg.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage Simulator Button */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && onAdvanceStage && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80">
                      <button
                        onClick={() => onAdvanceStage(order)}
                        className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                      >
                        <Play className="w-3.5 h-3.5 fill-indigo-600" />
                        <span>Simulate Next Delivery Checkpoint</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: DELIVERY ADDRESS & SECURITY PIN */}
              {(activeSection === 'all' || activeSection === 'address') && (
                <div
                  id="menu-section-address"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Delivery Address & Drop-Off
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      Destination
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div>
                      <strong className="text-xs text-slate-900 dark:text-white block">
                        {order.shippingAddress.fullName || order.customerName}
                      </strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {order.shippingAddress.street}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Phone: <strong className="text-slate-800 dark:text-slate-200">{order.customerPhone || '+234 803 123 4567'}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <KeyRound className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold">Handover PIN:</span>
                      </div>
                      <span className="font-mono font-black text-sm bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-md border border-orange-200 dark:border-orange-800 shadow-2xs">
                        7291
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: ORDER DETAILS & PURCHASED ITEMS */}
              {(activeSection === 'all' || activeSection === 'items') && (
                <div
                  id="menu-section-items"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Order Details & Items ({order.items.length})
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.items.reduce((acc, i) => acc + i.quantity, 0)} total units
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-start gap-3 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            const p = products.find((pr) => pr.id === item.productId);
                            if (p) viewProductDetail(p);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5
                            onClick={() => {
                              const p = products.find((pr) => pr.id === item.productId);
                              if (p) viewProductDetail(p);
                            }}
                            className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
                          >
                            {item.productTitle}
                          </h5>
                          {item.sellerName && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              Sold by {item.sellerName}
                            </span>
                          )}
                          {item.selectedVariant && (
                            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {Object.entries(item.selectedVariant).map(([k, v]) => (
                                <span key={k}>
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1">
                            Qty: <strong className="text-slate-900 dark:text-white">{item.quantity}</strong> × {formatPrice(item.unitPrice)}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white font-mono block">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: PAYMENT INFORMATION & FINANCIAL BREAKDOWN */}
              {(activeSection === 'all' || activeSection === 'payment') && (
                <div
                  id="menu-section-payment"
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Payment Information & Breakdown
                      </h4>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Escrow Verified
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Payment Method:</span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">
                        {order.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Items Subtotal:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount ({order.couponCode || 'PROMO'}):</span>
                        <span className="font-bold">-{formatPrice(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">VAT / Tax (7.5%):</span>
                      <span className="text-slate-700 dark:text-slate-300">{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Delivery Fee:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Total Amount Paid:</span>
                      <span className="font-black text-base text-orange-600 dark:text-orange-400 font-mono">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: SECONDARY INFORMATION, INVOICING & ACTIONS */}
              <div
                id="menu-section-secondary"
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
              >
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Secondary Details & Actions
                </h4>

                {order.trackingNumber && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Official Carrier Tracking #
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {order.trackingNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(order.trackingNumber!)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {onDownloadInvoice && (
                    <button
                      id="menu-download-invoice-btn"
                      onClick={(e) => onDownloadInvoice(order, e)}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Tax Invoice</span>
                    </button>
                  )}

                  {onViewReceipt && (
                    <button
                      id="menu-view-receipt-btn"
                      onClick={() => {
                        onClose();
                        onViewReceipt(order);
                      }}
                      className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  )}

                  <button
                    id="menu-reorder-btn"
                    onClick={handleReorder}
                    className="p-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder All Items</span>
                  </button>

                  {order.status === 'pending' && onCancelOrder && (
                    <button
                      id="menu-cancel-order-btn"
                      onClick={() => {
                        if (confirm(`Cancel order #${order.orderNumber}? Full payment will be refunded immediately.`)) {
                          onCancelOrder(order.id);
                          onClose();
                        }
                      }}
                      className="p-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Amount:</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
