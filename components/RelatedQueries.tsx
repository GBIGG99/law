import React from 'react';
import LinkIcon from './icons/LinkIcon';

interface RelatedQueriesProps {
  queries: string[];
  onQueryClick: (query: string) => void;
}

export default function RelatedQueries({ queries, onQueryClick }: RelatedQueriesProps): React.ReactNode {
    if (!queries || queries.length === 0) {
    return null;
  }

  return (
    <div className="pt-10 mt-10 border-t border-[#6e501a]/20">
      <h4 className="text-[10px] font-black text-[#6e501a] uppercase tracking-[0.4em] mb-6">
        Semantic Associations
      </h4>
      <div className="flex flex-col gap-3">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQueryClick(query)}
            className="flex items-center text-left p-5 bg-[#0d0d0d] border border-[#6e501a]/20 text-[#a0a0a0] text-xs font-bold hover:bg-[#b5892f]/5 hover:border-[#b5892f] hover:text-[#efefef] transition-all group"
          >
            <div className="p-2 bg-[#050505] border border-[#6e501a]/40 mr-4 group-hover:border-[#b5892f] transition-colors">
              <LinkIcon className="w-4 h-4 text-[#6e501a] group-hover:text-[#b5892f]" />
            </div>
            <span className="flex-grow italic leading-tight">{query}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6e501a] ml-4 opacity-0 group-hover:opacity-100 transition-opacity">Branch Path</span>
          </button>
        ))}
      </div>
    </div>
  );
}
