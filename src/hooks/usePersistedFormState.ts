
import { useState, useEffect, useCallback } from 'react';

interface UsePersistedFormStateOptions<T> {
  key: string;
  initialState: T;
  clearOnSubmit?: boolean;
}

export function usePersistedFormState<T extends Record<string, any>>({
  key,
  initialState,
  clearOnSubmit = true,
}: UsePersistedFormStateOptions<T>) {
  const [formData, setFormData] = useState<T>(() => {
    // Try to load persisted data on initialization
    try {
      const saved = localStorage.getItem(`form_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial state to ensure all required fields exist
        return { ...initialState, ...parsed };
      }
    } catch (error) {
      console.warn('Error loading persisted form data:', error);
    }
    return initialState;
  });

  // Save to localStorage whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(`form_${key}`, JSON.stringify(formData));
    } catch (error) {
      console.warn('Error saving form data:', error);
    }
  }, [key, formData]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(`form_${key}`);
      setFormData(initialState);
    } catch (error) {
      console.warn('Error clearing persisted form data:', error);
    }
  }, [key, initialState]);

  // Update form data
  const updateFormData = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Set multiple fields at once
  const setFormDataBatch = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle successful form submission
  const handleSubmitSuccess = useCallback(() => {
    if (clearOnSubmit) {
      clearPersistedData();
    }
  }, [clearOnSubmit, clearPersistedData]);

  return {
    formData,
    setFormData,
    updateFormData,
    setFormDataBatch,
    clearPersistedData,
    handleSubmitSuccess,
  };
}
