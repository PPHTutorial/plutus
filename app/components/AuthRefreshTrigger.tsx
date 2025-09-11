import { useEffect } from 'react';
import { useAuthRefresh } from '@/app/hooks/useAuthRefresh';

interface AuthRefreshTriggerProps {
  /** Trigger refresh when these events occur */
  events?: Array<'payment' | 'plan_change' | 'profile_update' | 'referral' | 'custom'>;
  /** Custom event name for specific triggers */
  customEventName?: string;
  /** Whether to trigger refresh immediately on mount */
  refreshOnMount?: boolean;
  /** Interval in milliseconds to auto-refresh (use with caution) */
  autoRefreshInterval?: number;
}

/**
 * Component that intelligently triggers auth refresh based on page context
 * Add this to pages where user data might change (payment, profile, admin, etc.)
 */
export function AuthRefreshTrigger({
  events = [],
  customEventName,
  refreshOnMount = false,
  autoRefreshInterval
}: AuthRefreshTriggerProps) {
  const {
    refreshOnPayment,
    refreshOnPlanChange,
    refreshOnProfileUpdate,
    refreshOnReferral,
    triggerSmartRefresh,
    canRefresh,
    timeUntilRefresh
  } = useAuthRefresh();

  // Refresh on mount if requested
  useEffect(() => {
    if (refreshOnMount) {
      triggerSmartRefresh('component_mount');
    }
  }, [refreshOnMount, triggerSmartRefresh]);

  // Set up auto-refresh interval (use sparingly)
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval < 30000) return; // Minimum 30 seconds

    const interval = setInterval(() => {
      if (canRefresh()) {
        triggerSmartRefresh('auto_refresh');
      }
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, canRefresh, triggerSmartRefresh]);

  // Set up custom event listeners
  useEffect(() => {
    const eventHandlers: Record<string, () => void> = {};

    if (events.includes('payment')) {
      eventHandlers.plutus_payment_completed = refreshOnPayment;
    }
    if (events.includes('plan_change')) {
      eventHandlers.plutus_plan_changed = refreshOnPlanChange;
    }
    if (events.includes('profile_update')) {
      eventHandlers.plutus_profile_updated = refreshOnProfileUpdate;
    }
    if (events.includes('referral')) {
      eventHandlers.plutus_referral_completed = refreshOnReferral;
    }
    if (events.includes('custom') && customEventName) {
      eventHandlers[customEventName] = () => triggerSmartRefresh(customEventName);
    }

    // Add event listeners
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      window.addEventListener(eventName, handler);
    });

    // Cleanup
    return () => {
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        window.removeEventListener(eventName, handler);
      });
    };
  }, [
    events,
    customEventName,
    refreshOnPayment,
    refreshOnPlanChange,
    refreshOnProfileUpdate,
    refreshOnReferral,
    triggerSmartRefresh
  ]);

  // Show refresh status in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 pointer-events-none z-50">
        Auth: {canRefresh() ? 'Ready' : `Wait ${Math.ceil(timeUntilRefresh() / 1000)}s`}
      </div>
    );
  }

  return null;
}

// Utility functions to dispatch custom events
export const authEvents = {
  paymentCompleted: () => {
    window.dispatchEvent(new CustomEvent('plutus_payment_completed'));
  },
  planChanged: () => {
    window.dispatchEvent(new CustomEvent('plutus_plan_changed'));
  },
  profileUpdated: () => {
    window.dispatchEvent(new CustomEvent('plutus_profile_updated'));
  },
  referralCompleted: () => {
    window.dispatchEvent(new CustomEvent('plutus_referral_completed'));
  },
  custom: (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
  }
};
