import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { handleApiError } from '@/services/api';

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic API hook
export const useApi = <T>(
  apiFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError);
      const errorMessage = apiError.detail || apiError.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
};

// API hook with parameters
export const useApiWithParams = <T, P>(
  apiFunction: (params: P) => Promise<T>
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiFunction(params);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError);
      const errorMessage = apiError.detail || apiError.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [apiFunction]);

  return {
    ...state,
    execute,
  };
};

// Mutation hook for create/update/delete operations
export const useMutation = <T, P = void>(
  mutationFunction: (params: P) => Promise<T>
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));
    try {
      const result = await mutationFunction(params);
      setState({ data: result, loading: false, error: null, success: true });
      return result;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError);
      const errorMessage = apiError.detail || apiError.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage, success: false });
      throw error;
    }
  }, [mutationFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

// Pagination hook
export const usePagination = <T>(
  fetchFunction: (page: number) => Promise<{ results: T[]; count: number; next: string | null; previous: string | null }>,
  pageSize: number = 20
) => {
  const [state, setState] = useState<{
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    loading: boolean;
    error: string | null;
    hasNext: boolean;
    hasPrevious: boolean;
  }>({
    data: [],
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    loading: false,
    error: null,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchPage = useCallback(async (page: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchFunction(page);
      const totalPages = Math.ceil(result.count / pageSize);
      
      setState({
        data: result.results,
        currentPage: page,
        totalPages,
        totalCount: result.count,
        loading: false,
        error: null,
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
    } catch (error) {
      const apiError = handleApiError(error as AxiosError);
      const errorMessage = apiError.detail || apiError.message || 'An error occurred';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, [fetchFunction, pageSize]);

  const nextPage = useCallback(() => {
    if (state.hasNext) {
      fetchPage(state.currentPage + 1);
    }
  }, [state.hasNext, state.currentPage, fetchPage]);

  const previousPage = useCallback(() => {
    if (state.hasPrevious && state.currentPage > 1) {
      fetchPage(state.currentPage - 1);
    }
  }, [state.hasPrevious, state.currentPage, fetchPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      fetchPage(page);
    }
  }, [state.totalPages, fetchPage]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    ...state,
    nextPage,
    previousPage,
    goToPage,
    refetch: () => fetchPage(state.currentPage),
  };
};