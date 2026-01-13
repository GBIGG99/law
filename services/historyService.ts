
import { type SearchParams } from '../types';

const HISTORY_KEY = 'web-search-explorer-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Generates a simple, unique key for a SearchParams object to manage history entries.
 * This key focuses on the core search parameters to identify unique searches.
 */
const getParamsKey = (params: SearchParams): string => {
  return JSON.stringify({
    query: params.query.trim().toLowerCase(),
    searchType: params.searchType,
    listCount: params.listCount,
    dateRange: params.dateRange,
    siteRestrict: params.siteRestrict,
    fileType: params.fileType,
    partyName: params.partyName,
    caseNumber: params.caseNumber,
    caseStatus: params.caseStatus,
    caseType: params.caseType,
    jurisdiction: params.jurisdiction,
  });
};

/**
 * Retrieves the search history from localStorage.
 * @returns An array of SearchParams objects.
 */
export const getHistory = (): SearchParams[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Failed to retrieve search history:', error);
    return [];
  }
};

/**
 * Adds a new search to the history, ensuring no duplicates and respecting the maximum history size.
 * If an identical search already exists, it is moved to the top of the history.
 * @param params The SearchParams object to add to the history.
 */
export const addToHistory = (params: SearchParams): void => {
  if (!params.query.trim()) return;

  try {
    let history = getHistory();
    const newKey = getParamsKey(params);
    
    // Remove any existing entry with the same key to avoid duplicates and move it to the top.
    history = history.filter(item => getParamsKey(item) !== newKey);
    
    // Add the new item to the beginning of the array
    history.unshift(params);

    // Ensure the history does not exceed the maximum size
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to update search history:', error);
  }
};

/**
 * Clears the entire search history from localStorage.
 */
export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    console.log('Search history cleared.');
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
};