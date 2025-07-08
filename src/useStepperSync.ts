/* eslint-disable no-console */
import { useCallback } from "react";

export interface StepperSyncReturn {
  saveToLocalStorage: (key: string, data: unknown) => void;
  loadFromLocalStorage: (key: string) => unknown;
  clearFromLocalStorage: (key: string) => void;
}

/**
 * Hook for synchronizing stepper state with localStorage
 */
export const useStepperSync = (): StepperSyncReturn => {
  const saveToLocalStorage = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((key: string): unknown => {
    try {
      const item = localStorage.getItem(key);

      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);

      return null;
    }
  }, []);

  const clearFromLocalStorage = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to clear from localStorage:", error);
    }
  }, []);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearFromLocalStorage
  };
};
