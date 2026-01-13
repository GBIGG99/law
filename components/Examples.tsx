
import React from 'react';
import { type SearchParams } from '../types';
import { EXAMPLES } from '../constants';
import DocumentIcon from './icons/DocumentIcon';

interface ExamplesProps {
  onSelectExample: (example: SearchParams) => void;
}

export default function Examples({ onSelectExample }: ExamplesProps): React.ReactNode {
  return (
    <div className="relative">
      <h3 className="text-[10px] font-black text-[#6e501a] uppercase tracking-[0.4em] mb-4 flex items-center gap-4">
        Tactical Templates
        <span className="h-px flex-grow bg-[#6e501a]/20"></span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXAMPLES.map((ex, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(ex)}
            className="group flex items-center p-3 bg-[#1a1a1a]/40 border border-[#6e501a]/30 text-left hover:border-[#b5892f] hover:bg-[#b5892f]/5 transition-all"
          >
            <div className="p-2 bg-[#0d0d0d] rounded border border-[#6e501a]/20 mr-4 group-hover:border-[#b5892f]/50 transition-colors">
                <DocumentIcon className="w-4 h-4 text-[#6e501a] group-hover:text-[#e2c07d]" />
            </div>
            <span className="text-xs font-bold text-[#a0a0a0] group-hover:text-[#efefef] transition-colors truncate">
                {ex.query}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
