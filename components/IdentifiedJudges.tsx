import React from 'react';
import { JudgeSummary } from '../types';
import GavelIcon from './icons/GavelIcon';

interface IdentifiedJudgesProps {
  judges: JudgeSummary[];
  isLoading: boolean;
  onJudgeClick: (judgeName: string) => void;
}

export default function IdentifiedJudges({ judges, isLoading, onJudgeClick }: IdentifiedJudgesProps): React.ReactNode {
  if (isLoading) return null;
  if (!judges || judges.length === 0) return null;

  return (
    <div className="glass-card p-16">
      <h4 className="etched-label mb-12 flex items-center gap-5 border-b border-white/5 pb-6 opacity-30">
        <GavelIcon className="w-5 h-5 opacity-40" />
        Judicial Intel Nodes
      </h4>
      <div className="grid grid-cols-1 gap-4">
        {judges.map((judge, index) => (
          <button
            key={index}
            onClick={() => onJudgeClick(judge.name)}
            className="group flex items-center justify-between px-10 py-6 bg-white/[0.02] border border-white/10 text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-2xl italic"
          >
            <span className="flex items-center gap-6">
               <span className="etched-label text-[8px] opacity-20 group-hover:opacity-100 transition-opacity font-black">NODE_0x{index}</span>
               {judge.name}
            </span>
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">>></span>
          </button>
        ))}
      </div>
    </div>
  );
}