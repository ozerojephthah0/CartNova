import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
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
  Zap,
  ShieldAlert,
  Server,
  Gauge,
  Flame,
  AlertCircle,
  Play,
  RotateCcw,
  FileText,
  CheckSquare,
  Terminal,
} from 'lucide-react';
import { motion } from 'motion/react';
import { authenticatedFetch } from '../../utils/apiAuth';

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

interface RateLimitTierStats {
  limiterName: string;
  windowSeconds: number;
  maxRequests: number;
  activeTrackedKeys: number;
  totalAllowedRequests: number;
  totalBlockedRequests: number;
  recentViolations: Array<{
    id: string;
    timestamp: string;
    ip: string;
    clientKey: string;
    endpoint: string;
    method: string;
    limiterName: string;
    limit: number;
    windowSeconds: number;
    userAgent?: string;
  }>;
}

interface SecurityTestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  details: string;
  statusReceived?: number;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-0',
    adminName: 'Security Engine',
    adminEmail: 'security@cartnova.dev',
    action: 'Sliding-Window Request Throttling Activated',
    target: 'Tiered protection active across /api/auth, /api/ai-*, /api/paystack, /api/simulated-transactions',
    timestamp: new Date().toISOString(),
    category: 'security',
    severity: 'low',
  },
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
  const { currentUser, activeRole, addToast } = useStore();

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [activeRoleMatrixTab, setActiveRoleMatrixTab] = useState<'matrix' | 'throttling' | 'audit-tests' | 'logs'>('throttling');
  
  // Rate Limiting Live State
  const [rateLimitStats, setRateLimitStats] = useState<Record<string, RateLimitTierStats> | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    totalSent: number;
    allowed: number;
    blocked: number;
    lastStatus: number;
    message: string;
  } | null>(null);

  // Security Test Runner State
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testReport, setTestReport] = useState<{
    total: number;
    passed: number;
    failed: number;
    durationMs: number;
    results: SecurityTestResult[];
  } | null>(null);

  const fetchRateLimitStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await authenticatedFetch('/api/admin/security/rate-limits', {}, currentUser, activeRole);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setRateLimitStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Could not fetch rate limits directly from server:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRunSecurityAuditTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await authenticatedFetch(
        '/api/admin/security/run-audit-tests',
        { method: 'POST', body: JSON.stringify({}) },
        currentUser,
        activeRole
      );
      if (res.ok) {
        const data = await res.json();
        if (data.testReport) {
          setTestReport(data.testReport);
          addToast(
            data.testReport.failed === 0 ? 'success' : 'warning',
            'Security Audit Executed',
            `Tests Completed: ${data.testReport.passed}/${data.testReport.total} passed in ${data.testReport.durationMs}ms.`
          );
        }
      } else {
        addToast('error', 'Execution Error', 'Server returned error running audit tests.');
      }
    } catch (err: any) {
      addToast('error', 'Test Suite Error', err.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    fetchRateLimitStats();
  }, []);

  const handleResetRateLimits = async () => {
    try {
      const res = await authenticatedFetch(
        '/api/admin/security/rate-limits/reset',
        { method: 'POST', body: JSON.stringify({}) },
        currentUser,
        activeRole
      );
      if (res.ok) {
        addToast('success', 'Throttling Reset', 'All client request counters and rate limit windows have been cleared.');
        fetchRateLimitStats();
      }
    } catch (err) {
      addToast('error', 'Reset Failed', 'Failed to clear rate limits.');
    }
  };

  const handleSimulateBurstTraffic = async () => {
    setIsSimulatingTraffic(true);
    setSimulationResults(null);
    let allowedCount = 0;
    let blockedCount = 0;
    let lastStatus = 200;

    try {
      for (let i = 0; i < 25; i++) {
        const res = await authenticatedFetch('/api/auth/verify-session', {}, currentUser, activeRole);
        lastStatus = res.status;
        if (res.status === 429) {
          blockedCount++;
        } else if (res.ok) {
          allowedCount++;
        }
      }

      setSimulationResults({
        totalSent: 25,
        allowed: allowedCount,
        blocked: blockedCount,
        lastStatus,
        message: blockedCount > 0 
          ? `Security Shield successfully intercepted burst traffic! ${blockedCount} requests were throttled with HTTP 429 Too Many Requests.`
          : `All ${allowedCount} requests were processed within tolerance limits.`,
      });

      if (blockedCount > 0) {
        addToast('warning', 'Throttling Active', `Intercepted ${blockedCount} abusive/rapid requests with HTTP 429.`);
      } else {
        addToast('info', 'Burst Sent', `${allowedCount} requests executed.`);
      }

      fetchRateLimitStats();
    } catch (err: any) {
      addToast('error', 'Simulation Error', err.message);
    } finally {
      setIsSimulatingTraffic(false);
    }
  };

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

  const totalAllowed = rateLimitStats
    ? Object.values(rateLimitStats).reduce((acc: number, s: RateLimitTierStats) => acc + (s.totalAllowedRequests || 0), 0)
    : 0;
  const totalBlocked = rateLimitStats
    ? Object.values(rateLimitStats).reduce((acc: number, s: RateLimitTierStats) => acc + (s.totalBlockedRequests || 0), 0)
    : 0;

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
              Defensive Audit, Request Throttling & RBAC Security Matrix
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">System Security & API Protection</h2>
          <p className="text-xs text-slate-500">
            Automated defensive security testing, sliding-window throttling, and RBAC policy enforcement.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveRoleMatrixTab('throttling')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoleMatrixTab === 'throttling' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-indigo-600" />
            Request Throttling
          </button>
          <button
            onClick={() => setActiveRoleMatrixTab('audit-tests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoleMatrixTab === 'audit-tests' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Security Test Suite
          </button>
          <button
            onClick={() => setActiveRoleMatrixTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRoleMatrixTab === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Role Matrix
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">API Throttling Shield</span>
            <p className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Active (5 Tiers)
            </p>
          </div>
          <Gauge className="w-7 h-7 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">RBAC Guard Status</span>
            <p className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Strictly Enforced
            </p>
          </div>
          <ShieldCheck className="w-7 h-7 text-indigo-500 opacity-80" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Storefront Status</span>
            <p className={`text-sm font-black ${maintenanceMode ? 'text-amber-600' : 'text-emerald-600'}`}>
              {maintenanceMode ? '⚠️ Maintenance' : '● Live & Operational'}
            </p>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              maintenanceMode ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            {maintenanceMode ? 'Go Live' : 'Maintenance'}
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Blocked Violations</span>
            <p className="text-sm font-black text-rose-600 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> {totalBlocked} Intercepted
            </p>
          </div>
          <Flame className="w-7 h-7 text-rose-500 opacity-80" />
        </div>
      </div>

      {activeRoleMatrixTab === 'audit-tests' ? (
        /* Defensive Security Test Runner Sub-Panel */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md uppercase flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> Defensive Test Harness
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Non-Destructive Automated Security Verification
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">Automated Security Audit & Regression Suite</h3>
                <p className="text-xs text-slate-500 max-w-2xl">
                  Executes automated test cases across unauthenticated barriers, customer privilege escalation attempts, payment amount tampering, webhook signature validation, and HTTP security headers.
                </p>
              </div>

              <div>
                <button
                  onClick={handleRunSecurityAuditTests}
                  disabled={isRunningTests}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunningTests ? 'Running Security Suite...' : 'Run Automated Security Tests'}</span>
                </button>
              </div>
            </div>

            {/* Test Summary Banner */}
            {testReport ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      testReport.failed === 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {testReport.failed === 0 ? '✓' : '!'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black">
                        {testReport.failed === 0 ? 'All Security Verification Tests Passed' : `${testReport.failed} Tests Required Remediation`}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {testReport.passed} of {testReport.total} tests passing ({testReport.durationMs}ms execution time)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700">
                      PASSED: {testReport.passed}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 font-bold border border-rose-700">
                      FAILED: {testReport.failed}
                    </span>
                  </div>
                </div>

                {/* Individual Test Cases Table */}
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {testReport.results.map((test) => (
                    <div key={test.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {test.id}
                          </span>
                          <span className="font-bold text-slate-900">{test.name}</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            {test.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{test.details}</p>
                      </div>

                      <div className="shrink-0">
                        {test.passed ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> PASSED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> FAILED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-70" />
                <h4 className="text-sm font-bold text-slate-800">Security Test Suite Ready</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Click the button above to execute live non-destructive security tests against the active server instance.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : activeRoleMatrixTab === 'throttling' ? (
        /* Request Throttling Management Sub-Panel */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Sliding-Window Active
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Real-time DDoS & Brute Force Prevention
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">API Request Throttling Architecture</h3>
                <p className="text-xs text-slate-500 max-w-2xl">
                  Protects backend endpoints against credential stuffing, automated bots, card-testing fraud, and prompt injection/exhaustion with granular per-route sliding windows.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateBurstTraffic}
                  disabled={isSimulatingTraffic}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSimulatingTraffic ? 'Simulating Burst...' : 'Test Throttling (Burst 25)'}</span>
                </button>
                <button
                  onClick={handleResetRateLimits}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset all client window counters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Buckets</span>
                </button>
                <button
                  onClick={fetchRateLimitStats}
                  disabled={isLoadingStats}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Refresh statistics"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Simulation Feedback Alert */}
            {simulationResults && (
              <div className={`mt-4 p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                simulationResults.blocked > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                {simulationResults.blocked > 0 ? (
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{simulationResults.message}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Sent: {simulationResults.totalSent} requests • Allowed: {simulationResults.allowed} • Throttled (429): {simulationResults.blocked} • Last Status: HTTP {simulationResults.lastStatus}
                  </p>
                </div>
              </div>
            )}

            {/* Rate Limiter Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
              {[
                {
                  tier: 'Auth Security',
                  endpoint: '/api/auth/*',
                  limit: '20 req / 60s',
                  purpose: 'Blocks credential stuffing & password brute-force',
                  color: 'border-purple-200 bg-purple-50/40 text-purple-900',
                  icon: Lock,
                  statsKey: 'auth',
                },
                {
                  tier: 'AI Concierge & Copy',
                  endpoint: '/api/ai-*',
                  limit: '25 req / 60s',
                  purpose: 'Mitigates token drainage & LLM cost spikes',
                  color: 'border-blue-200 bg-blue-50/40 text-blue-900',
                  icon: Sparkles,
                  statsKey: 'ai',
                },
                {
                  tier: 'Payment Gateway',
                  endpoint: '/api/paystack/*, simulated',
                  limit: '30 req / 60s',
                  purpose: 'Prevents card testing & payment replay',
                  color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
                  icon: DollarSign,
                  statsKey: 'payment',
                },
                {
                  tier: 'Admin Ops & Config',
                  endpoint: '/api/admin/*',
                  limit: '40 req / 60s',
                  purpose: 'Protects critical configuration mutations',
                  color: 'border-amber-200 bg-amber-50/40 text-amber-900',
                  icon: Sliders,
                  statsKey: 'admin',
                },
                {
                  tier: 'Global API Shield',
                  endpoint: '/api/*',
                  limit: '120 req / 60s',
                  purpose: 'Baseline DDoS & web scraping mitigation',
                  color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900',
                  icon: Globe,
                  statsKey: 'global',
                },
              ].map((item, idx) => {
                const stat = rateLimitStats ? rateLimitStats[item.statsKey] : null;
                const IconComp = item.icon;
                return (
                  <div key={idx} className={`p-4 rounded-2xl border ${item.color} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider">{item.tier}</span>
                        <IconComp className="w-4 h-4 opacity-75" />
                      </div>
                      <div className="text-base font-black tracking-tight">{item.limit}</div>
                      <div className="font-mono text-[10px] opacity-75 mt-0.5">{item.endpoint}</div>
                      <p className="text-[11px] opacity-80 mt-2 leading-relaxed">{item.purpose}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-[11px] font-bold">
                      <span>Allowed: {stat ? stat.totalAllowedRequests : 0}</span>
                      <span className="text-rose-600">Blocked: {stat ? stat.totalBlockedRequests : 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeRoleMatrixTab === 'matrix' ? (
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
