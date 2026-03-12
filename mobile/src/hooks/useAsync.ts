import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/utils';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAsyncReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for handling async operations with loading and error states
 */
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = false
): UseAsyncReturn<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: getErrorMessage(error),
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  // Execute immediately if requested
  if (immediate && !state.isLoading && !state.data && !state.error) {
    execute();
  }

  return {
    ...state,
    execute,
    reset,
  };
};