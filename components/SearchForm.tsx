import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { SearchType, type SearchParams, DateRange } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import HistoryIcon from './icons/HistoryIcon';
import { MAX_QUERY_LENGTH } from '../constants';

interface SearchFormProps {
  params: SearchParams;
  setParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  isLoading: boolean;
  onClear: () => void;
  onSelectHistory: (p: SearchParams) => void;
  onSave: () => void;
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
  canSave
}: SearchFormProps): React.ReactNode {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [params.query]);

  return (
    <div className="flex flex-col gap-0">
      {/* Tactical Input Header */}
      <div className="flex justify-between items-center px-12 py-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-6">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-white animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
          <span className="etched-label tracking-[0.6em]">Neural_Input_Active</span>
        </div>
        <div className="flex gap-10">
          <span className="etched-label opacity-20">Payload: {params.query.length} / {MAX_QUERY_LENGTH}</span>
          <span className="etched-label opacity-20">Logic: Gemini_v3_Flash</span>
        </div>
      </div>

      <div className="p-12 space-y-12">
        {/* Main Query Field */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={params.query}
            onChange={(e) => setParams({...params, query: e.target.value})}
            placeholder="INPUT_MISSION_OBJECTIVE..."
            className="w-full bg-transparent border-none p-0 font-mono text-white text-5xl font-light focus:outline-none placeholder:text-white/5 resize-none tracking-tighter italic leading-tight"
            disabled={isLoading}
          />
          <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>

        {/* Dynamic Parameter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <label className="etched-label">Target_Entity</label>
            <input 
              type="text" 
              placeholder="NAME / CASE_ID" 
              value={params.partyName || ''} 
              onChange={(e) => setParams({...params, partyName: e.target.value})} 
              className="bg-white/5 border border-white/10 text-white text-xs p-5 outline-none focus:border-white/30 placeholder:text-white/10 uppercase tracking-widest font-black" 
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="etched-label">Temporal_Window</label>
            <select 
              value={params.dateRange} 
              onChange={(e) => setParams({...params, dateRange: e.target.value as DateRange})} 
              className="bg-white/5 border border-white/10 text-white text-xs p-5 outline-none focus:border-white/30 appearance-none cursor-pointer uppercase tracking-widest font-black"
            >
              <option value={DateRange.ANY}>Unrestricted</option>
              <option value={DateRange.DAY}>Past_24h</option>
              <option value={DateRange.WEEK}>Past_7d</option>
              <option value={DateRange.MONTH}>Past_30d</option>
              <option value={DateRange.YEAR}>Past_365d</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="etched-label">Schema_Type</label>
            <select 
              value={params.caseType} 
              onChange={(e) => setParams({...params, caseType: e.target.value as any})} 
              className="bg-white/5 border border-white/10 text-white text-xs p-5 outline-none focus:border-white/30 appearance-none cursor-pointer uppercase tracking-widest font-black"
            >
              <option value="all">All_Objects</option>
              <option value="civil">Civil_Schema</option>
              <option value="criminal">Criminal_Schema</option>
              <option value="family">Family_Schema</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="etched-label">Operational_Sector</label>
            <select 
              value={params.jurisdiction} 
              onChange={(e) => setParams({...params, jurisdiction: e.target.value as any})} 
              className="bg-white/5 border border-white/10 text-white text-xs p-5 outline-none focus:border-white/30 appearance-none cursor-pointer uppercase tracking-widest font-black"
            >
              <option value="all">Global_Denver</option>
              <option value="denver_district">District_Court</option>
              <option value="denver_county">County_Court</option>
            </select>
          </div>
        </div>

        {/* Command Actions */}
        <div className="flex flex-col md:flex-row items-stretch gap-6 pt-6">
          <button 
            onClick={onSearch}
            disabled={isLoading || !params.query.trim()}
            className="flex-grow group px-12 py-8 bg-white text-black font-black uppercase italic tracking-tighter text-4xl hover:bg-[#efefef] transition-all flex items-center justify-center gap-8 shadow-2xl overflow-hidden relative"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-8 h-8 animate-spin text-black" />
                <span className="animate-pulse">Synthesizing_Intelligence...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">[Execute_Scan]</span>
                <div className="absolute inset-0 bg-white/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              </>
            )}
          </button>

          <div className="flex gap-4">
            <button 
              onClick={onClear} 
              className="px-10 py-8 border border-white/10 text-white/40 etched-label hover:text-white hover:bg-white/5 transition-all"
            >
              Clear_Input
            </button>
            <button 
              onClick={() => {}} 
              className="px-10 py-8 border border-white/10 text-white/40 etched-label hover:text-white hover:bg-white/5 transition-all"
            >
              <HistoryIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}