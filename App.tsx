import React, { useState, useCallback, useEffect } from 'react';
import { SearchType, type SearchParams, DateRange, CaseStatus, type Bookmark, CaseType, Jurisdiction, type SearchResult, type DocumentAnalysisResult, type CrossReferenceResult } from './types';
import { searchWebWithGemini, analyzeDocument, crossReferenceDocuments, generateNarrativeMap } from './services/geminiService';
import { getCachedResult, setCachedResult } from './services/cacheService';
import { addToHistory } from './services/historyService';
import { getBookmarks, saveBookmark, removeBookmark, isSearchBookmarked, isDocBookmarked, isCrossRefBookmarked, generateSearchKey, generateDocKey, generateCrossRefKey } from './services/bookmarkService';
import { MAX_QUERY_LENGTH } from './constants';
import Header from './components/Header';
import Banner from './components/Banner';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import Examples from './components/Examples';
import Bookmarks from './components/Bookmarks';
import JudgeDetailModal from './components/JudgeDetailModal';
import DocumentAnalysisModal from './components/DocumentAnalysisModal';
import CrossReferenceModal from './components/CrossReferenceModal';
import NarrativeMapper from './components/NarrativeMapper';
import BrainCircuitIcon from './components/icons/BrainCircuitIcon';
import BookmarkIcon from './components/icons/BookmarkIcon';
import HistoryIcon from './components/icons/HistoryIcon';
import GavelIcon from './components/icons/GavelIcon';

type AppTab = 'copilot' | 'audit' | 'vault';

