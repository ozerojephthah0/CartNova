import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  Tag,
  Check,
  ShoppingBag,
  Heart,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    toggleSelectCartItem,
    selectAllCartItems,
    removeSelectedFromCart,
    moveSelectedToWishlist,
    selectedCartItems,
    selectedCartCount,
    selectedCartSubtotal,
    cartCount,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    setIsCheckoutOpen,
    viewProductDetail,
    toggleWishlist,
    isInWishlist,
    recommendedProducts,
    addToCart,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const totalItemCount = cart.length;
  const allSelected = cart.length > 0 && cart.every((item) => item.selected !== false);
  const noneSelected = cart.length > 0 && cart.every((item) => item.selected === false);
  const someSelected = selectedCartItems.length > 0 && !allSelected;

  const FREE_SHIPPING_THRESHOLD = 50000;
  const effectiveSubtotal = selectedCartSubtotal;
  const progressToFreeShipping = Math.min(100, (effectiveSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - effectiveSubtotal);

  // Discount calculation based on selected subtotal
  let discount = 0;
  if (appliedCoupon && effectiveSubtotal > 0) {
    if (appliedCoupon.discountPercent) {
      discount = (effectiveSubtotal * appliedCoupon.discountPercent) / 100;
    } else if (appliedCoupon.discountAmount) {
      discount = Math.min(appliedCoupon.discountAmount, effectiveSubtotal);
    }
  }

  const estimatedTax = Math.max(0, (effectiveSubtotal - discount) * 0.075);
  const estimatedShipping =
    effectiveSubtotal === 0 || effectiveSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4500;
  const finalTotal = Math.max(0, effectiveSubtotal - discount + estimatedTax + estimatedShipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedCartCount === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleMasterToggle = () => {
    if (allSelected) {
      selectAllCartItems(false);
    } else {
      selectAllCartItems(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Slide-out Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          id="cart-slideover-drawer"
          className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between"
        >
          {/* 1. Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Virtual Shopping Cart</h2>
                <p className="text-[11px] text-slate-500">
                  {cart.length > 0 ? (
                    <span>
                      <strong>{selectedCartItems.length}</strong> of <strong>{cart.length}</strong> items selected
                    </span>
                  ) : (
                    'No items added yet'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                {cartCount} total
              </span>
              <button
                id="close-cart-drawer-btn"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Free Shipping Progress Bar (Calculated from Selected Items) */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  {remainingForFreeShipping === 0 && effectiveSubtotal > 0 ? (
                    <span className="text-emerald-700 font-bold">🎉 FREE Express Shipping Unlocked!</span>
                  ) : (
                    <span>
                      Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more selected items for <strong>FREE Delivery</strong>
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* 3. Master Select All & Bulk Action Bar */}
          {cart.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
              {/* Select All Checkbox */}
              <label
                id="cart-select-all-label"
                className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <input
                  id="cart-select-all-checkbox"
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleMasterToggle}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    allSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : someSelected
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {allSelected ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : someSelected ? (
                    <div className="w-2 h-0.5 bg-indigo-600 rounded" />
                  ) : null}
                </div>
                <span>
                  Select All ({selectedCartItems.length}/{totalItemCount})
                </span>
              </label>

              {/* Bulk Selected Actions */}
              {selectedCartItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    id="save-selected-wishlist-btn"
                    onClick={moveSelectedToWishlist}
                    className="text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                    title="Move selected items to wishlist"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Save to Wishlist</span>
                  </button>
                  <button
                    id="remove-selected-cart-btn"
                    onClick={removeSelectedFromCart}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                    title="Remove selected items from cart"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedCartItems.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Cart Items List with Item Selection */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length > 0 ? (
              <div className="space-y-3">
                {cart.map((item) => {
                  const isSelected = item.selected !== false;

                  return (
                    <div
                      key={item.id}
                      id={`cart-item-${item.id}`}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-white border-indigo-200/90 shadow-xs ring-1 ring-indigo-500/10'
                          : 'bg-slate-50/70 border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Item Select Checkbox */}
                        <label
                          htmlFor={`select-item-checkbox-${item.id}`}
                          className="mt-1 shrink-0 cursor-pointer"
                        >
                          <input
                            id={`select-item-checkbox-${item.id}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCartItem(item.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                                : 'bg-white border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </label>

                        {/* Product Image */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          onClick={() => viewProductDetail(item.product)}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                          referrerPolicy="no-referrer"
                        />

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => viewProductDetail(item.product)}
                            className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {item.product.title}
                          </h4>

                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Sold by <span className="text-slate-600 font-medium">{item.product.sellerName}</span>
                            {item.selectedVariant &&
                              Object.entries(item.selectedVariant).map(([k, v]) => (
                                <span key={k} className="ml-1 text-slate-500">
                                  • {k}: {v}
                                </span>
                              ))}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-black text-slate-900">
                              {formatPrice(item.product.price)}
                            </span>
                            {!isSelected && (
                              <span className="px-1.5 py-0.2 bg-slate-200/80 text-slate-600 text-[10px] font-bold rounded">
                                Unselected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              id={`qty-minus-${item.id}`}
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button
                              id={`qty-plus-${item.id}`}
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              onClick={() => toggleWishlist(item.productId)}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                              title="Save to wishlist"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isInWishlist(item.productId) ? 'fill-rose-500 text-rose-500' : ''
                                }`}
                              />
                            </button>
                            <button
                              id={`remove-cart-item-${item.id}`}
                              onClick={() => removeFromCart(item.id)}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our audio gear, watches, bags, and smart lifestyle products to find something you'll love.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            )}

            {/* Quick Add Recommendations in Cart */}
            {recommendedProducts.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900">Recommended Add-Ons</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Curated for you</span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-thin">
                  {recommendedProducts.slice(0, 5).map((recProduct) => {
                    const isInCurrentCart = cart.some((c) => c.productId === recProduct.id);
                    return (
                      <div
                        key={recProduct.id}
                        className="w-40 shrink-0 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between snap-start"
                      >
                        <div
                          className="cursor-pointer group"
                          onClick={() => {
                            setIsCartOpen(false);
                            viewProductDetail(recProduct);
                          }}
                        >
                          <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden mb-2 relative">
                            <img
                              src={recProduct.images[0]}
                              alt={recProduct.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {recProduct.discount && recProduct.discount > 0 && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-md">
                                -{recProduct.discount}%
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {recProduct.title}
                          </p>
                          <p className="text-[11px] font-black text-slate-800 mt-0.5">
                            {formatPrice(recProduct.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(recProduct, 1)}
                          disabled={recProduct.stock <= 0}
                          className={`mt-2 w-full py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                            isInCurrentCart
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isInCurrentCart ? 'Add Another' : 'Add to Cart'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Drawer Footer Summary (Calculated for Selected Items) */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/90 space-y-3.5">
              {/* Promo Coupon Code */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code: {appliedCoupon.code}</span>
                      {discount > 0 && (
                        <span className="font-normal text-emerald-600">(-{formatPrice(discount)})</span>
                      )}
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. NOVA20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs uppercase focus:outline-indigo-600"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-rose-500 mt-1">{couponError}</p>}
              </div>

              {/* Pricing Breakdown for Selected Items */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Subtotal ({selectedCartCount} selected item{selectedCartCount !== 1 ? 's' : ''})
                  </span>
                  <span className="font-bold text-slate-900">{formatPrice(effectiveSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax (7.5%)</span>
                  <span>{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>
                    {estimatedShipping === 0 ? (
                      <strong className="text-emerald-600">FREE</strong>
                    ) : (
                      formatPrice(estimatedShipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Checkout Total</span>
                  <span className="text-base text-indigo-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Notice when 0 items are selected */}
              {selectedCartCount === 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please select at least 1 item using the checkbox above to proceed.</span>
                </div>
              )}

              {/* Checkout CTA */}
              <button
                id="cart-drawer-checkout-btn"
                onClick={handleProceedToCheckout}
                disabled={selectedCartCount === 0}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:shadow-none transition-all cursor-pointer"
              >
                <span>
                  {selectedCartCount > 0
                    ? `Proceed to Checkout (${selectedCartCount} item${selectedCartCount > 1 ? 's' : ''})`
                    : 'Select Items to Checkout'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
