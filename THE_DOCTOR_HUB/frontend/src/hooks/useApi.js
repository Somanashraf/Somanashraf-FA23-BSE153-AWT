import { useState, useCallback } from 'react';
import { useToast } from './useToast';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const execute = useCallback(async (apiFn, { onSuccess, onError, successMsg, showErrorToast = true } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      if (successMsg) toast.success(successMsg);
      if (onSuccess) onSuccess(result.data);
      return result.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred';
      setError(msg);
      if (showErrorToast) toast.error(msg);
      if (onError) onError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, execute };
};
