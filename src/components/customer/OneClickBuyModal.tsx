import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Zap,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OneClickBuyModal: React.FC = () => {
  const {
    oneClickBuySuccessOrder,
    setOneClickBuySuccessOrder,
    formatPrice,
    setIsTrackingModalOpen,
    setTrackingOrder,
    setActiveCustomerTab,
  } = useStore();

  if (!oneClickBuySuccessOrder) return null;

  const handleTrackNow = () => {
    setTrackingOrder(oneClickBuySuccessOrder);
    setIsTrackingModalOpen(true);
    setOneClickBuySuccessOrder(null);
  };

  const handleViewOrders = () => {
    setActiveCustomerTab('orders');
    setOneClickBuySuccessOrder(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-500/20 overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 text-center relative overflow-hidden">
            <div className="mx-auto w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
              <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <h3 className="text-2xl font-black">1-Click Order Placed!</h3>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Order #{oneClickBuySuccessOrder.orderNumber} is authorized & routed for express fulfillment.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Item preview */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <img
                src={oneClickBuySuccessOrder.items[0]?.productImage}
                alt={oneClickBuySuccessOrder.items[0]?.productTitle}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {oneClickBuySuccessOrder.items[0]?.productTitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Qty: {oneClickBuySuccessOrder.items[0]?.quantity} • Total: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(oneClickBuySuccessOrder.totalAmount)}</span>
                </p>
              </div>
            </div>

            {/* Delivery address & method */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Delivering to: <strong className="font-semibold">{oneClickBuySuccessOrder.shippingAddress?.fullName}</strong>, {oneClickBuySuccessOrder.shippingAddress?.street}, {oneClickBuySuccessOrder.shippingAddress?.city}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Speed: <strong className="font-semibold">{oneClickBuySuccessOrder.carrier}</strong> • {oneClickBuySuccessOrder.estimatedDelivery}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Payment: <strong className="font-semibold">Default 1-Click Card (•••• 4242)</strong></span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleTrackNow}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Live Package Location</span>
              </button>

              <button
                onClick={handleViewOrders}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                View Order History
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
