import React from 'react';
import DocumentIcon from './icons/DocumentIcon'; 
import ScaleIcon from './icons/ScaleIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';

interface HeaderProps {
  onAnalyzeDocumentClick: () => void;
  onCrossReferenceClick: () => void;
  onNarrativeMapperClick: () => void;
}

export default function Header({ onAnalyzeDocumentClick, onCrossReferenceClick, onNarrativeMapperClick }: HeaderProps): React.ReactNode {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Denver Court <span className="text-blue-500">Copilot</span>
        </h1>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Legal Intelligence OS v4.0</p>
      </div>
      
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Diagnostic Modules</label>
        
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: 'Audit Dossier', icon: DocumentIcon, action: onAnalyzeDocumentClick },
            { label: 'Cross Reference', icon: ScaleIcon, action: onCrossReferenceClick },
            { label: 'Narrative Matrix', icon: BrainCircuitIcon, action: onNarrativeMapperClick }
          ].map((mod, i) => (
            <button
              key={i}
              onClick={mod.action}
              className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all group"
            >
              <mod.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              {mod.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Node Telemetry</span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase">Secure</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
            <span className="block text-[9px] text-slate-500 uppercase">Uptime</span>
            <span className="text-xs font-bold text-slate-300">99.98%</span>
          </div>
          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
            <span className="block text-[9px] text-slate-500 uppercase">Sector</span>
            <span className="text-xs font-bold text-slate-300">DNVR_DCO</span>
          </div>
        </div>
      </div>
    </div>
  );
}