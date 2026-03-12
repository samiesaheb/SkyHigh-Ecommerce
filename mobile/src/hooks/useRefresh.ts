import { useState, useCallback } from 'react';

interface UseRefreshReturn {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * Hook for handling pull-to-refresh functionality
 */
export const useRefresh = (refreshFunction: () => Promise<void>): UseRefreshReturn => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFunction();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFunction]);

  return {
    refreshing,
    onRefresh,
  };
};