import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, Order } from '../../types';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Receipt,
  Package,
  LogIn,
  Building,
  Home,
  MapPin,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  Smartphone,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { downloadDigitalInvoice, printDigitalInvoice } from '../../utils/invoiceGenerator';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    selectedCartItems,
    selectedCartSubtotal,
    appliedCoupon,
    createOrder,
    formatPrice,
    currentUser,
    isLoggedIn,
    openAuthModal,
    setActiveCustomerTab,
    addToast,
  } = useStore();

  const checkoutItems = selectedCartItems.length > 0 ? selectedCartItems : cart;
  const checkoutSubtotal = selectedCartItems.length > 0 ? selectedCartSubtotal : cartSubtotal;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showItemsReview, setShowItemsReview] = useState(true);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser.name !== 'Guest Customer' ? currentUser.name : 'Jephthah Ozero',
    email: currentUser.email || 'customer@cartnova.com',
    phone: currentUser.phone || '+234 802 345 6789',
    street: currentUser.address?.street || '14 Admiralty Way, Lekki Phase 1',
    city: currentUser.address?.city || 'Lekki / Lagos',
    state: currentUser.address?.state || 'Lagos State',
    zip: currentUser.address?.zip || '105102',
    country: currentUser.address?.country || 'Nigeria',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Address presets
  const applyAddressPreset = (type: 'home' | 'work') => {
    if (type === 'home') {
      setShippingInfo({
        fullName: currentUser.name !== 'Guest Customer' ? currentUser.name : 'Jephthah Ozero',
        email: currentUser.email || 'customer@cartnova.com',
        phone: '+234 802 345 6789',
        street: '14 Admiralty Way, Lekki Phase 1',
        city: 'Lekki / Lagos',
        state: 'Lagos State',
        zip: '105102',
        country: 'Nigeria',
      });
      addToast('info', 'Address Preset Applied', 'Loaded Home Residence (Lekki, Lagos)');
    } else {
      setShippingInfo({
        fullName: currentUser.name !== 'Guest Customer' ? currentUser.name : 'Jephthah Ozero',
        email: currentUser.email || 'customer@cartnova.com',
        phone: '+234 818 990 1234',
        street: 'Floor 7, Landmark Tech Tower, Water Corporation Dr',
        city: 'Victoria Island',
        state: 'Lagos State',
        zip: '101241',
        country: 'Nigeria',
      });
      addToast('info', 'Address Preset Applied', 'Loaded Office / Corporate Address (VI, Lagos)');
    }
  };

  // Sync shipping info if currentUser changes (e.g. after Google or email login)
  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest') {
      setShippingInfo({
        fullName: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '+234 802 345 6789',
        street: currentUser.address?.street || '14 Admiralty Way, Lekki Phase 1',
        city: currentUser.address?.city || 'Lekki / Lagos',
        state: currentUser.address?.state || 'Lagos State',
        zip: currentUser.address?.zip || '105102',
        country: currentUser.address?.country || 'Nigeria',
      });
      setCardInfo((prev) => ({ ...prev, name: currentUser.name || prev.name }));
    }
  }, [currentUser]);

  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Card form state
  const [cardInfo, setCardInfo] = useState({
    number: '5399 •••• •••• 4242',
    name: currentUser.name !== 'Guest Customer' ? currentUser.name : 'Jephthah Ozero',
    expiry: '12/28',
    cvv: '921',
  });

  const autofillDemoCard = () => {
    setCardInfo({
      number: '4111 2222 3333 4242',
      name: shippingInfo.fullName || 'Jephthah Ozero',
      expiry: '09/29',
      cvv: '884',
    });
    addToast('success', 'Demo Card Filled', 'Test Visa ending in 4242 populated');
  };

  if (!isCheckoutOpen) return null;

  // Price calculations
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discount = (checkoutSubtotal * appliedCoupon.discountPercent) / 100;
    } else if (appliedCoupon.discountAmount) {
      discount = appliedCoupon.discountAmount;
    }
  }

  let shippingCost = 0;
  if (shippingSpeed === 'express') shippingCost = 8500;
  if (shippingSpeed === 'overnight') shippingCost = 18000;

  const estimatedTax = (checkoutSubtotal - discount) * 0.075;
  const finalTotal = Math.max(0, checkoutSubtotal - discount + estimatedTax + shippingCost);

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!shippingInfo.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingInfo.email.trim() || !shippingInfo.email.includes('@')) errors.email = 'Valid email is required';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingInfo.street.trim()) errors.street = 'Street address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    } else {
      addToast('error', 'Incomplete Address', 'Please fill out all required delivery fields');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems = checkoutItems.map((c) => ({
      productId: c.productId,
      productTitle: c.product.title,
      productImage: c.product.images[0],
      quantity: c.quantity,
      unitPrice: c.product.price,
      sellerId: c.product.sellerId,
      sellerName: c.product.sellerName,
      selectedVariant: c.selectedVariant,
    }));

    const newOrder = createOrder({
      customerId: currentUser.id,
      customerName: shippingInfo.fullName,
      customerEmail: shippingInfo.email,
      customerPhone: shippingInfo.phone,
      items: orderItems,
      subtotal: checkoutSubtotal,
      tax: estimatedTax,
      shippingFee: shippingCost,
      discountAmount: discount,
      couponCode: appliedCoupon?.code,
      totalAmount: finalTotal,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod,
      shippingAddress: {
        fullName: shippingInfo.fullName,
        street: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip: shippingInfo.zip,
        country: shippingInfo.country,
      },
      shippingSpeed,
      estimatedDelivery:
        shippingSpeed === 'overnight'
          ? 'Tomorrow by 10:30 AM'
          : shippingSpeed === 'express'
          ? '2-3 Business Days'
          : '3-5 Business Days',
    });

    setPlacedOrder(newOrder);
    setStep(4);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
      });
    } catch {
      // ignore
    }
  };

  const handleFinishAndTrack = () => {
    setIsCheckoutOpen(false);
    setActiveCustomerTab('orders');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (step !== 4) setIsCheckoutOpen(false);
          }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          id="checkout-flow-modal"
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight block">CartNova Express Checkout</span>
                <span className="text-[10px] text-slate-400">256-Bit SSL Encrypted & Protected</span>
              </div>
            </div>
            {step !== 4 && (
              <button
                id="close-checkout-modal-btn"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                aria-label="Close Checkout"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stepper Indicator */}
          {step !== 4 && (
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
              <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-indigo-600 font-extrabold' : step > 1 ? 'text-emerald-600' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Shipping Address</span>
              </div>
              <span>→</span>
              <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-indigo-600 font-extrabold' : step > 2 ? 'text-emerald-600' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Delivery Speed</span>
              </div>
              <span>→</span>
              <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-indigo-600 font-extrabold' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Payment & Place Order</span>
              </div>
            </div>
          )}

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* STEP 1: Shipping Address */}
            {step === 1 && (
              <div className="space-y-4">
                {!isLoggedIn && (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-slate-700 font-medium">Already have an account or saved Google address?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shrink-0 cursor-pointer shadow-2xs transition-colors"
                    >
                      Sign In / Google
                    </button>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Delivery Address</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyAddressPreset('home')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Home className="w-3 h-3" />
                      <span>Home</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAddressPreset('work')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Building className="w-3 h-3" />
                      <span>Office</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      id="shipping-name-input"
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      required
                      placeholder="e.g. Jane Doe"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-indigo-600 ${
                        formErrors.fullName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.fullName && <p className="text-[10px] text-rose-500 mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      id="shipping-email-input"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                      placeholder="e.g. name@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-indigo-600 ${
                        formErrors.email ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      id="shipping-phone-input"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                      placeholder="+234 800 000 0000"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-indigo-600 ${
                        formErrors.phone ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Country / Region</label>
                    <input
                      id="shipping-country-input"
                      type="text"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Street Address *</label>
                    <input
                      id="shipping-street-input"
                      type="text"
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                      required
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-indigo-600 ${
                        formErrors.street ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.street && <p className="text-[10px] text-rose-500 mt-1">{formErrors.street}</p>}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City *</label>
                    <input
                      id="shipping-city-input"
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                      placeholder="e.g. Lagos"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-indigo-600 ${
                        formErrors.city ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.city && <p className="text-[10px] text-rose-500 mt-1">{formErrors.city}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">State *</label>
                      <input
                        id="shipping-state-input"
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        required
                        placeholder="e.g. Lagos"
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-indigo-600 ${
                          formErrors.state ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Zip Code</label>
                      <input
                        id="shipping-zip-input"
                        type="text"
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        placeholder="100001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Checking out <strong>{checkoutItems.reduce((s, i) => s + i.quantity, 0)} selected item(s)</strong>
                  </span>
                  <button
                    id="checkout-step1-next-btn"
                    onClick={handleNextFromStep1}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Continue to Shipping Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping Speed */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Choose Shipping Speed</h3>
                  <p className="text-xs text-slate-500">All shipments include live satellite GPS tracking and delivery verification signature.</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'standard',
                      title: 'Standard Ground Delivery (3-5 Business Days)',
                      subtitle: 'Economical, secure parcel shipping',
                      price: 'FREE',
                      badge: 'Eco-Friendly',
                      fee: 0,
                    },
                    {
                      id: 'express',
                      title: 'GIG Logistics Express 2-Day Air',
                      subtitle: 'Priority airport airfreight dispatch',
                      price: formatPrice(8500),
                      badge: 'Fastest Value',
                      fee: 8500,
                    },
                    {
                      id: 'overnight',
                      title: 'DHL Express Priority (Next Morning Guaranteed)',
                      subtitle: 'Dedicated courier delivery before 10:30 AM',
                      price: formatPrice(18000),
                      badge: 'VIP Guaranteed',
                      fee: 18000,
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        shippingSpeed === opt.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingSpeed"
                          checked={shippingSpeed === opt.id}
                          onChange={() => setShippingSpeed(opt.id as any)}
                          className="w-4 h-4 text-indigo-600 accent-indigo-600 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                              {opt.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{opt.subtitle}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 font-mono">{opt.price}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Address</span>
                  </button>
                  <button
                    id="checkout-step2-next-btn"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment & Final Review */}
            {step === 3 && (
              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment & Final Confirmation</h3>
                  <p className="text-xs text-slate-500">Select payment method and verify your selected items.</p>
                </div>

                {/* Selected Items Collapsible Review */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowItemsReview(!showItemsReview)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      <span>Review Selected Items ({checkoutItems.reduce((s, i) => s + i.quantity, 0)})</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <span>{showItemsReview ? 'Hide' : 'Show Details'}</span>
                      {showItemsReview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {showItemsReview && (
                    <div className="px-4 pb-3 space-y-2 border-t border-slate-200/80 pt-2.5 max-h-48 overflow-y-auto">
                      {checkoutItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs py-1">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate text-[11px]">{item.product.title}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span>Qty: {item.quantity}</span>
                                {item.selectedVariant && (
                                  <span>• {Object.values(item.selectedVariant).join(', ')}</span>
                                )}
                                <span>• Sold by {item.product.sellerName || 'Verified Merchant'}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 shrink-0 font-mono text-[11px]">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'bank_transfer', label: 'Instant Bank Transfer', icon: Building },
                    { id: 'apple_pay', label: 'Apple / Google Pay', icon: Smartphone },
                    { id: 'cod', label: 'Cash on Delivery', icon: Truck },
                  ].map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-600/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <pm.icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-[11px] block leading-tight">{pm.label}</span>
                    </button>
                  ))}
                </div>

                {/* Payment Sub-Panel Details */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-md">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        Card Simulator
                      </span>
                      <button
                        type="button"
                        onClick={autofillDemoCard}
                        className="px-2 py-0.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                      >
                        Auto-Fill Test Card
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 font-mono text-xs focus:outline-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div className="col-span-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono text-xs focus:outline-indigo-500 text-center"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="text"
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono text-xs focus:outline-indigo-500 text-center"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <div className="w-full py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-center text-[10px] text-slate-400 font-bold">
                          Visa / MC / Verve
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">Paystack / Instant Virtual Account</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold">Auto-Verifying</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Transfer exact amount to the dedicated virtual account below. Payment is detected in <strong>under 3 seconds</strong>.
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bank: Wema Bank / Providus</span>
                        <strong className="text-slate-900 text-sm">8290 1482 91</strong>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600">CartNova Checkout</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'apple_pay' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <Smartphone className="w-8 h-8 text-slate-700 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-900">1-Tap Biometric Checkout</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click the button below to authorize with Touch ID, Face ID, or Google Wallet.
                    </p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Cash on Delivery (Doorstep Payment)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      You can pay with cash, POS debit card, or mobile bank transfer upon package inspection at your address.
                    </p>
                  </div>
                )}

                {/* Final Order Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Selected Items Subtotal ({checkoutItems.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="font-mono">{formatPrice(checkoutSubtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Promo Discount ({appliedCoupon?.code})</span>
                      </span>
                      <span className="font-mono">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (7.5%)</span>
                    <span className="font-mono">{formatPrice(estimatedTax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping ({shippingSpeed.toUpperCase()})</span>
                    <span className="font-mono">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total Charged</span>
                    <span className="text-indigo-600 text-base font-mono">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    id="submit-place-order-btn"
                    type="submit"
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatPrice(finalTotal)} & Complete Purchase</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Order Success Receipt */}
            {step === 4 && placedOrder && (
              <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Transaction Complete & Verified
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">
                    Thank you for your purchase!
                  </h2>
                  <p className="text-xs text-slate-500">
                    Order confirmation and official digital receipt sent to <strong>{placedOrder.customerEmail}</strong>
                  </p>
                </div>

                {/* Receipt Box */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Order Number</span>
                      <strong className="text-sm text-slate-900 font-mono">{placedOrder.orderNumber}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Estimated Delivery</span>
                      <strong className="text-slate-900">{placedOrder.estimatedDelivery}</strong>
                    </div>
                  </div>

                  {/* Recipient Snapshot */}
                  <div className="text-[11px] text-slate-600 pb-2 border-b border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deliver to:</span>
                      <strong>{placedOrder.customerName}</strong> ({placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city})
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Payment:</span>
                      <span className="capitalize font-bold text-slate-800">{placedOrder.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {placedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span className="truncate max-w-[260px] text-[11px]">
                          {item.quantity}x {item.productTitle}
                        </span>
                        <span className="font-bold font-mono text-[11px]">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900">
                    <span>Total Paid</span>
                    <span className="text-emerald-600 text-base font-mono">{formatPrice(placedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Action Buttons: Invoice, Tracking & Continue Shopping */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      id="track-order-success-btn"
                      onClick={handleFinishAndTrack}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Track Order in Live GPS Radar</span>
                    </button>

                    <button
                      id="download-order-invoice-btn"
                      onClick={() => downloadDigitalInvoice(placedOrder, formatPrice)}
                      className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      title="Download Official Tax Invoice"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Download Tax Invoice</span>
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setActiveCustomerTab('shop');
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                    >
                      Continue Shopping in Catalog →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
