import { SearchType } from './types';
import type { SearchParams } from './types';

export const MAX_QUERY_LENGTH = 10000;
export const MIN_LIST_COUNT = 1;
export const MAX_LIST_COUNT = 50;

export const EXAMPLES: SearchParams[] = [
    { query: 'Denver District Court civil filing fees', searchType: SearchType.SEARCH },
    { query: 'Judge Christopher Baumann decisions', searchType: SearchType.SEARCH },
    { query: 'Denver small claims court forms PDF', searchType: SearchType.ACADEMIC },
    { query: 'Denver police operations manual', searchType: SearchType.SEARCH },
];