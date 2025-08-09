import { useState, useEffect, useCallback } from 'react';

// Simple cache to avoid repeated queries
const queryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useOptimizedFetch = (queryKey, queryFn, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    enabled = true, 
    timeout = 5000,
    cacheTime = CACHE_DURATION 
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = queryCache.get(queryKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      // Race the query against timeout
      const result = await Promise.race([queryFn(), timeoutPromise]);

      // Cache the result
      queryCache.set(queryKey, {
        data: result,
        timestamp: Date.now()
      });

      setData(result);
    } catch (err) {
      console.error(`Query error for ${queryKey}:`, err);
      setError(err);
      
      // Use cached data if available on error
      const cached = queryCache.get(queryKey);
      if (cached) {
        setData(cached.data);
      }
    } finally {
      setLoading(false);
    }
  }, [queryKey, queryFn, enabled, timeout, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    queryCache.delete(queryKey);
    fetchData();
  }, [queryKey, fetchData]);

  return { data, loading, error, refetch };
};

// Clear cache when needed
export const clearCache = () => {
  queryCache.clear();
};
