
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

export const LEGAL_SUGGESTIONS = [
    "Motion to Dismiss",
    "Motion for Summary Judgment",
    "C.R.C.P. Rule 12(b)",
    "Entry of Appearance",
    "Notice of Hearing",
    "Sentencing Guidelines Colorado",
    "Discovery Request Template",
    "Subpoena Duces Tecum",
    "Writ of Restitution Denver",
    "Certificate of Service",
    "Pro Se filing requirements",
    "Mediation statement sample",
    "Request for Production of Documents",
    "Interrogatories",
    "Affidavit of Service",
    "Case Management Order",
    "Ex Parte Motion",
    "Protective Order",
    "Contempt of Court",
    "Default Judgment requirements"
];
