
export enum SearchType {
  SEARCH = 'search',
  NEWS = 'news',
  ACADEMIC = 'academic',
}

export enum DateRange {
  ANY = 'any',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum CaseStatus {
  ALL = 'all',
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum CaseType {
  ALL = 'all',
  CIVIL = 'civil',
  CRIMINAL = 'criminal',
  FAMILY = 'family',
  PROBATE = 'probate',
  TRAFFIC = 'traffic',
}

export enum Jurisdiction {
  ALL = 'all',
  DENVER_DISTRICT = 'denver_district',
  DENVER_COUNTY = 'denver_county',
  COLORADO_SUPREME = 'colorado_supreme',
  COLORADO_APPEALS = 'colorado_appeals',
}

export interface SearchParams {
  query: string;
  searchType: SearchType;
  listCount?: number;
  dateRange?: DateRange;
  siteRestrict?: string;
  fileType?: string;
  partyName?: string;
  caseStatus?: CaseStatus;
  caseType?: CaseType;
  jurisdiction?: Jurisdiction;
  caseNumber?: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface TimelineEvent {
  date: string;
  description: string;
  type: 'filing' | 'motion' | 'court_date' | 'ruling' | 'other';
  narrativeTrack?: 'prosecution' | 'defense' | 'undisputed';
  citation?: string;
}

export interface JudgeSummary {
  name: string;
}

export interface JudgeDetail {
  name: string;
  tendencies: string;
  notableCases: { caseName: string; outcome: string; date: string; }[];
  statistics: {
    totalCases?: number;
    convictionRate?: string;
    averageSentence?: string;
    caseLoad?: string;
  }[];
  rulingPatternsByCaseType?: { 
    caseType: string; 
    pattern: string; 
    percentage?: string; 
    riskLevel?: 'low' | 'medium' | 'high';
  }[];
  averageTimeToDisposition?: string;
  sentencingData?: { offense: string; averageSentence: string; }[];
  strategicInsights: string;
}

export interface DocumentAnalysisResult {
  fileName: string;
  strategicSummary: string;
  keyArguments: string[];
  identifiedEntities: { type: 'judge' | 'party' | 'date' | 'case_number' | 'other'; value: string; }[];
  actionableInsights: string[];
  sourceDocumentText?: string;
}

export interface Contradiction {
  topic: string;
  severity: 'high' | 'medium' | 'low';
  sourceAClaim: string;
  sourceBClaim: string;
  analysis: string;
}

export interface CrossReferenceResult {
  fileAName: string;
  fileBName: string;
  overallCredibilityScore: number;
  summaryOfDiscrepancies: string;
  contradictions: Contradiction[];
}

export type NarrativeNodeType = 'person' | 'location' | 'asset' | 'institution' | 'event';

export interface NarrativeNode {
  id: string;
  label: string;
  type: NarrativeNodeType;
  description?: string;
  bradyFlag?: string;
  evidenceTags?: string[];
  sourceCitation?: string;
}

export interface NarrativeLink {
  source: string;
  target: string;
  label: string;
  type: 'explicit' | 'inferred' | 'contradiction';
  evidence?: string;
}

export interface NarrativeMapResult {
  nodes: NarrativeNode[];
  links: NarrativeLink[];
  timeline: TimelineEvent[];
  strategicAssessment: string;
}

export interface AdversarialStrategy {
  prosecutorMoves: string[];
  defenseCounters: string[];
  hiddenRisks: string[];
}

export interface ThreatNode {
  label: string;
  impact: number; // 1-10
  probability: number; // 1-10
}

export interface StrategicFactors {
  evidence: number; // 1-10
  procedural: number; // 1-10
  jurisdictional: number; // 1-10
  resource: number; // 1-10
  opponentVulnerability: number; // 1-10
}

export interface StrategicTelemetry {
  readinessScore: number; // 0-100
  threatMatrix: ThreatNode[];
  complexityIndex: number; // 1-10
  strategicFactors: StrategicFactors;
}

export interface SearchResult {
  summary: string;
  sources: Source[];
  followUpQuestions?: string[];
  relatedQueries?: string[];
  timelineEvents?: TimelineEvent[];
  identifiedJudges?: JudgeSummary[];
  adversarialStrategy?: AdversarialStrategy;
  telemetry?: StrategicTelemetry;
  isSummaryStreaming: boolean;
  isFollowUpQuestionsLoading: boolean;
  isRelatedQueriesLoading: boolean;
  isTimelineLoading: boolean;
  isIdentifiedJudgesLoading: boolean;
  isAdversarialLoading?: boolean;
  isTelemetryLoading?: boolean;
}

export type PartialSearchResult = Partial<SearchResult>;

export type BookmarkType = 'search' | 'document_analysis' | 'cross_reference';

export interface BaseBookmark {
  key: string;
  type: BookmarkType;
  savedAt: number;
}

export interface SearchBookmark extends BaseBookmark {
  type: 'search';
  params: SearchParams;
  result: SearchResult;
}

export interface DocumentBookmark extends BaseBookmark {
  type: 'document_analysis';
  result: DocumentAnalysisResult;
}

export interface CrossRefBookmark extends BaseBookmark {
  type: 'cross_reference';
  result: CrossReferenceResult;
}

export type Bookmark = SearchBookmark | DocumentBookmark | CrossRefBookmark;
