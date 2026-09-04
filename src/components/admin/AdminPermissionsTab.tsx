import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  Lock,
  Key,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Globe,
  Sliders,
  Sparkles,
  RefreshCw,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AuditLogEntry {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'security' | 'catalog' | 'financial' | 'user';
  severity: 'low' | 'medium' | 'high';
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    adminName: 'Alex Admin',
    adminEmail: 'alex.admin@cartnova.com',
    action: 'Approved Refund & Credited Wallet',
    target: 'Order #CN-884920 (₦185,000)',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    category: 'financial',
    severity: 'medium',
  },
  {
    id: 'log-2',
    adminName: 'Alex Admin',
    adminEmail: 'alex.admin@cartnova.com',
    action: 'Created Promotional Coupon',
    target: 'Code: SUMMER30 (30% OFF)',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    category: 'catalog',
    severity: 'low',
  },
  {
    id: 'log-3',
    adminName: 'Alex Admin',
    adminEmail: 'alex.admin@cartnova.com',
    action: 'Verified Merchant Storefront',
    target: 'GadgetZone Express (user-seller-1)',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    category: 'user',
    severity: 'low',
  },
  {
    id: 'log-4',
    adminName: 'System Engine',
    adminEmail: 'security@cartnova.com',
    action: 'RBAC Policy Verification Check Passed',
    target: 'All API routes & state mutators locked to authorized roles',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    category: 'security',
    severity: 'low',
  },
];

export const AdminPermissionsTab: React.FC = () => {
  const { allUsers, currentUser, updateUserRole, addToast, resetStoreData } = useStore();

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [activeRoleMatrixTab, setActiveRoleMatrixTab] = useState<'matrix' | 'logs'>('matrix');

  const handleToggleMaintenance = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    const newLog: AuditLogEntry = {
      id: 'log-' + Date.now(),
      adminName: currentUser.name,
      adminEmail: currentUser.email,
      action: next ? 'Enabled Maintenance Mode' : 'Disabled Maintenance Mode',
      target: 'Public Storefront Gateway',
      timestamp: new Date().toISOString(),
      category: 'security',
      severity: 'high',
    };
    setAuditLogs([newLog, ...auditLogs]);
    addToast(next ? 'warning' : 'success', 'Maintenance Mode', next ? 'Storefront set to maintenance.' : 'Storefront live.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md uppercase">
              Security Governance
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              RBAC Matrix & Immutable Audit Trail
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Admin Permissions & System Security</h2>
          <p className="text-xs text-slate-500">
            Define role boundaries, inspect administrative action trails, and enforce security policies.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveRoleMatrixTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRoleMatrixTab === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Role Permissions Matrix
          </button>
          <button
            onClick={() => setActiveRoleMatrixTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRoleMatrixTab === 'logs' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Security Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">RBAC Guard Status</span>
            <p className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Strictly Enforced
            </p>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Storefront Status</span>
            <p className={`text-sm font-black ${maintenanceMode ? 'text-amber-600' : 'text-emerald-600'}`}>
              {maintenanceMode ? '⚠️ Maintenance Mode' : '● Live & Operational'}
            </p>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              maintenanceMode ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            {maintenanceMode ? 'Go Live' : 'Maintenance'}
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">2FA Super Admin Auth</span>
            <p className="text-sm font-black text-indigo-600">
              {twoFactorEnforced ? 'Active (OTP + OAuth)' : 'Disabled'}
            </p>
          </div>
          <button
            onClick={() => setTwoFactorEnforced(!twoFactorEnforced)}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Toggle
          </button>
        </div>
      </div>

      {activeRoleMatrixTab === 'matrix' ? (
        /* Permissions Matrix Table */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">Platform Role Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-500">
              Hierarchical permission breakdown across Customer, Seller, and Admin accounts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3">Platform Capability</th>
                  <th className="px-5 py-3 text-center">Customer</th>
                  <th className="px-5 py-3 text-center">Seller / Merchant</th>
                  <th className="px-5 py-3 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { feat: 'Browse Products, Categories & Search', cust: true, sell: true, adm: true },
                  { feat: 'Add to Wishlist, Cart & Secure Checkout', cust: true, sell: true, adm: true },
                  { feat: 'Order Tracking & Digital Invoices', cust: true, sell: true, adm: true },
                  { feat: 'Submit Reviews & Product Ratings', cust: true, sell: false, adm: true },
                  { feat: 'Request Order Return / RMA Refund', cust: true, sell: false, adm: true },
                  { feat: 'Sell Products & Manage Storefront', cust: false, sell: true, adm: true },
                  { feat: 'Edit Product Catalog & Prices', cust: false, sell: 'Own items only', adm: true },
                  { feat: 'Approve Customer Returns & Credit Wallet', cust: false, sell: false, adm: true },
                  { feat: 'Create & Manage Coupons / Flash Deals', cust: false, sell: false, adm: true },
                  { feat: 'Moderate Reviews & Official Replies', cust: false, sell: 'Replies only', adm: true },
                  { feat: 'Manage Users, Roles & Seller Verification', cust: false, sell: false, adm: true },
                  { feat: 'Broadcast Push Notifications to All Users', cust: false, sell: false, adm: true },
                  { feat: 'View Financial Analytics & GMV Take Rates', cust: false, sell: 'Own sales only', adm: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800">{row.feat}</td>
                    <td className="px-5 py-3 text-center">
                      {row.cust ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-slate-600">
                      {row.sell === true ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : row.sell === false ? (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      ) : (
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                          {row.sell}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Check className="w-4 h-4 text-purple-600 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Live System Audit Logs Stream */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Live System Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Tamper-proof event logs of all security, catalog, and financial operations.
              </p>
            </div>
            <button
              onClick={() => {
                const refreshedLog: AuditLogEntry = {
                  id: 'log-' + Date.now(),
                  adminName: currentUser.name,
                  adminEmail: currentUser.email,
                  action: 'Manual Audit Health Check',
                  target: 'System Integrity Scanner',
                  timestamp: new Date().toISOString(),
                  category: 'security',
                  severity: 'low',
                };
                setAuditLogs([refreshedLog, ...auditLogs]);
                addToast('success', 'Logs Synced', 'System audit trail updated.');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Trail</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                        log.category === 'financial'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.category === 'security'
                          ? 'bg-purple-100 text-purple-800'
                          : log.category === 'user'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.category}
                    </span>
                    <span className="font-bold text-slate-900">{log.action}</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px]">{log.target}</p>
                  <p className="text-[10px] text-slate-400">
                    Executed by <strong>{log.adminName}</strong> ({log.adminEmail}) • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
