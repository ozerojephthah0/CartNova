import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  X,
  Plus,
  Package,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Check,
  Zap,
  Star,
  Flame,
  Trash2,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

// Curated high-res Unsplash photo presets for fast 1-click photo selection
const IMAGE_PRESETS = [
  {
    category: 'Audio & Tech',
    name: 'ANC Headphones',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Audio & Tech',
    name: 'Wireless Earbuds',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Audio & Tech',
    name: 'Smart Watch Pro',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Computing & Gaming',
    name: 'Pro Laptop',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Computing & Gaming',
    name: 'Mechanical Keyboard',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Fashion & Luxury',
    name: 'Sneakers Elite',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Fashion & Luxury',
    name: 'Leather Watch',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Fashion & Luxury',
    name: 'Designer Sunglasses',
    url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Home & Living',
    name: 'Smart Home Speaker',
    url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Home & Living',
    name: 'Espresso Maker',
    url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Beauty & Wellness',
    name: 'Luxury Skincare Set',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Seasonal Deals',
    name: 'Holiday Gift Package',
    url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=800&auto=format&fit=crop&q=80',
  },
];

const QUICK_TAGS = [
  'bestseller',
  'new-arrival',
  'premium',
  '20%off',
  'temu-special',
  'prime-eligible',
  'top-rated',
  'limited-edition',
  'fast-shipping',
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, allUsers, addProduct, updateProduct, formatPrice } = useStore();

  const registeredSellers = allUsers.filter((u) => u.role === 'seller');

  // Form tab
  const [modalTab, setModalTab] = useState<'details' | 'pricing' | 'images' | 'specs'>('details');

  // Form state
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('CartNova Select');
  const [category, setCategory] = useState(categories[0]?.name || 'Audio & Wearables');
  const [sellerId, setSellerId] = useState('admin-official');
  const [sellerName, setSellerName] = useState('CartNova Official Store');

  const [price, setPrice] = useState<number>(45000);
  const [originalPrice, setOriginalPrice] = useState<number>(60000);
  const [stock, setStock] = useState<number>(50);

  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [isFeatured, setIsFeatured] = useState(false);
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  const [tags, setTags] = useState<string[]>(['new-arrival', 'premium']);
  const [customTagInput, setCustomTagInput] = useState('');

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Warranty', value: '1 Year Official' },
    { key: 'Condition', value: 'Brand New (Sealed)' },
    { key: 'Shipping', value: 'Express Delivery' },
  ]);

  const [errorMsg, setErrorMsg] = useState('');

  // Populate when editing
  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setSellerId(productToEdit.sellerId);
      setSellerName(productToEdit.sellerName);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice || productToEdit.price);
      setStock(productToEdit.stock);
      setShortDescription(productToEdit.shortDescription);
      setDescription(productToEdit.description);
      setImages(productToEdit.images.length > 0 ? productToEdit.images : [IMAGE_PRESETS[0].url]);
      setIsFeatured(!!productToEdit.isFeatured);
      setIsFlashDeal(!!productToEdit.isFlashDeal);
      setIsTrending(!!productToEdit.isTrending);
      setTags(productToEdit.tags || []);
      const specEntries = Object.entries(productToEdit.specs || {}).map(([key, value]) => ({
        key,
        value,
      }));
      setSpecs(specEntries.length > 0 ? specEntries : [{ key: 'Warranty', value: '1 Year' }]);
    } else {
      // Reset defaults for new product
      setTitle('');
      setBrand('CartNova Select');
      setCategory(categories[0]?.name || 'Audio & Wearables');
      setSellerId('admin-official');
      setSellerName('CartNova Official Store');
      setPrice(45000);
      setOriginalPrice(60000);
      setStock(50);
      setShortDescription('');
      setDescription('');
      setImages([IMAGE_PRESETS[0].url]);
      setIsFeatured(false);
      setIsFlashDeal(false);
      setIsTrending(false);
      setTags(['new-arrival', 'premium']);
      setSpecs([
        { key: 'Warranty', value: '1 Year Official' },
        { key: 'Condition', value: 'Brand New (Sealed)' },
      ]);
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  // Handle seller change
  const handleSellerChange = (selectedId: string) => {
    setSellerId(selectedId);
    if (selectedId === 'admin-official') {
      setSellerName('CartNova Official Store');
      setBrand('CartNova Select');
    } else {
      const seller = allUsers.find((u) => u.id === selectedId);
      if (seller) {
        setSellerName(seller.storeName || seller.name);
        setBrand(seller.storeName?.split(' ')[0] || seller.name);
      }
    }
  };

  // Image helpers
  const handleAddImage = () => {
    if (newImageUrl.trim() && newImageUrl.startsWith('http')) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSelectPreset = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  // Tags helpers
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCustomTagInput('');
    }
  };

  // Specs helpers
  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Calculate discount percentage
  const calculatedDiscount =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Product title is required');
      setModalTab('details');
      return;
    }
    if (price <= 0) {
      setErrorMsg('Price must be greater than 0');
      setModalTab('pricing');
      return;
    }
    if (images.length === 0 || !images[0]) {
      setErrorMsg('At least one product image is required');
      setModalTab('images');
      return;
    }

    const specsRecord: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsRecord[s.key.trim()] = s.value.trim();
      }
    });

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const autoShortDesc =
      shortDescription.trim() ||
      `${title} by ${brand}. Premium quality in ${category} with fast shipping and full warranty.`;

    const autoDesc =
      description.trim() ||
      `### ${title}\n\nExperience exceptional performance and build quality with the **${title}** from ${brand}.\n\n- Engineered for maximum durability and elegance\n- Verified CartNova authentic product\n- Backed by our 30-day money-back guarantee\n- Ready for nationwide delivery.`;

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        title: title.trim(),
        slug,
        brand: brand.trim(),
        category,
        sellerId,
        sellerName,
        price: Number(price),
        originalPrice: originalPrice > price ? Number(originalPrice) : Number(price),
        discountPercentage: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        stock: Number(stock),
        shortDescription: autoShortDesc,
        description: autoDesc,
        images,
        isFeatured,
        isFlashDeal,
        isTrending,
        tags,
        specs: specsRecord,
      });
    } else {
      addProduct({
        title: title.trim(),
        slug,
        brand: brand.trim(),
        category,
        sellerId,
        sellerName,
        price: Number(price),
        originalPrice: originalPrice > price ? Number(originalPrice) : Number(price),
        discountPercentage: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        stock: Number(stock),
        shortDescription: autoShortDesc,
        description: autoDesc,
        images,
        rating: 4.8,
        reviewCount: 12,
        isFeatured,
        isFlashDeal,
        isTrending,
        tags,
        specs: specsRecord,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          id="admin-product-modal"
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 p-5 sm:p-6 text-white shrink-0 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-black uppercase rounded-md tracking-wider">
                Admin Catalog Management
              </span>
              {productToEdit && (
                <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-black rounded-md">
                  ID: {productToEdit.id}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-400" />
              <span>{productToEdit ? 'Edit Marketplace Product' : 'Add New Marketplace Product'}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Publish or moderate listings directly into CartNova with live pricing, media, flash deals & specifications.
            </p>

            {/* Modal Sub-Tabs */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl mt-4 border border-slate-700/60 overflow-x-auto">
              <button
                type="button"
                onClick={() => setModalTab('details')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  modalTab === 'details' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. General Info
              </button>
              <button
                type="button"
                onClick={() => setModalTab('pricing')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  modalTab === 'pricing' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Pricing & Stock
              </button>
              <button
                type="button"
                onClick={() => setModalTab('images')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  modalTab === 'images' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Gallery ({images.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('specs')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  modalTab === 'specs' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                4. Specs & Badges
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: General Info */}
            {modalTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="admin-product-title-input"
                    type="text"
                    required
                    placeholder="e.g. Apex SonicPro Active Noise Cancelling Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-purple-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Brand Name</label>
                    <input
                      id="admin-product-brand-input"
                      type="text"
                      placeholder="e.g. Apex Audio"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                    <select
                      id="admin-product-category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-purple-600"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="Audio & Wearables">Audio & Wearables</option>
                      <option value="Computing & Gaming">Computing & Gaming</option>
                      <option value="Smart Gadgets">Smart Gadgets</option>
                      <option value="Fashion & Luxury">Fashion & Luxury</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Beauty & Wellness">Beauty & Wellness</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Assigned Merchant / Seller Source
                  </label>
                  <select
                    id="admin-product-seller-select"
                    value={sellerId}
                    onChange={(e) => handleSellerChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs font-semibold text-purple-950 focus:outline-purple-600"
                  >
                    <option value="admin-official">👑 CartNova Official Store (Platform Owned / HQ)</option>
                    {registeredSellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        🏪 {seller.storeName || seller.name} ({seller.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Admins can publish official CartNova catalog items or add items directly on behalf of marketplace merchants.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Short Description / Subtitle</label>
                  <input
                    type="text"
                    placeholder="Brief 1-sentence product summary displayed in listings..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-purple-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Full Description & Highlights</label>
                  <textarea
                    rows={4}
                    placeholder="Detailed specs, materials, dimensions, warranty and feature overview..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-purple-600"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Pricing & Stock */}
            {modalTab === 'pricing' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-900">Current Selling Price:</span>
                    <p className="text-2xl font-black text-purple-950 mt-0.5">{formatPrice(price)}</p>
                  </div>
                  {calculatedDiscount > 0 && (
                    <span className="px-3 py-1 bg-rose-600 text-white rounded-full font-black text-xs">
                      {calculatedDiscount}% SAVINGS
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Sale Price (₦) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="admin-product-price-input"
                      type="number"
                      min={100}
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Original / MSRP Price (₦)
                    </label>
                    <input
                      id="admin-product-original-price-input"
                      type="number"
                      min={100}
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Inventory Stock (Units)
                    </label>
                    <input
                      id="admin-product-stock-input"
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-purple-600"
                    />
                  </div>
                </div>

                {/* Quick Presets for Prices */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Quick Price Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[15000, 35000, 65000, 120000, 250000, 480000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setPrice(preset);
                          setOriginalPrice(Math.round(preset * 1.3));
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {formatPrice(preset)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Media Gallery */}
            {modalTab === 'images' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Add Image via URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-purple-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add URL</span>
                    </button>
                  </div>
                </div>

                {/* Active Image Thumbnails */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    Current Image Gallery ({images.length}) — First image is primary cover:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 aspect-square shadow-2xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-md shadow-xs">
                            COVER
                          </span>
                        )}
                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Curated Presets */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    ⚡ 1-Click High-Res Photo Presets (Click to add to gallery):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map((preset, pIdx) => {
                      const isAdded = images.includes(preset.url);
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isAdded
                              ? 'border-purple-500 bg-purple-50/60 ring-1 ring-purple-400'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{preset.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{preset.category}</p>
                          </div>
                          {isAdded && <Check className="w-3.5 h-3.5 text-purple-600 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Badges & Specs */}
            {modalTab === 'specs' && (
              <div className="space-y-5">
                {/* Feature Toggles */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    Promotional Badges & Placement:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                        isFeatured
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${isFeatured ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <p className="text-xs font-bold">Featured Spotlight</p>
                        <p className="text-[10px] text-slate-500">Show on homepage top grid</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFlashDeal(!isFlashDeal)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                        isFlashDeal
                          ? 'border-rose-600 bg-rose-50/70 text-rose-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <Zap className={`w-5 h-5 ${isFlashDeal ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <p className="text-xs font-bold">⚡ Flash Deal</p>
                        <p className="text-[10px] text-slate-500">Include in countdown sales</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTrending(!isTrending)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                        isTrending
                          ? 'border-amber-600 bg-amber-50/70 text-amber-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <Flame className={`w-5 h-5 ${isTrending ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <p className="text-xs font-bold">🔥 Trending Item</p>
                        <p className="text-[10px] text-slate-500">Highlight in bestsellers</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tags Picker */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">Tags & Badges:</span>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {QUICK_TAGS.map((tag) => {
                      const active = tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom tag (e.g. noise-cancelling)..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-purple-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Technical Specifications & Parameters:
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Spec Row</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Feature (e.g. Battery Life)"
                          value={spec.key}
                          onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                          className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-purple-600"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Up to 40 Hours)"
                          value={spec.value}
                          onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                {modalTab !== 'specs' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (modalTab === 'details') setModalTab('pricing');
                      else if (modalTab === 'pricing') setModalTab('images');
                      else if (modalTab === 'images') setModalTab('specs');
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Next Step →
                  </button>
                ) : null}

                <button
                  id="admin-submit-product-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{productToEdit ? 'Save Changes' : 'Publish Product to CartNova'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
