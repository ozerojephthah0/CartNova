import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Star, Check, X, ShoppingCart, Eye } from 'lucide-react';

interface CompareProductsTableProps {
  currentProduct: Product;
}

export const CompareProductsTable: React.FC<CompareProductsTableProps> = ({ currentProduct }) => {
  const { products, formatPrice, addToCart, viewProductDetail } = useStore();

  const similarProducts = products
    .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 3);

  const allCompared = [currentProduct, ...similarProducts];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Compare with similar items
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          See how this item stacks up against alternatives in the same category.
        </p>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="p-3 font-semibold text-slate-400 w-36">Product</th>
              {allCompared.map((item, idx) => (
                <th key={item.id} className="p-3 w-48 align-top">
                  <div className="space-y-2">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {item.title}
                    </div>
                    {idx === 0 && (
                      <span className="inline-block text-[10px] font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                        Current Selection
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-3 font-semibold text-slate-500">Customer Rating</td>
              {allCompared.map((item) => (
                <td key={item.id} className="p-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{item.rating}</span>
                    <span className="text-slate-400">({item.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-slate-500">Price</td>
              {allCompared.map((item) => (
                <td key={item.id} className="p-3 font-black text-slate-900 dark:text-white text-sm">
                  {formatPrice(item.price)}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-slate-500">Shipping</td>
              {allCompared.map((item) => (
                <td key={item.id} className="p-3 text-emerald-600 font-bold">
                  {item.shippingFee === 0 || item.freeShipping ? 'FREE Express Shipping' : formatPrice(item.shippingFee || 1500)}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-slate-500">Brand / Seller</td>
              {allCompared.map((item) => (
                <td key={item.id} className="p-3 text-slate-700 dark:text-slate-300">
                  {item.brand || item.sellerName}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-slate-500">Action</td>
              {allCompared.map((item) => (
                <td key={item.id} className="p-3">
                  <button
                    onClick={() => addToCart(item, 1)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add to Cart</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
