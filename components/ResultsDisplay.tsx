import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type SearchResult, type SearchParams } from '../types';
import FollowUpQuestions from './FollowUpQuestions';
import BookmarkIcon from './icons/BookmarkIcon';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';
import DownloadIcon from './icons/DownloadIcon';
import RelatedQueries from './RelatedQueries';
import GlobeIcon from './icons/GlobeIcon';
import TimelineChart from './TimelineChart';
import IdentifiedJudges from './IdentifiedJudges';
import AdversarialStrategyWidget from './AdversarialStrategyWidget';
import SpinnerIcon from './icons/SpinnerIcon';

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
  <div className="flex flex-col gap-16 animate-pulse p-12">
    <div className="space-y-6">
       <div className="h-4 bg-white/5 w-24"></div>
       <div className="h-16 bg-white/5 w-3/4"></div>
       <div className="h-40 bg-white/5 w-full"></div>
    </div>
  </div>
);

export default function ResultsDisplay({ output, searchParams, isLoading, onQuestionClick, onAnalysisClick, onSave, onRemoveSave, isSaved, onJudgeClick }: ResultsDisplayProps): React.ReactNode {
  const dossierRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const dossierId = useMemo(() => Math.random().toString(16).substring(2, 8).toUpperCase(), []);

  const handleExportPDF = async () => {
    if (!dossierRef.current || !output) return;
    setIsExporting(true);
    const element = dossierRef.current;
    const opt = {
      margin: 10,
      filename: `DENVER_INTEL_REPORT_${dossierId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, backgroundColor: '#050505' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsExporting(false);
    }
  };

  if (!output && !isLoading) return null;

  return (
    <div className="flex flex-col gap-12 pb-24 entry-animation">
      {isLoading && (!output || !output.summary) ? (
        <IntelligenceSkeleton />
      ) : output ? (
        <div className="flex flex-col gap-12">
          {/* Dossier Container */}
          <div ref={dossierRef} className="flex flex-col gap-12 bg-black border border-white/5 p-12 shadow-2xl relative overflow-hidden">
            
            {/* Dossier Metadata Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-10 mb-6">
              <div className="flex flex-col gap-2">
                <span className="etched-label text-white/60">Intelligence_Dossier_Stream</span>
                <span className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Sector_Analysis: <span className="text-white/40">{searchParams?.query.substring(0, 30)}...</span>
                </span>
              </div>
              <div className="text-right flex flex-col gap-1">
                <span className="etched-label text-white/40">NODE: {dossierId}</span>
                <span className="etched-label text-white/40">TIMESTAMP: {new Date().toISOString()}</span>
              </div>
            </div>

            {/* INTEL_01: Operational Briefing */}
            <div className="relative group">
              <span className="section-index">INTEL_01</span>
              <div className="max-w-5xl">
                <div className="prose prose-invert prose-2xl max-w-none text-white leading-relaxed font-light
                  prose-h1:text-5xl prose-h1:font-black prose-h1:italic prose-h1:mb-12 prose-h1:tracking-tighter
                  prose-h2:text-[10px] prose-h2:text-white/40 prose-h2:uppercase prose-h2:tracking-[0.8em] prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-6 prose-h2:mt-20 prose-h2:font-black
                  prose-p:mb-8 prose-p:text-2xl prose-p:font-light prose-p:leading-normal
                  prose-strong:text-white prose-strong:font-black prose-strong:italic
                  prose-li:text-white/80 prose-li:mb-4 prose-li:text-xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.summary}</ReactMarkdown>
                  {output.isSummaryStreaming && <span className="inline-block w-2 h-8 bg-white animate-pulse align-middle ml-2"></span>}
                </div>
              </div>
            </div>

            {/* INTEL_02: Adversarial Mapping */}
            <div className="relative mt-12">
              <span className="section-index">INTEL_02</span>
              <AdversarialStrategyWidget strategy={output.adversarialStrategy} isLoading={output.isAdversarialLoading} />
            </div>

            {/* INTEL_03: Bench Analysis & Sources */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mt-12">
              {output.identifiedJudges && output.identifiedJudges.length > 0 && (
                <div className="relative">
                  <span className="section-index">INTEL_03A</span>
                  <IdentifiedJudges judges={output.identifiedJudges} isLoading={output.isIdentifiedJudgesLoading} onJudgeClick={onJudgeClick} />
                </div>
              )}
              
              <div className="bg-white/5 border border-white/10 p-12 relative">
                <span className="section-index">INTEL_03B</span>
                <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                  <GlobeIcon className="w-5 h-5 text-white/20" />
                  <h4 className="etched-label">Source_Nexus_Logs</h4>
                </div>
                <div className="flex flex-col gap-4">
                  {output.sources.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 hover:border-white/20 transition-all group">
                      <div className="flex items-center gap-6 truncate">
                        <span className="text-white/10 font-mono text-[9px]">0{i}</span>
                        <span className="truncate text-base font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-widest italic">{s.title}</span>
                      </div>
                      <a href={s.uri} target="_blank" rel="noreferrer" className="etched-label text-[8px] opacity-10 group-hover:opacity-100 transition-opacity">Launch_Link</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* INTEL_04: Temporal Vector */}
            {output.timelineEvents && output.timelineEvents.length > 0 && (
              <div className="relative mt-12">
                <span className="section-index">INTEL_04</span>
                <div className="border-t border-white/10 pt-16">
                  <TimelineChart events={output.timelineEvents} isLoading={output.isTimelineLoading} />
                </div>
              </div>
            )}
            
            {/* Dossier Footer Branding */}
            <div className="mt-20 pt-10 border-t border-white/10 text-center flex flex-col gap-2">
              <span className="etched-label text-white/10 tracking-[1.5em] font-black">End_Of_Intelligence_Transmission</span>
              <span className="text-white/5 text-[7px] uppercase font-mono">Precision_Engine_v4 // Denver_DCO_Intel_Sector</span>
            </div>
          </div>

          {/* Dossier Controls - Outside the print container */}
          <div className="flex justify-between items-center bg-white/5 p-6 border border-white/10">
            <div className="flex gap-4">
              <FollowUpQuestions questions={output.followUpQuestions || []} onQuestionClick={onQuestionClick} />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-4 px-8 py-4 bg-white text-black font-black hover:bg-[#efefef] transition-all disabled:opacity-50"
              >
                {isExporting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <DownloadIcon className="w-5 h-5" />}
                <span className="etched-label text-black">Export_Dossier</span>
              </button>
              <button 
                onClick={() => isSaved ? onRemoveSave(searchParams!) : onSave(searchParams!, output)} 
                className={`p-4 border transition-all ${isSaved ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                {isSaved ? <BookmarkFilledIcon className="w-6 h-6" /> : <BookmarkIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      
      <style>{`
        .prose blockquote { border-left-color: white; border-left-width: 4px; font-style: italic; color: rgba(255,255,255,0.7); padding-left: 2rem; }
        .prose a { color: white; text-decoration: underline; text-underline-offset: 4px; font-weight: 800; }
        .prose a:hover { text-decoration-thickness: 2px; }
      `}</style>
    </div>
  );
}