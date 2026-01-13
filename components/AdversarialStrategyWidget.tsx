import React from 'react';
import { type AdversarialStrategy } from '../types';
import GavelIcon from './icons/GavelIcon';
import AlertIcon from './icons/AlertIcon';
import SparklesIcon from './icons/SparklesIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';

interface AdversarialStrategyWidgetProps {
  strategy?: AdversarialStrategy;
  isLoading?: boolean;
}

export default function AdversarialStrategyWidget({ strategy, isLoading }: AdversarialStrategyWidgetProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="bg-white/5 p-24 flex flex-col items-center justify-center gap-10 border border-white/10">
        <SpinnerIcon className="w-12 h-12 animate-spin text-white/20" />
        <span className="etched-label animate-pulse">Running_Strategic_Simulation...</span>
      </div>
    );
  }

  if (!strategy || (!strategy.prosecutorMoves.length && !strategy.defenseCounters.length)) return null;

  return (
    <div className="bg-black/40 border border-white/5 p-12 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-12 border-b border-white/5 pb-12">
        <div className="flex items-center gap-10">
          <div className="p-10 bg-white text-black">
            <BrainCircuitIcon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Strategic_Matrix</h3>
            <span className="etched-label mt-2 opacity-40">Adversarial_Threat_Analysis</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-red-950/20 border border-red-900/40 px-8 py-4 text-red-500 font-black text-xs tracking-widest uppercase">
          <AlertIcon className="w-4 h-4" /> Threat_Level: Critical
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Prosecution Logic */}
        <div className="space-y-12">
          <div className="flex items-center gap-4 border-l-4 border-red-600 pl-6">
            <h4 className="etched-label text-red-500">Aggressor_Vector (Prosecution)</h4>
          </div>
          <ul className="space-y-8">
            {strategy.prosecutorMoves.map((move, i) => (
              <li key={i} className="text-xl text-white/80 pl-6 border-l border-white/10 py-2 leading-relaxed font-bold italic group hover:border-red-600 transition-all">
                <span className="text-[7px] font-mono opacity-20 block mb-2">THREAD_0{i}</span> {move}
              </li>
            ))}
          </ul>
        </div>

        {/* Defense Logic */}
        <div className="space-y-12">
          <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
            <h4 className="etched-label text-blue-500">Counter_Protocol (Defense)</h4>
          </div>
          <ul className="space-y-8">
            {strategy.defenseCounters.map((counter, i) => (
              <li key={i} className="text-xl text-white pl-6 border-l border-white/20 py-2 leading-relaxed font-black uppercase italic tracking-tight group hover:bg-blue-600/5 transition-all">
                <span className="text-[7px] font-mono opacity-20 block mb-2">MANEUVER_0{i}</span> {counter}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hidden Risks */}
      <div className="mt-16 p-8 bg-white/5 border border-white/10">
        <h4 className="etched-label text-white/20 mb-6">Predicted_System_Anomalies</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {strategy.hiddenRisks.map((risk, i) => (
            <div key={i} className="text-xs text-white/40 font-medium italic border-l border-white/10 pl-6">
              {risk}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}