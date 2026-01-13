import React from 'react';
import GavelIcon from './icons/GavelIcon'; 
import SparklesIcon from './icons/SparklesIcon'; 
import BrainCircuitIcon from './icons/BrainCircuitIcon';

interface IntelligentAnalysisProps {
  onAnalysisClick: (prompt: string) => void;
}

const ANALYSIS_PROMPTS = [
    { id: 'tendencies', text: 'Judge Tendencies', icon: GavelIcon },
    { id: 'loopholes', text: 'Procedural Loops', icon: SparklesIcon },
    { id: 'strategy', text: 'Legal Strategy', icon: BrainCircuitIcon },
];

export default function IntelligentAnalysis({ onAnalysisClick }: IntelligentAnalysisProps): React.ReactNode {
  return (
    <div className="pt-12 mt-12 border-t border-[#5e5239]/20">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-px flex-grow bg-gradient-to-r from-transparent to-[#5e5239]/40"></div>
        <h4 className="text-[10px] font-black text-[#5e5239] uppercase tracking-[0.4em] whitespace-nowrap">
          Neural Deep Dives
        </h4>
        <div className="h-px flex-grow bg-gradient-to-l from-transparent to-[#5e5239]/40"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {ANALYSIS_PROMPTS.map((prompt) => {
          const Icon = prompt.icon;
          return (
            <button
              key={prompt.id}
              onClick={() => onAnalysisClick(prompt.text)}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-[#0d0d0d] border border-[#5e5239]/30 hover:border-[#a18d66] hover:bg-[#a18d66]/5 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Animated Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 w-px h-full bg-[#a18d66]"></div>
                <div className="absolute top-0 right-0 w-full h-px bg-[#a18d66]"></div>
              </div>

              <div className="p-4 bg-[#050505] border border-[#5e5239]/40 group-hover:border-[#a18d66] group-hover:bg-[#1a1a1a] transition-all duration-300 text-[#a18d66]">
                <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-black text-[#999999] group-hover:text-[#d1c19d] uppercase tracking-[0.2em] transition-colors text-center">
                {prompt.text}
              </span>
            </button>
          );
        })}
      </div>
      
      <p className="mt-8 text-[9px] text-center text-[#5e5239] font-black uppercase tracking-[0.3em] opacity-40">
        AI-driven strategic deep-dives • Powered by Gemini 3 Pro Reasoning
      </p>
    </div>
  );
}