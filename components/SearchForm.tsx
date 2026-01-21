
import React, { useRef, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import { type SearchParams, DateRange } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import HistoryIcon from './icons/HistoryIcon';
import DocumentIcon from './icons/DocumentIcon';
import { MAX_QUERY_LENGTH, LEGAL_SUGGESTIONS } from '../constants';

interface SearchFormProps {
  params: SearchParams;
  setParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  isLoading: boolean;
  onClear: () => void;
  onSelectHistory: (params: SearchParams) => void;
  onSave: () => void;
  onImportPDF: () => void;
  canSave: boolean;
}

export default function SearchForm({ 
  params, 
  setParams, 
  onSearch, 
  isLoading, 
  onClear,
  onSelectHistory,
  onSave,
  onImportPDF,
  canSave
}: SearchFormProps): React.ReactNode {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const isOverLimit = params.query.length > MAX_QUERY_LENGTH;

  const filteredSuggestions = useMemo(() => {
    const query = params.query.trim();
    if (!query) return LEGAL_SUGGESTIONS.slice(0, 3); // Show top suggestions when empty
    
    const words = params.query.split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase() || '';
    
    if (lastWord.length < 2) return [];
    
    return LEGAL_SUGGESTIONS.filter(s => 
      s.toLowerCase().includes(lastWord) && 
      !params.query.toLowerCase().includes(s.toLowerCase()) // Don't suggest what's already there
    ).slice(0, 5);
  }, [params.query]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [params.query]);

  useEffect(() => {
    if (isConfirmingClear) {
      const timer = setTimeout(() => setIsConfirmingClear(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingClear]);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    const words = params.query.split(/\s+/);
    words.pop(); // remove last typed partial
    const newQuery = [...words, suggestion].join(' ').trim() + ' ';
    setParams({ ...params, query: newQuery });
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(filteredSuggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        onSearch();
    }
  };

  const handleClearClick = () => {
    if (isConfirmingClear) {
      onClear();
      setIsConfirmingClear(false);
    } else {
      setIsConfirmingClear(true);
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-950/40 backdrop-blur-xl relative">
      {/* Precision Status Bar */}
      <div className="flex justify-between items-center px-4 lg:px-8 py-3 border-b border-white/5 bg-slate-900/40">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="relative flex items-center justify-center">
            <div className={`absolute w-3 h-3 rounded-full opacity-20 ${isLoading ? 'bg-blue-400 animate-ping' : isOverLimit ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <div className={`w-1.5 h-1.5 rounded-full z-10 ${isLoading ? 'bg-blue-400 animate-pulse' : isOverLimit ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
          </div>
          <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] lg:tracking-[0.3em]">
            {isOverLimit ? 'Buffer Overflow' : isLoading ? 'Processing...' : 'System Ready'}
          </span>
        </div>
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="flex flex-col items-end">
            <span className={`text-[8px] lg:text-[9px] font-mono tracking-tighter ${isOverLimit ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
              {params.query.length.toLocaleString()} / {MAX_QUERY_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-10 space-y-6 lg:space-y-10">
        {/* Primary Tactical Objective Input */}
        <div className="space-y-3 lg:space-y-4 relative">
          <div className="flex justify-between items-end px-1">
            <div className="space-y-1">
              <label className="text-[9px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Primary Objective</label>
              <h3 className="text-[10px] lg:text-xs font-bold text-slate-300">Case Analysis & Query</h3>
            </div>
          </div>
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={params.query}
              onChange={(e) => {
                setParams({...params, query: e.target.value});
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Inject tactical parameters..."
              className={`w-full bg-slate-950/80 border transition-all duration-300 rounded-xl p-5 lg:p-8 text-lg lg:text-2xl text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 resize-none shadow-2xl leading-relaxed font-light ${
                isOverLimit 
                  ? 'border-red-500/50 focus:ring-red-500/10' 
                  : 'border-white/5 focus:border-blue-500/40 focus:ring-blue-500/5 group-hover:border-white/10'
              }`}
              disabled={isLoading}
            />
            
            {/* Contextual Intelligence Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-[60] bg-slate-900/95 border border-blue-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-xl overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-950/50 px-4 py-2 border-b border-white/5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Legal_Auto_Complete_Node</span>
                </div>
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full text-left px-5 lg:px-8 py-3 lg:py-4 text-xs lg:text-sm transition-all flex items-center justify-between border-b border-white/5 last:border-none ${
                      activeIndex === i 
                      ? 'bg-blue-600 text-white pl-7 lg:pl-10' 
                      : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-1 rounded-full ${activeIndex === i ? 'bg-white animate-pulse' : 'bg-blue-500/50'}`}></div>
                      <span className="font-medium truncate">{s}</span>
                    </div>
                    {activeIndex === i && <span className="text-[8px] font-black opacity-60 uppercase tracking-tighter">Enter to Inject</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tactical Parameters Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="space-y-1 group/param">
              <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Entity</label>
              <input 
                type="text" 
                placeholder="Name or Case ID" 
                value={params.partyName || ''} 
                onChange={(e) => setParams({...params, partyName: e.target.value})} 
                className="w-full bg-slate-900/60 border border-white/5 rounded-lg p-3 lg:p-4 text-xs lg:text-sm text-slate-200 focus:border-blue-500/40 transition-all outline-none"
              />
            </div>

            <div className="space-y-1 group/param">
              <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Temporal Scope</label>
              <select 
                value={params.dateRange} 
                onChange={(e) => setParams({...params, dateRange: e.target.value as DateRange})} 
                className="w-full bg-slate-900/60 border border-white/5 rounded-lg p-3 lg:p-4 text-xs lg:text-sm text-slate-200 focus:border-blue-500/40 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value={DateRange.ANY}>Universal</option>
                <option value={DateRange.DAY}>Critical (24h)</option>
                <option value={DateRange.WEEK}>Recent (7d)</option>
                <option value={DateRange.MONTH}>Current Cycle</option>
                <option value={DateRange.YEAR}>Annual Block</option>
              </select>
            </div>

            <div className="space-y-1 group/param">
              <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Legal Schema</label>
              <select 
                value={params.caseType} 
                onChange={(e) => setParams({...params, caseType: e.target.value as any})} 
                className="w-full bg-slate-900/60 border border-white/5 rounded-lg p-3 lg:p-4 text-xs lg:text-sm text-slate-200 focus:border-blue-500/40 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="all">Unrestricted</option>
                <option value="civil">Civil</option>
                <option value="criminal">Criminal</option>
                <option value="family">Family</option>
                <option value="probate">Probate</option>
              </select>
            </div>

            <div className="space-y-1 group/param">
              <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Jurisdiction</label>
              <select 
                value={params.jurisdiction} 
                onChange={(e) => setParams({...params, jurisdiction: e.target.value as any})} 
                className="w-full bg-slate-900/60 border border-white/5 rounded-lg p-3 lg:p-4 text-xs lg:text-sm text-slate-200 focus:border-blue-500/40 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="all">Unified Node</option>
                <option value="denver_district">District Court</option>
                <option value="denver_county">County Court</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mission Deployment Actions */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-2 lg:pt-6">
          <button 
            onClick={onSearch}
            disabled={isLoading || !params.query.trim() || isOverLimit}
            className="flex-[4] relative group overflow-hidden bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-4 lg:py-6 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 border-t border-white/20"
          >
            {isLoading ? (
              <SpinnerIcon className="w-5 h-5 animate-spin" />
            ) : (
              <span className="uppercase tracking-[0.2em] lg:tracking-[0.4em] text-[11px] lg:text-xs">Begin Synthesis</span>
            )}
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={onImportPDF}
              className="flex-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 py-4 lg:py-6 px-4 rounded-xl border border-white/5 flex items-center justify-center gap-2"
            >
              <DocumentIcon className="w-4 h-4 text-slate-500" />
              <span className="text-[9px] uppercase tracking-widest font-black">Audit</span>
            </button>

            <button 
              onClick={handleClearClick} 
              className={`flex-1 font-bold py-4 lg:py-6 px-4 rounded-xl border transition-all text-[10px] uppercase tracking-widest ${
                isConfirmingClear ? 'bg-red-600 text-white' : 'bg-slate-900/80 text-slate-500'
              }`}
            >
              {isConfirmingClear ? 'Confirm' : 'Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
