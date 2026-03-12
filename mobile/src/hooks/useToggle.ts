import { useState, useCallback } from 'react';

/**
 * Hook for toggling boolean values
 * Useful for modals, visibility states, etc.
 */
export const useToggle = (initialValue = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, set];
};