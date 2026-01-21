import React from 'react';
import { type AdversarialStrategy } from '../types';
import AlertIcon from './icons/AlertIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';

interface AdversarialStrategyWidgetProps {
  strategy?: AdversarialStrategy;
  isLoading?: boolean;
}

export default function AdversarialStrategyWidget({ strategy, isLoading }: AdversarialStrategyWidgetProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="bg-slate-900/50 p-20 flex flex-col items-center justify-center gap-6 border border-slate-800 rounded-2xl">
        <SpinnerIcon className="w-10 h-10 animate-spin text-blue-500/40" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Running_Neural_Simulation...</span>
      </div>
    );
  }

  if (!strategy || (!strategy.prosecutorMoves.length && !strategy.defenseCounters.length)) return null;

  return (
    <div className="bg-slate-950 border border-slate-800 p-8 md:p-12 rounded-2xl relative shadow-2xl overflow-hidden page-break-avoid">
      {/* Background Glow - NO PRINT */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none no-print"></div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8 border-b border-slate-800 pb-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20 timeline-node">
            <BrainCircuitIcon className="w-8 h-8 text-white no-print" />
            <span className="hidden pdf-only text-xs font-black">STRATEGY</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Strategic_Matrix</h3>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 block section-index-label">Adversarial Decision Modeling</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-3 text-red-400 font-black text-[10px] tracking-widest uppercase rounded-lg adversarial-move">
          <AlertIcon className="w-4 h-4 no-print" /> Operational Threat: Significant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
        {/* Center Divider for Desktop */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden lg:block no-print"></div>

        {/* Aggressor Logic (Prosecution) */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-l-4 border-red-500 pl-6">
            <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest section-index-label">Opponent_Maneuvers (Aggressive)</h4>
          </div>
          <ul className="space-y-6">
            {strategy.prosecutorMoves.map((move, i) => (
              <li key={i} className="flex gap-4 group adversarial-move p-2 rounded">
                <span className="text-red-500/30 font-mono text-xs font-black mt-1 section-index-label">0{i+1}</span>
                <p className="text-lg text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">
                  {move}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Tactical Counters (Defense) */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-6">
            <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest section-index-label">Defense_Protocols (Reactive)</h4>
          </div>
          <ul className="space-y-6">
            {strategy.defenseCounters.map((counter, i) => (
              <li key={i} className="flex gap-4 group bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all defense-counter">
                <span className="text-blue-500/30 font-mono text-xs font-black mt-1 section-index-label">0{i+1}</span>
                <p className="text-lg text-white leading-relaxed font-bold italic tracking-tight">
                  {counter}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Anomalies */}
      <div className="mt-16 p-8 bg-slate-900/40 rounded-xl border border-slate-800 border-dashed page-break-avoid">
        <div className="flex items-center gap-4 mb-6">
            <span className="h-px flex-grow bg-slate-800 no-print"></span>
            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] section-index-label">Predicted_System_Risks</h4>
            <span className="h-px flex-grow bg-slate-800 no-print"></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {strategy.hiddenRisks.map((risk, i) => (
            <div key={i} className="flex gap-4 group">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-red-500/50 mt-2 transition-colors adversarial-move"></div>
               <p className="text-[11px] text-slate-500 font-medium italic group-hover:text-slate-300 transition-colors section-index-label">{risk}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}