export default function App(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<AppTab>('copilot');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    searchType: SearchType.SEARCH,
    listCount: undefined,
    dateRange: DateRange.ANY,
    siteRestrict: '',
    fileType: '',
    partyName: '',
    caseNumber: '',
    caseStatus: CaseStatus.ALL,
    caseType: CaseType.ALL,
    jurisdiction: Jurisdiction.ALL,
  });
  const [currentSearchParamsForResults, setCurrentSearchParamsForResults] = useState<SearchParams | null>(null);
  const [output, setOutput] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [selectedJudgeName, setSelectedJudgeName] = useState<string | null>(null);

  const [showDocumentAnalysisModal, setShowDocumentAnalysisModal] = useState(false);
  const [documentAnalysisResult, setDocumentAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [isDocumentAnalysisLoading, setIsDocumentAnalysisLoading] = useState<boolean>(false);
  const [auditFileData, setAuditFileData] = useState<{b64: string, mime: string, name: string} | null>(null);

  const [showCrossRefModal, setShowCrossRefModal] = useState(false);
  const [crossRefResult, setCrossRefResult] = useState<CrossReferenceResult | null>(null);
  const [isCrossRefLoading, setIsCrossRefLoading] = useState(false);

  const [showNarrativeMapper, setShowNarrativeMapper] = useState(false);
  const [narrativeInitialData, setNarrativeInitialData] = useState<{b64: string, mime: string, name: string} | null>(null);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const executeSearch = useCallback(async (params: SearchParams) => {
    const finalParams: SearchParams = { ...params, query: params.query.trim() };
    
    if (!finalParams.query) {
      setError('Neural scan requires query input.');
      return;
    }
    if (finalParams.query.length > MAX_QUERY_LENGTH) {
      setError(`Payload exceeds char limit.`);
      return;
    }

    const cachedResult = getCachedResult(finalParams);
    if (cachedResult) {
      setOutput({
        ...cachedResult,
        isSummaryStreaming: false,
        isFollowUpQuestionsLoading: false,
        isRelatedQueriesLoading: false,
        isTimelineLoading: false,
        isIdentifiedJudgesLoading: false,
      });
      setCurrentSearchParamsForResults(finalParams);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput({
      summary: '',
      sources: [],
      followUpQuestions: [],
      relatedQueries: [],
      timelineEvents: [],
      identifiedJudges: [],
      isSummaryStreaming: true,
      isFollowUpQuestionsLoading: false,
      isRelatedQueriesLoading: false,
      isTimelineLoading: false,
      isIdentifiedJudgesLoading: false,
    });
    setCurrentSearchParamsForResults(finalParams);

    try {
      const result = await searchWebWithGemini(finalParams, (partial) => {
        setOutput(prev => ({ ...prev!, ...partial }));
      });
      setOutput(prev => ({
          ...prev!,
          ...result,
          isSummaryStreaming: false,
      }));
      setCachedResult(finalParams, result);
      addToHistory(finalParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dossier synthesis failure.');
      setOutput(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => executeSearch(searchParams), [searchParams, executeSearch]);
  
  const handleSaveResult = (params: SearchParams, result: SearchResult) => {
    const key = generateSearchKey(params);
    saveBookmark({ key, type: 'search', params, result, savedAt: Date.now() });
    setBookmarks(getBookmarks());
  };

  const handleRemoveSave = (params: SearchParams) => {
    removeBookmark(generateSearchKey(params));
    setBookmarks(getBookmarks());
  };

  const handleViewBookmark = (bookmark: Bookmark) => {
    if (bookmark.type === 'search') {
        setSearchParams(bookmark.params);
        setOutput({ ...bookmark.result, isSummaryStreaming: false });
        setCurrentSearchParamsForResults(bookmark.params);
        setActiveTab('copilot');
    } else if (bookmark.type === 'document_analysis') {
        setDocumentAnalysisResult(bookmark.result);
        setShowDocumentAnalysisModal(true);
    } else if (bookmark.type === 'cross_reference') {
        setCrossRefResult(bookmark.result);
        setShowCrossRefModal(true);
    }
  };

  const launchNarrativeFromAudit = () => {
    if (!auditFileData) return;
    setNarrativeInitialData(auditFileData);
    setShowDocumentAnalysisModal(false);
    setShowNarrativeMapper(true);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-12 flex flex-col bg-[#0a0a0a]">
      <Banner />
      
      <div className="flex-grow flex flex-col lg:flex-row max-w-[1800px] mx-auto w-full px-4 lg:px-12 gap-8 lg:gap-12 mt-6 lg:mt-12">
        
        {/* Desktop Sidebar / Mobile "Audit" View */}
        <aside className={`lg:w-96 flex flex-col gap-12 ${activeTab === 'audit' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="tech-plate p-6 lg:p-10 flex flex-col gap-10">
            <div className="calibration-marks mark-tl mark-bl hidden lg:block"></div>
            <Header 
              onAnalyzeDocumentClick={() => { setAuditFileData(null); setShowDocumentAnalysisModal(true); }} 
              onCrossReferenceClick={() => setShowCrossRefModal(true)} 
              onNarrativeMapperClick={() => { setNarrativeInitialData(null); setShowNarrativeMapper(true); }}
            />
          </div>

          <div className="hidden lg:flex flex-col gap-12">
            <Bookmarks 
              bookmarks={bookmarks}
              onView={handleViewBookmark}
              onDelete={(key) => { removeBookmark(key); setBookmarks(getBookmarks()); }}
            />
          </div>
        </aside>

        {/* Main Console / Mobile "Copilot" View */}
        <main className={`flex-grow flex flex-col gap-8 lg:gap-12 ${activeTab === 'copilot' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="tech-plate overflow-hidden">
            <div className="calibration-marks mark-tl mark-tr mark-bl mark-br hidden lg:block"></div>
            <SearchForm
              params={searchParams}
              setParams={setSearchParams}
              onSearch={handleSearch}
              isLoading={isLoading}
              onClear={() => { setOutput(null); setSearchParams({...searchParams, query: ''}); }}
              onSelectHistory={(p) => { setSearchParams(p); executeSearch(p); }}
              onSave={() => currentSearchParamsForResults && output && handleSaveResult(currentSearchParamsForResults, output)}
              onImportPDF={() => { setAuditFileData(null); setShowDocumentAnalysisModal(true); }}
              canSave={!!output && !!currentSearchParamsForResults}
            />
            
            <div className="px-6 lg:px-10 pb-6 lg:pb-10 pt-4 lg:pt-6">
              <Examples onSelectExample={(ex) => setSearchParams({...searchParams, ...ex})} />
            </div>
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-900/40 p-4 lg:p-6 etched-label text-red-500 flex items-center gap-4 animate-pulse mx-2 lg:mx-0">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              SYSTEM_FAULT: {error}
            </div>
          )}

          <ResultsDisplay
            output={output}
            searchParams={currentSearchParamsForResults}
            isLoading={isLoading}
            onQuestionClick={(q) => { setSearchParams({...searchParams, query: q}); executeSearch({...searchParams, query: q}); }}
            onAnalysisClick={(prompt) => { /* logic */ }}
            onSave={handleSaveResult}
            onRemoveSave={handleRemoveSave}
            isSaved={currentSearchParamsForResults ? isSearchBookmarked(currentSearchParamsForResults) : false}
            onJudgeClick={(name) => { setSelectedJudgeName(name); setShowJudgeModal(true); }}
          />
        </main>

        {/* Mobile "Vault" View */}
        <section className={`flex-grow lg:hidden ${activeTab === 'vault' ? 'flex' : 'hidden'} flex-col gap-6`}>
           <div className="tech-plate p-6">
              <Bookmarks 
                bookmarks={bookmarks}
                onView={handleViewBookmark}
                onDelete={(key) => { removeBookmark(key); setBookmarks(getBookmarks()); }}
              />
           </div>
        </section>
      </div>

      <footer className="mt-20 mb-8 lg:mb-0 text-center etched-label opacity-20 tracking-[0.4em] lg:tracking-[0.6em] px-4 text-[8px] lg:text-[10px]">
        PRECISION_LEGAL_ANALYSIS_NODE // GEMINI_v3_CORE
      </footer>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 z-[60] pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <button 
            onClick={() => setActiveTab('copilot')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'copilot' ? 'text-blue-500' : 'text-slate-500'}`}
          >
            <BrainCircuitIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Copilot</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'audit' ? 'text-blue-500' : 'text-slate-500'}`}
          >
            <HistoryIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Audit</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('vault')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'vault' ? 'text-blue-500' : 'text-slate-500'}`}
          >
            <BookmarkIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
          </button>
        </div>
      </nav>

      {showJudgeModal && selectedJudgeName && (
        <JudgeDetailModal judgeName={selectedJudgeName} onClose={() => setShowJudgeModal(false)} />
      )}
      {showDocumentAnalysisModal && (
        <DocumentAnalysisModal
          onClose={() => setShowDocumentAnalysisModal(false)}
          onAnalyze={async (b64, mime, name) => {
            setAuditFileData({b64, mime, name});
            setIsDocumentAnalysisLoading(true);
            try { setDocumentAnalysisResult(await analyzeDocument(b64, mime, name)); }
            catch (e) { console.error(e); }
            finally { setIsDocumentAnalysisLoading(false); }
          }}
          result={documentAnalysisResult}
          isLoading={isDocumentAnalysisLoading}
          error={null}
          onSave={(res) => {
            saveBookmark({
              key: generateDocKey(res.fileName),
              type: 'document_analysis',
              result: res,
              savedAt: Date.now()
            });
            setBookmarks(getBookmarks());
          }}
          onRemoveSave={(r) => {
            removeBookmark(generateDocKey(r.fileName));
            setBookmarks(getBookmarks());
          }}
          onMapNarrative={launchNarrativeFromAudit}
          isSaved={documentAnalysisResult ? isDocBookmarked(documentAnalysisResult.fileName) : false}
        />
      )}
      {showCrossRefModal && (
        <CrossReferenceModal
          onClose={() => setShowCrossRefModal(false)}
          onAnalyze={async (a, am, an, b, bm, bn) => {
            setIsCrossRefLoading(true);
            try { setCrossRefResult(await crossReferenceDocuments(a, am, an, b, bm, bn)); }
            catch(e) { console.error(e); }
            finally { setIsCrossRefLoading(false); }
          }}
          result={crossRefResult}
          isLoading={isCrossRefLoading}
          error={null}
          onSave={(res) => {
            saveBookmark({
              key: generateCrossRefKey(res.fileAName, res.fileBName),
              type: 'cross_reference',
              result: res,
              savedAt: Date.now()
            });
            setBookmarks(getBookmarks());
          }}
          onRemoveSave={(r) => {
            removeBookmark(generateCrossRefKey(r.fileAName, r.fileBName));
            setBookmarks(getBookmarks());
          }}
          isSaved={crossRefResult ? isCrossRefBookmarked(crossRefResult.fileAName, crossRefResult.fileBName) : false}
        />
      )}
      {showNarrativeMapper && (
        <NarrativeMapper 
          onClose={() => { setShowNarrativeMapper(false); setNarrativeInitialData(null); }} 
          initialData={narrativeInitialData}
          onGenerate={async (b, m, n) => await generateNarrativeMap(b, m, n)}
        />
      )}
    </div>
  );
}