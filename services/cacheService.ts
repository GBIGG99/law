import { type SearchParams, type SearchResult } from '../types';

const CACHE_PREFIX = 'web-search-explorer-cache:';
// Cache duration: 1 hour in milliseconds
const CACHE_DURATION = 60 * 60 * 1000;

interface CachedData {
  timestamp: number;
  result: SearchResult;
}

/**
 * Creates a consistent, sorted, and unique string key from search parameters.
 * Sorting keys ensures that the order of properties doesn't change the key.
 * This makes the caching deterministic.
 * This function is exported to be used by other services (e.g., bookmarking).
 */
export const generateCacheKey = (params: SearchParams): string => {
  const sortedParams = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc, [key, value]) => {
      // Only include defined and non-empty values in the key for consistency
      if (value !== undefined && value !== null && value !== '') {
        // Fix: Use a type assertion to address the error "Type 'any' is not assignable to type 'never'".
        // TypeScript cannot infer the correlation between the key and value types within the reduce function,
        // which makes direct assignment unsafe. The assertion tells the compiler that we guarantee the assignment is valid.
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as Partial<SearchParams>);

  return `${CACHE_PREFIX}${JSON.stringify(sortedParams)}`;
};

/**
 * Retrieves a search result from localStorage if it exists and is not expired.
 * @param params The search parameters to look up in the cache.
 * @returns The cached SearchResult or null if not found or expired.
 */
export const getCachedResult = (params: SearchParams): SearchResult | null => {
  const key = generateCacheKey(params);
  try {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) {
      return null;
    }

    const data: CachedData = JSON.parse(cachedItem);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(key);
      console.log(`Cache expired for key: ${key}`);
      return null;
    }

    console.log(`Cache hit for key: ${key}`);
    return data.result;
  } catch (error) {
    console.error("Failed to read from cache:", error);
    // If parsing fails, it's safer to remove the corrupted item
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Stores a search result in localStorage with a timestamp.
 * @param params The search parameters used to generate the result.
 * @param result The search result to cache.
 */
export const setCachedResult = (params: SearchParams, result: SearchResult): void => {
  const key = generateCacheKey(params);
  const data: CachedData = {
    timestamp: Date.now(),
    result,
  };

  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Cached result for key: ${key}`);
  } catch (error) {
    console.error("Failed to write to cache:", error);
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn("Cache storage is full. Consider clearing the cache.");
    }
  }
};

/**
 * Clears all cached search results created by this application from localStorage.
 */
export const clearCache = (): void => {
  try {
    let itemsRemoved = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
        itemsRemoved++;
      }
    });
    console.log(`Web Search Explorer cache cleared. Removed ${itemsRemoved} items.`);
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
};
