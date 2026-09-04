import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Truck,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Package,
  Navigation,
  Sparkles,
  Menu,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderInformationMenuDrawer } from './OrderInformationMenuDrawer';

export const LivePackageTrackerModal: React.FC = () => {
  const {
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    trackingOrder,
    orders,
    formatPrice,
    addToast,
  } = useStore();

  const [simulatedProgress, setSimulatedProgress] = useState(65);
  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const activeOrder = trackingOrder || orders[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => (prev >= 92 ? 65 : prev + 1));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (!isTrackingModalOpen || !activeOrder) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Truck className="w-5 h-5 animate-pulse" />
                </span>
                <h3 className="text-base sm:text-lg font-bold truncate">Live Package Radar & Delivery</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Order #{activeOrder.orderNumber} • Tracking: <span className="font-mono text-emerald-400 font-bold">{activeOrder.trackingNumber || 'CNTRK-98214-LAG'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="live-tracker-menu-btn"
                onClick={() => setIsOrderMenuOpen(true)}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/25 active:scale-95 transition-all cursor-pointer"
                title="Open Order Information Menu (Driver, Delivery, Address, Items & Payment)"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>

              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Live Visual Map Simulation Canvas */}
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

              {/* Road route line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 50 200 Q 250 80, 420 160 T 680 90"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  className="animate-[dash_20s_linear_infinite]"
                />
              </svg>

              {/* Destination Pin */}
              <div className="absolute top-16 right-12 flex flex-col items-center z-10">
                <div className="p-2.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-black/80 px-2 py-0.5 rounded-md mt-1 border border-emerald-500/40">
                  Your Address
                </span>
              </div>

              {/* Delivery Van Position */}
              <motion.div
                className="absolute z-20 flex flex-col items-center"
                style={{
                  left: `${simulatedProgress}%`,
                  top: '42%',
                }}
                transition={{ ease: 'easeInOut' }}
              >
                <div className="p-3 rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-600/60 ring-4 ring-orange-500/30 flex items-center gap-1.5">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-full mt-1.5 border border-orange-500/50 shadow-md whitespace-nowrap">
                  3 Stops Away • ETA 18 mins
                </div>
              </motion.div>

              {/* Warehouse Origin Pin */}
              <div className="absolute bottom-10 left-8 flex flex-col items-center z-10">
                <div className="p-2 rounded-full bg-blue-600 text-white shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-300 bg-black/70 px-2 py-0.5 rounded mt-1">
                  CartNova Direct Hub
                </span>
              </div>
            </div>

            {/* Clean Essential Status Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">
                      Out for Delivery • On Schedule
                    </strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full">
                      Live GPS Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assigned courier is 3 stops away. Extra driver, payment, address & milestone details are hidden in the <strong>Menu</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setIsOrderMenuOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span>Open Menu</span>
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isExpanded ? 'Hide Extra Details' : 'Details'}</span>
                </button>
              </div>
            </div>

            {/* Expandable Extra Details (Hidden by default) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 pt-2"
                >
                  {/* Courier Card & Contact */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                        alt="Courier Driver"
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Babatunde Alabi (CartNova Express Driver)</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Toyota HiAce Van • White • Plate: LAG-882-CN</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => addToast('info', 'Connecting Driver', 'Placing simulated call to Babatunde (+234 802 889 1234)')}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </button>
                      <button
                        onClick={() => addToast('success', 'Instructions Saved', 'Driver notified of gate drop-off preferences')}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Instructions</span>
                      </button>
                    </div>
                  </div>

                  {/* Step-by-Step Delivery Progress Stepper */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Delivery Timeline & Milestones:
                    </span>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-emerald-500 text-white mt-0.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Order Processed & Packaged</p>
                          <p className="text-[11px] text-slate-500">CartNova Central Warehouse, Ikeja Industrial Estate</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-emerald-500 text-white mt-0.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Dispatched to Local Distribution Center</p>
                          <p className="text-[11px] text-slate-500">Victoria Island Fulfillment Facility</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-orange-500 text-white mt-0.5 shrink-0 animate-pulse">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400">Out for Delivery (On the way!)</p>
                          <p className="text-[11px] text-slate-500">Driver Babatunde is 3 stops away from your doorstep</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Slide-out Order Information Menu Drawer */}
          <OrderInformationMenuDrawer
            isOpen={isOrderMenuOpen}
            onClose={() => setIsOrderMenuOpen(false)}
            order={activeOrder}
            isOutForDelivery={true}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
