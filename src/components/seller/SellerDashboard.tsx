import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus } from '../../types';
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Truck,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Send,
  Loader2,
  Star,
  MessageSquare,
  Search,
  Eye,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    products,
    orders,
    reviews,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    addSellerReplyToReview,
    formatPrice,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'ai-copywriter'>('inventory');

  // Filter products and orders belonging to this seller
  const sellerProducts = products.filter((p) => p.sellerId === currentUser.id);
  const sellerOrders = orders.filter((o) => o.items.some((i) => i.sellerId === currentUser.id));

  // Compute metrics
  const totalRevenue = sellerOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => {
      const myItems = o.items.filter((i) => i.sellerId === currentUser.id);
      return acc + myItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }, 0);

  const totalItemsSold = sellerOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => {
      const myItems = o.items.filter((i) => i.sellerId === currentUser.id);
      return acc + myItems.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

  const lowStockCount = sellerProducts.filter((p) => p.stock <= 5).length;

  // Product Modal State (Create / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    brand: '',
    category: categories[0]?.name || 'Audio & Wearables',
    price: 75000,
    originalPrice: 95000,
    stock: 25,
    shortDescription: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    isFeatured: false,
    isFlashDeal: false,
    discountPercentage: 0,
  });

  // Shipping Tracking Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [carrierInput, setCarrierInput] = useState('GIG Logistics Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('GIG-789234891');

  // AI Copywriter State
  const [aiPromptTopic, setAiPromptTopic] = useState('Premium noise cancelling earbuds with titanium drivers');
  const [aiPromptTone, setAiPromptTone] = useState('Luxurious, modern & high-converting');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    title?: string;
    shortDescription?: string;
    description?: string;
    features?: string[];
    tags?: string[];
  } | null>(null);

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      brand: currentUser.storeName?.split(' ')[0] || 'Nova',
      category: categories[0]?.name || 'Audio & Wearables',
      price: 65000,
      originalPrice: 85000,
      stock: 30,
      shortDescription: '',
      description: '',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isFlashDeal: false,
      discountPercentage: 0,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      stock: product.stock,
      shortDescription: product.shortDescription,
      description: product.description,
      images: product.images,
      isFeatured: !!product.isFeatured,
      isFlashDeal: !!product.isFlashDeal,
      discountPercentage: product.discountPercentage || 0,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productForm,
        discountPercentage: productForm.discountPercentage > 0 ? productForm.discountPercentage : undefined,
      });
    } else {
      addProduct({
        title: productForm.title,
        brand: productForm.brand,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        stock: Number(productForm.stock),
        shortDescription: productForm.shortDescription,
        description: productForm.description,
        images: productForm.images,
        sellerId: currentUser.id,
        sellerName: currentUser.storeName || currentUser.name,
        rating: 5.0,
        reviewCount: 0,
        isFeatured: productForm.isFeatured,
        isFlashDeal: productForm.isFlashDeal,
        discountPercentage: productForm.discountPercentage > 0 ? Number(productForm.discountPercentage) : undefined,
        tags: [productForm.category, productForm.brand],
        specs: { Origin: 'USA', Warranty: '1 Year' },
      });
    }
    setIsProductModalOpen(false);
  };

  // AI Copywriter Submit
  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptTopic.trim() || isGeneratingCopy) return;

    setIsGeneratingCopy(true);
    setGeneratedResult(null);

    try {
      const response = await fetch('/api/ai-product-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiPromptTopic,
          category: productForm.category,
          tone: aiPromptTone,
        }),
      });

      if (!response.ok) throw new Error('AI copy generation failed');
      const data = await response.json();
      setGeneratedResult(data);
    } catch (err) {
      // Fallback copy generator
      setGeneratedResult({
        title: `${aiPromptTopic} - Next-Gen Edition`,
        shortDescription: `Engineered for modern performance, supreme comfort, and unmatched reliability.`,
        description: `Experience uncompromising quality with this precision-crafted item. Featuring aerospace-grade materials, ergonomic craftsmanship, and intuitive smart features tailored for professionals and enthusiasts alike.`,
        features: [
          'Aerospace-grade lightweight aluminum & composite chassis',
          'Ultra-responsive tactile performance with zero latency',
          'Extended battery life with RapidCharge USB-C technology',
          'IPX5 water & dust resistance rating',
        ],
        tags: ['Premium', 'High-Performance', 'Nova-Certified', 'Flagship'],
      });
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleApplyAiCopy = () => {
    if (!generatedResult) return;
    setProductForm((prev) => ({
      ...prev,
      title: generatedResult.title || prev.title,
      shortDescription: generatedResult.shortDescription || prev.shortDescription,
      description: generatedResult.description || prev.description,
    }));
    setActiveTab('inventory');
    setIsProductModalOpen(true);
  };

  const handleShipOrder = (order: Order) => {
    updateOrderStatus(order.id, 'shipped', `Dispatched via ${carrierInput} (Tracking: ${trackingNumberInput})`);
    setTrackingModalOrder(null);
  };

  const handleSendReviewReply = (reviewId: string) => {
    if (!replyMessage.trim()) return;
    addSellerReplyToReview(reviewId, replyMessage);
    setReplyMessage('');
    setReplyingReviewId(null);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto space-y-8">
      {/* Seller Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-400/30 uppercase">
                Verified Marketplace Merchant
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {currentUser.storeName || currentUser.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-lg mt-0.5">
              {currentUser.storeBio || 'Manage your product inventory, customer orders, and AI marketing copy.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="seller-add-product-top-btn"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPrice(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-bold">From completed orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Units Dispatched</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalItemsSold}</p>
          <span className="text-[11px] text-indigo-600 font-bold">{sellerOrders.length} customer orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Listings</span>
            <Store className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{sellerProducts.length}</p>
          <span className="text-[11px] text-slate-400">Published in catalog</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Inventory Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{lowStockCount}</p>
          <span className="text-[11px] text-amber-600 font-bold">Items with ≤ 5 units</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          id="seller-tab-inventory"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory ({sellerProducts.length})</span>
        </button>

        <button
          id="seller-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders ({sellerOrders.length})</span>
        </button>

        <button
          id="seller-tab-ai-copywriter"
          onClick={() => setActiveTab('ai-copywriter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ai-copywriter'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Nova AI Copywriter</span>
        </button>
      </div>

      {/* TAB 1: Product Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Store Listings</h2>
            <button
              id="create-product-btn"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 line-clamp-1">{prod.title}</p>
                            <p className="text-slate-400 text-[11px]">Brand: {prod.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{prod.category}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">{formatPrice(prod.price)}</span>
                        {prod.originalPrice && (
                          <span className="text-slate-400 line-through text-[10px] block">
                            {formatPrice(prod.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              prod.stock > 10
                                ? 'bg-emerald-100 text-emerald-700'
                                : prod.stock > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-slate-400 font-normal">({prod.reviewCount})</span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          id={`edit-prod-btn-${prod.id}`}
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-prod-btn-${prod.id}`}
                          onClick={() => {
                            if (confirm(`Delete listing "${prod.title}"?`)) deleteProduct(prod.id);
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Customer Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Orders Containing Your Items</h2>

          {sellerOrders.length > 0 ? (
            <div className="space-y-4">
              {sellerOrders.map((order) => {
                const myItems = order.items.filter((i) => i.sellerId === currentUser.id);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Buyer: <strong>{order.customerName}</strong> ({order.customerEmail}) • Placed{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Order Action Status Switcher */}
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Mark Processing
                          </button>
                        )}

                        {order.status === 'processing' && (
                          <button
                            onClick={() => setTrackingModalOrder(order)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Ship Order</span>
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Delivered</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-slate-100 text-xs">
                      {myItems.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{item.productTitle}</p>
                              <p className="text-slate-400">
                                Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No orders placed for your store yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI Copywriter Generator */}
      {activeTab === 'ai-copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Marketing Generator
            </div>
            <h2 className="text-xl font-black text-slate-900">Create High-Converting Listings</h2>
            <p className="text-xs text-slate-500">
              Describe your new product in a few words, and let Gemini generate polished titles, compelling value propositions, technical bullets, and SEO tags.
            </p>

            <form onSubmit={handleGenerateCopy} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Product Core Concept / Features
                </label>
                <textarea
                  id="ai-copy-concept-input"
                  rows={3}
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  placeholder="e.g. Ergonomic wireless mouse with thumb wheel, USB-C fast charging, and silent clicks"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tone of Voice</label>
                <select
                  value={aiPromptTone}
                  onChange={(e) => setAiPromptTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-white"
                >
                  <option value="Luxurious, modern & high-converting">Luxurious & Modern</option>
                  <option value="Technical, detailed & specs-focused">Technical & Specs-Focused</option>
                  <option value="Minimalist, punchy & clean">Minimalist & Clean</option>
                  <option value="Exciting, vibrant & lifestyle-oriented">Vibrant Lifestyle</option>
                </select>
              </div>

              <button
                id="generate-ai-copy-btn"
                type="submit"
                disabled={isGeneratingCopy}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                {isGeneratingCopy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating with Gemini 3.7 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Listing Copy</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generated Copy Output</h3>

            {generatedResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Generated Title:</span>
                  <p className="font-bold text-slate-900 text-sm">{generatedResult.title}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Short Description:</span>
                  <p className="text-slate-700">{generatedResult.shortDescription}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Long Description:</span>
                  <p className="text-slate-700 leading-relaxed">{generatedResult.description}</p>
                </div>

                {generatedResult.features && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Key Selling Bullets:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {generatedResult.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    id="apply-ai-copy-to-product-btn"
                    onClick={handleApplyAiCopy}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Use this in New Product Listing</span>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                <p className="text-xs">Fill out the prompt on the left to generate listing copy with AI.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Product Listing' : 'Create New Product Listing'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                  <input
                    id="prod-form-title-input"
                    type="text"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand</label>
                  <input
                    id="prod-form-brand-input"
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Selling Price</label>
                    <span className="text-[11px] text-indigo-600 font-bold font-mono">
                      {formatPrice(productForm.price)}
                    </span>
                  </div>
                  <input
                    id="prod-form-price-input"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inventory Stock (units)</label>
                  <input
                    id="prod-form-stock-input"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Primary Image URL</label>
                  <input
                    id="prod-form-image-input"
                    type="url"
                    value={productForm.images[0] || ''}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Short Summary</label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="save-product-submit-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setTrackingModalOrder(null)} className="fixed inset-0 bg-slate-950/70" />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Ship Order #{trackingModalOrder.orderNumber}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shipping Carrier</label>
                <input
                  type="text"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="px-3 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleShipOrder(trackingModalOrder)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Dispatch & Notify Buyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
