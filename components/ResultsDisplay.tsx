import React, { useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type SearchResult, type SearchParams } from '../types';
import FollowUpQuestions from './FollowUpQuestions';
import BookmarkIcon from './icons/BookmarkIcon';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';
import RelatedQueries from './RelatedQueries';
import GlobeIcon from './icons/GlobeIcon';
import TimelineChart from './TimelineChart';
import IdentifiedJudges from './IdentifiedJudges';
import AdversarialStrategyWidget from './AdversarialStrategyWidget';
import StrategicTelemetryWidget from './StrategicTelemetryWidget';

interface ResultsDisplayProps {
  output: SearchResult | null;
  searchParams: SearchParams | null;
  isLoading: boolean;
  onQuestionClick: (q: string) => void;
  onAnalysisClick: (p: string) => void;
  onSave: (p: SearchParams, r: SearchResult) => void;
  onRemoveSave: (p: SearchParams) => void;
  isSaved: boolean;
  onJudgeClick: (n: string) => void;
}

const IntelligenceSkeleton = () => (
  <div className="flex flex-col gap-8 lg:gap-12 animate-pulse p-4 lg:p-12">
    <div className="space-y-6">
       <div className="h-3 bg-slate-800 w-24 rounded-full"></div>
       <div className="h-10 bg-slate-800 w-3/4 rounded-lg"></div>
       <div className="h-64 bg-slate-800/50 w-full rounded-xl"></div>
    </div>
  </div>
);

