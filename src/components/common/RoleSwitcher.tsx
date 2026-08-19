import React from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import { User, Store, ShieldCheck, Check, Sparkles, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ isOpen, onClose }) => {
  const { activeRole, currentUser, allUsers, switchRole, resetStoreData } = useStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          id="role-switcher-modal"
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
            <button
              id="close-role-switcher-btn"
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Multi-Role Platform Experience
            </div>
            <h2 className="text-xl font-extrabold text-white">Switch Role & User Persona</h2>
            <p className="text-xs text-slate-300 mt-1">
              Experience CartNova from the perspective of a Customer, an active Marketplace Seller, or Platform Admin.
            </p>
          </div>

          {/* User Persona Cards */}
          <div className="p-6 space-y-3">
            {allUsers.map((user) => {
              const isSelected = currentUser.id === user.id && activeRole === user.role;

              const getIcon = () => {
                if (user.role === 'admin') return <ShieldCheck className="w-5 h-5 text-purple-600" />;
                if (user.role === 'seller') return <Store className="w-5 h-5 text-emerald-600" />;
                return <User className="w-5 h-5 text-indigo-600" />;
              };

              const getBadge = () => {
                if (user.role === 'admin') {
                  return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">ADMIN</span>;
                }
                if (user.role === 'seller') {
                  return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">SELLER</span>;
                }
                return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">CUSTOMER</span>;
              };

              return (
                <button
                  key={user.id}
                  id={`persona-select-${user.id}`}
                  onClick={() => {
                    switchRole(user.role, user.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center">
                        {getIcon()}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        {getBadge()}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user.storeName ? `Store: ${user.storeName}` : user.email}
                      </p>
                      {user.storeBio && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                          "{user.storeBio}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Reset & Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              id="reset-demo-data-btn"
              onClick={() => {
                if (confirm('Reset store data back to initial demo state?')) {
                  resetStoreData();
                  onClose();
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Store Demo Data</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
