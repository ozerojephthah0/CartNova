import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import { AccessDeniedPage } from './AccessDeniedPage';

interface RouteGuardProps {
  children: React.ReactNode;
}

export interface SecurityBlockedState {
  isBlocked: boolean;
  attemptedPath: string;
  requiredRole: UserRole;
  reason: 'UNAUTHENTICATED' | 'INSUFFICIENT_ROLE' | 'SUSPENDED_ACCOUNT';
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const {
    activeRole,
    currentUser,
    isLoggedIn,
    activeCustomerTab,
    setActiveCustomerTab,
    switchRole,
    openAuthModal,
  } = useStore();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [securityBlock, setSecurityBlock] = useState<SecurityBlockedState | null>(null);

  // Evaluate URL and check authorization
  const evaluateRouteSecurity = useCallback((path: string) => {
    const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

    // 1. ADMIN ROUTES (/admin, /admin/*)
    if (cleanPath.startsWith('/admin')) {
      if (!isLoggedIn) {
        setSecurityBlock({
          isBlocked: true,
          attemptedPath: path,
          requiredRole: 'admin',
          reason: 'UNAUTHENTICATED',
        });
        return false;
      }

      if (currentUser.role !== 'admin') {
        setSecurityBlock({
          isBlocked: true,
          attemptedPath: path,
          requiredRole: 'admin',
          reason: 'INSUFFICIENT_ROLE',
        });
        return false;
      }

      // Authorized Admin
      setSecurityBlock(null);
      if (activeRole !== 'admin') {
        switchRole('admin');
      }
      return true;
    }

    // 2. MERCHANT / SELLER ROUTES (/merchant, /seller, /seller/*)
    if (cleanPath.startsWith('/merchant') || cleanPath.startsWith('/seller')) {
      if (!isLoggedIn) {
        setSecurityBlock({
          isBlocked: true,
          attemptedPath: path,
          requiredRole: 'seller',
          reason: 'UNAUTHENTICATED',
        });
        return false;
      }

      if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
        setSecurityBlock({
          isBlocked: true,
          attemptedPath: path,
          requiredRole: 'seller',
          reason: 'INSUFFICIENT_ROLE',
        });
        return false;
      }

      // Authorized Merchant
      setSecurityBlock(null);
      if (activeRole !== 'seller' && currentUser.role === 'seller') {
        switchRole('seller');
      }
      return true;
    }

    // 3. PROTECTED CUSTOMER ROUTES (/orders, /profile, /wishlist)
    if (['/orders', '/profile', '/wishlist'].includes(cleanPath)) {
      if (!isLoggedIn) {
        setSecurityBlock({
          isBlocked: true,
          attemptedPath: path,
          requiredRole: 'customer',
          reason: 'UNAUTHENTICATED',
        });
        return false;
      }
    }

    // 4. ACCESS DENIED ROUTE (/access-denied, /unauthorized)
    if (cleanPath.startsWith('/access-denied') || cleanPath.startsWith('/unauthorized')) {
      setSecurityBlock({
        isBlocked: true,
        attemptedPath: path,
        requiredRole: 'admin',
        reason: 'INSUFFICIENT_ROLE',
      });
      return false;
    }

    // Route is cleared / public
    setSecurityBlock(null);

    // Map public/standard paths to customer tabs if in customer mode
    if (activeRole === 'customer') {
      if (cleanPath === '/orders' && activeCustomerTab !== 'orders') setActiveCustomerTab('orders');
      else if (cleanPath === '/wishlist' && activeCustomerTab !== 'wishlist') setActiveCustomerTab('wishlist');
      else if (cleanPath === '/profile' && activeCustomerTab !== 'profile') setActiveCustomerTab('profile');
      else if (cleanPath === '/notifications' && activeCustomerTab !== 'notifications') setActiveCustomerTab('notifications');
      else if (cleanPath === '/support' && activeCustomerTab !== 'support') setActiveCustomerTab('support');
      else if (cleanPath === '/seasonal-events' && activeCustomerTab !== 'seasonal-events') setActiveCustomerTab('seasonal-events');
      else if (cleanPath === '/referrals' && activeCustomerTab !== 'referrals') setActiveCustomerTab('referrals');
      else if (cleanPath === '/' || cleanPath === '/shop') {
        if (activeCustomerTab !== 'shop' && activeCustomerTab !== 'product-detail' && activeCustomerTab !== 'seller-store') {
          setActiveCustomerTab('shop');
        }
      }
    }

    return true;
  }, [isLoggedIn, currentUser, activeRole, activeCustomerTab, setActiveCustomerTab, switchRole]);

  // Listen to popstate, hashchange, and pushState events
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      evaluateRouteSecurity(path);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Custom event dispatcher for pushState/replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handleLocationChange();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handleLocationChange();
      return result;
    };

    // Initial evaluation on mount
    evaluateRouteSecurity(window.location.pathname || '/');

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [evaluateRouteSecurity]);

  // Sync route URL when activeRole or activeCustomerTab changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let targetPath = '/';
    if (activeRole === 'admin') {
      targetPath = '/admin';
    } else if (activeRole === 'seller') {
      targetPath = '/merchant';
    } else {
      switch (activeCustomerTab) {
        case 'orders':
          targetPath = '/orders';
          break;
        case 'wishlist':
          targetPath = '/wishlist';
          break;
        case 'profile':
          targetPath = '/profile';
          break;
        case 'notifications':
          targetPath = '/notifications';
          break;
        case 'support':
          targetPath = '/support';
          break;
        case 'seasonal-events':
          targetPath = '/seasonal-events';
          break;
        case 'referrals':
          targetPath = '/referrals';
          break;
        case 'seller-store':
          targetPath = '/seller-store';
          break;
        default:
          targetPath = '/';
      }
    }

    // If we're blocked by security, don't overwrite the blocked URL
    if (securityBlock?.isBlocked) {
      return;
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ path: targetPath }, '', targetPath);
      setCurrentPath(targetPath);
    }
  }, [activeRole, activeCustomerTab, securityBlock]);

  // Re-evaluate when user auth state changes (e.g., after login/logout/role switch)
  useEffect(() => {
    evaluateRouteSecurity(window.location.pathname || '/');
  }, [isLoggedIn, currentUser.role, evaluateRouteSecurity]);

  // If blocked by security guard, display the Access Denied barrier
  if (securityBlock?.isBlocked) {
    return (
      <AccessDeniedPage
        attemptedPath={securityBlock.attemptedPath || currentPath}
        requiredRole={securityBlock.requiredRole}
        onNavigateHome={() => {
          setSecurityBlock(null);
          switchRole('customer');
          setActiveCustomerTab('shop');
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
        onOpenLogin={(role) => {
          openAuthModal('login', role || securityBlock.requiredRole);
        }}
      />
    );
  }

  return <>{children}</>;
};
