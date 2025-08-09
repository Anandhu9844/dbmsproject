// Utility functions for optimized Supabase queries

export const withTimeout = (promise, timeoutMs = 5000, errorMessage = 'Request timeout') => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  
  return Promise.race([promise, timeoutPromise]);
};

export const handleSupabaseError = (error, fallbackData = null) => {
  console.error('Supabase error:', error);
  
  // Handle specific error types
  if (error.message?.includes('timeout')) {
    return { data: fallbackData, error: 'Request timed out. Please try again.' };
  }
  
  if (error.code === 'PGRST116') {
    return { data: fallbackData, error: 'No data found.' };
  }
  
  return { data: fallbackData, error: error.message || 'Something went wrong.' };
};

export const optimizedQuery = async (queryFn, options = {}) => {
  const { 
    timeout = 5000, 
    fallbackData = null, 
    retries = 1 
  } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await withTimeout(queryFn(), timeout);
      return { data: result.data, error: result.error };
    } catch (error) {
      if (attempt === retries) {
        return handleSupabaseError(error, fallbackData);
      }
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Batch queries for better performance
export const batchQueries = async (queries, timeout = 8000) => {
  try {
    const results = await withTimeout(
      Promise.allSettled(queries),
      timeout,
      'Batch queries timeout'
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Query ${index} failed:`, result.reason);
        return { data: null, error: result.reason.message };
      }
    });
  } catch (error) {
    console.error('Batch queries failed:', error);
    return queries.map(() => ({ data: null, error: error.message }));
  }
};