export default function ResultsDisplay({ output, searchParams, isLoading, onQuestionClick, onAnalysisClick, onSave, onRemoveSave, isSaved, onJudgeClick }: ResultsDisplayProps): React.ReactNode {
  const dossierRef = useRef<HTMLDivElement>(null);
  const dossierId = useMemo(() => Math.random().toString(16).substring(2, 8).toUpperCase(), []);

  if (!output && !isLoading) return null;

  return (
    <div className="flex flex-col gap-6 lg:gap-10 pb-12 lg:pb-24 entry-animation">
      {isLoading && (!output || !output.summary) ? (
        <IntelligenceSkeleton />
      ) : output ? (
        <div className="flex flex-col gap-6 lg:gap-10">
          
          {/* Main Intelligence Dossier Container */}
          <div ref={dossierRef} className="flex flex-col gap-8 lg:gap-12 bg-slate-950 border border-slate-800 p-6 lg:p-16 shadow-2xl relative overflow-hidden rounded-2xl transition-colors duration-300 mx-1 lg:mx-0">
            
            {/* 1. PRINT-ONLY COVER PAGE */}
            <div className="hidden pdf-only flex flex-col min-h-[280mm] justify-between border-b-[12px] border-blue-900 pb-20 mb-20 page-break-after">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-6xl font-black italic tracking-tighter text-blue-900">DENVER_PILOT</span>
                  <div className="h-2 w-32 bg-blue-900 mt-2"></div>
                  <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.6em] mt-4">Legal Strategy Intelligence</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Dossier Auth Token</div>
                  <span className="text-md font-mono font-black px-6 py-3 bg-slate-50 border-2 border-slate-200"># {dossierId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-10 py-24">
                <span className="text-sm font-black text-blue-700 uppercase tracking-[0.8em]">Privileged & Confidential Strategic Briefing</span>
                <h1 className="text-8xl font-black uppercase tracking-tighter leading-none text-slate-900">
                  Judicial<br/>Analysis<br/>Dossier
                </h1>
                <p className="text-2xl font-light text-slate-500 max-w-2xl leading-relaxed italic border-l-[6px] border-blue-100 pl-10 mt-6">
                  Expert-level synthesis of Denver jurisdiction records, predictive adversarial modeling, and chronological procedural analysis for courtroom readiness.
                </p>
              </div>

              <div className="bg-slate-50 p-12 border-2 border-slate-100 mb-12">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 border-b pb-4">Dossier Index</h3>
                <div className="flex flex-col gap-6 text-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold">01. Executive Intelligence Summary</span>
                    <span className="font-mono text-xs">Section_Alpha</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold">02. Strategic Case Telemetry</span>
                    <span className="font-mono text-xs">Section_Beta</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold">03. Adversarial Maneuver Matrix</span>
                    <span className="font-mono text-xs">Section_Gamma</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold">04. Judicial Intel & Sources</span>
                    <span className="font-mono text-xs">Section_Delta</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-20 py-16 border-t-4 border-slate-900">
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Query Objective</span>
                  <span className="text-3xl font-bold leading-tight text-slate-900 break-words">{searchParams?.query}</span>
                </div>
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Deployment Parameters</span>
                  <div className="flex flex-col gap-3 text-sm font-mono text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>SYNC_TIMESTAMP</span>
                      <span className="font-bold">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>SECTOR</span>
                      <span className="font-bold">DENVER_2ND_DIST</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span>AUTH_LEVEL</span>
                      <span className="font-bold text-blue-700">LVL_04_CLEARANCE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em]">Attorney Work Product</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em]">Distribution Restricted</span>
              </div>
            </div>

            {/* 2. REPORT HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-8 lg:pb-12 mb-4 gap-6 page-break-avoid">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse no-print"></span>
                  <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] lg:tracking-[0.4em] section-index-label">Authenticated_Stream_Dossier</span>
                </div>
                <h2 className="text-2xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Strategic Briefing: <span className="text-blue-500/80">{dossierId}</span>
                </h2>
                <p className="text-[10px] lg:text-xs text-slate-400 font-medium tracking-wide max-w-xl">
                  Focus Objective: {searchParams?.query.substring(0, 100)}...
                </p>
              </div>
              <div className="flex items-center gap-4 no-print w-full md:w-auto justify-between md:justify-start">
                <button 
                  onClick={() => isSaved ? onRemoveSave(searchParams!) : onSave(searchParams!, output)} 
                  className={`p-3 lg:p-4 rounded-xl border transition-all active:scale-95 ${isSaved ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'}`}
                  title={isSaved ? "Remove Bookmark" : "Save Strategic Briefing"}
                >
                  {isSaved ? <BookmarkFilledIcon className="w-5 h-5 lg:w-6 lg:h-6" /> : <BookmarkIcon className="w-5 h-5 lg:w-6 lg:h-6" />}
                </button>
                <div className="text-right flex flex-col gap-0.5 font-mono text-[8px] lg:text-[9px] text-slate-600 section-index-label">
                  <span className="uppercase">Origin: NODE_0X42_DNVR</span>
                  <span className="uppercase">Sync: {new Date().toLocaleString()}</span>
                  <span className="uppercase text-blue-500/60 font-black">PRIVILEGED WORK PRODUCT</span>
                </div>
              </div>
            </div>

            {/* SECTION_01: Executive Intelligence Summary */}
            <div className="relative">
              <div className="absolute -left-12 top-0 text-[10px] font-black text-blue-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                SECTION_01_SUMMARY
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="prose prose-invert prose-lg lg:prose-2xl max-w-none text-slate-200 leading-relaxed font-light
                  prose-h1:text-2xl lg:prose-h1:text-4xl prose-h1:font-black prose-h1:italic prose-h1:mb-6 lg:prose-h1:mb-10 prose-h1:tracking-tighter prose-h1:text-white prose-h1:border-b prose-h1:border-slate-800 prose-h1:pb-4
                  prose-h2:text-[10px] lg:prose-h2:text-[12px] prose-h2:text-blue-400/80 prose-h2:uppercase prose-h2:tracking-[0.4em] lg:prose-h2:tracking-[0.6em] prose-h2:border-b prose-h2:border-slate-800/50 prose-h2:pb-3 lg:prose-h2:pb-4 prose-h2:mt-10 lg:prose-h2:mt-16 prose-h2:font-black
                  prose-p:mb-6 lg:prose-p:mb-8 prose-p:text-base lg:prose-p:text-xl prose-p:font-light prose-p:leading-relaxed
                  prose-strong:text-white prose-strong:font-black prose-strong:italic
                  prose-li:text-slate-300 prose-li:mb-4 lg:prose-li:mb-5 prose-li:text-sm lg:prose-li:text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.summary}</ReactMarkdown>
                  {output.isSummaryStreaming && <span className="inline-block w-2 h-4 lg:h-6 bg-blue-500 animate-pulse align-middle ml-2 no-print"></span>}
                </div>
              </div>
            </div>

            {/* SECTION_02: Strategic Case Telemetry */}
            <div className="relative mt-4 lg:mt-12 page-break-avoid">
              <div className="absolute -left-12 top-0 text-[10px] font-black text-indigo-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                SECTION_02_TELEMETRY
              </div>
              <StrategicTelemetryWidget telemetry={output.telemetry} isLoading={output.isTelemetryLoading} />
            </div>

            {/* SECTION_03: Adversarial Maneuver Matrix */}
            <div className="relative mt-4 lg:mt-12 page-break-avoid">
              <div className="absolute -left-12 top-0 text-[10px] font-black text-red-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                SECTION_03_ADVERSARIAL
              </div>
              <AdversarialStrategyWidget strategy={output.adversarialStrategy} isLoading={output.isAdversarialLoading} />
            </div>

            {/* SECTION_04: Personnel & Sources */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10 mt-4 lg:mt-12">
              {output.identifiedJudges && output.identifiedJudges.length > 0 && (
                <div className="relative page-break-avoid">
                   <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                    SECTION_04A_JUDICIAL
                  </div>
                  <IdentifiedJudges judges={output.identifiedJudges} isLoading={output.isIdentifiedJudgesLoading} onJudgeClick={onJudgeClick} />
                </div>
              )}
              
              <div className="bg-slate-900/40 border border-slate-800 p-6 lg:p-10 rounded-xl relative group page-break-avoid">
                <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                  SECTION_04B_SOURCES
                </div>
                <div className="flex items-center gap-4 mb-6 lg:mb-8 border-b border-slate-800 pb-4 lg:pb-5">
                  <GlobeIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500/60" />
                  <h4 className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest section-index-label">Source_Dossier_Nodes</h4>
                </div>
                <div className="flex flex-col gap-3">
                  {output.sources.slice(0, 8).map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-between p-3 lg:p-4 bg-slate-950/50 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/30 transition-all group/src"
                    >
                      <div className="flex items-center gap-3 lg:gap-4 truncate">
                        <span className="text-[8px] lg:text-[9px] font-mono text-slate-600 section-index-label">REF_{i}</span>
                        <span className="truncate text-xs lg:text-sm font-semibold text-slate-400 group-hover/src:text-white transition-colors">{s.title}</span>
                      </div>
                      <span className="text-[8px] font-black text-blue-500 opacity-0 group-hover/src:opacity-100 transition-all uppercase tracking-tighter no-print">Open</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION_05: Temporal Evidence Mapping */}
            {output.timelineEvents && output.timelineEvents.length > 0 && (
              <div className="relative mt-4 lg:mt-12">
                <div className="absolute -left-12 top-0 text-[10px] font-black text-slate-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                  SECTION_05_CHRONOLOGY
                </div>
                <div className="border-t border-slate-800 pt-8 lg:pt-16">
                  <TimelineChart events={output.timelineEvents} isLoading={output.isTimelineLoading} />
                </div>
              </div>
            )}

            {/* SECTION_06: Strategic Next Steps */}
            <div className="relative mt-4 lg:mt-12 no-print">
               <div className="absolute -left-12 top-0 text-[10px] font-black text-blue-500/20 rotate-180 [writing-mode:vertical-lr] hidden md:block section-index-label">
                SECTION_06_STRATEGY
              </div>
              <div className="border-t border-slate-800 pt-8 lg:pt-12">
                <FollowUpQuestions questions={output.followUpQuestions || []} onQuestionClick={onQuestionClick} />
              </div>
            </div>
            
            {/* Dossier Terminal Footer */}
            <div className="mt-12 lg:mt-20 pt-8 lg:pt-12 border-t border-slate-800/50 text-center flex flex-col gap-3 page-break-avoid">
              <span className="text-[8px] lg:text-[9px] font-black text-slate-700 uppercase tracking-[0.8em] lg:tracking-[1.4em] section-index-label">EOT // TRANSMISSION_SECURE</span>
              <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8 opacity-20 section-index-label">
                <span className="text-[7px] lg:text-[8px] font-mono uppercase">System: DNVR_PILOT_v4.2</span>
                <span className="text-[7px] lg:text-[8px] font-mono uppercase">Key: {dossierId}_RSA</span>
              </div>
            </div>
          </div>
          
          {/* Secondary Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 no-print mx-1 lg:mx-0">
            <RelatedQueries queries={output.relatedQueries || []} onQueryClick={onQuestionClick} />
            <div className="bg-slate-900/40 p-6 lg:p-10 rounded-2xl border border-slate-800/60 flex flex-col justify-center items-center text-center gap-4 lg:gap-6">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-emerald-500 rounded-full animate-pulse"></div>
               </div>
               <div className="space-y-1 lg:space-y-2">
                 <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] lg:tracking-[0.5em]">System Status</span>
                 <p className="text-[10px] lg:text-xs text-slate-400 italic max-w-sm leading-relaxed px-4">Analysis complete. Cross-verify with local rules.</p>
               </div>
            </div>
          </div>

        </div>
      ) : null}
      
      <style>{`
        .prose blockquote { border-left: 3px lg:border-left: 5px solid #3b82f6; background: rgba(59, 130, 246, 0.04); padding: 1rem lg:padding: 1.5rem 2rem; font-style: italic; color: #94a3b8; border-radius: 0 0.5rem 0.5rem 0; }
        .prose strong { color: #fff; font-weight: 800; font-style: normal; }
        .prose h1, .prose h2 { font-family: 'Inter', sans-serif; }
        
        .page-break-avoid { page-break-inside: avoid; break-inside: avoid; }
        .page-break-after { page-break-after: always; break-after: always; }
        
        @media screen {
          .pdf-only { display: none; }
        }
        
        .pdf-export-mode .pdf-only {
          display: flex !important;
        }

        .pdf-export-mode .no-print {
          display: none !important;
        }
      `}</style>
    </div>
  );
}