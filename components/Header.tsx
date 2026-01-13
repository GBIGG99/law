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
    <div className="flex flex-col gap-12">
      <div className="relative group">
        <div className="etched-label text-[7px] text-white/40 mb-3 font-bold">OPERATIONAL_IDENTITY_MATRIX</div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-3 gradient-text italic">
          DENVER<br/>INTEL
        </h1>
        <div className="h-0.5 w-16 bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="etched-label mb-2 opacity-30">Diagnostic Access</div>
        
        {[
          { label: 'Audit Dossier', icon: DocumentIcon, action: onAnalyzeDocumentClick, code: '0x4F' },
          { label: 'Cross Reference', icon: ScaleIcon, action: onCrossReferenceClick, code: '0x71' },
          { label: 'Narrative Matrix', icon: BrainCircuitIcon, action: onNarrativeMapperClick, code: '0xA2' }
        ].map((mod, i) => (
          <button
            key={i}
            onClick={mod.action}
            className="flex items-center justify-between p-5 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            <span className="flex items-center gap-4">
              <mod.icon className="w-5 h-5 text-white/10 group-hover:text-white transition-colors" />
              {mod.label}
            </span>
            <span className="font-mono text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">{mod.code}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="etched-label opacity-20 text-[7px]">Unit Telemetry</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-4 flex flex-col gap-1 border border-white/5 hover:bg-white/[0.08] transition-colors">
            <span className="text-[7px] text-white/20 font-bold uppercase">Stability</span>
            <span className="text-xs text-white font-black">ACTIVE</span>
          </div>
          <div className="bg-white/5 p-4 flex flex-col gap-1 border border-white/5 hover:bg-white/[0.08] transition-colors">
            <span className="text-[7px] text-white/20 font-bold uppercase">Sector</span>
            <span className="text-xs text-white font-black">DNVR_DCO</span>
          </div>
        </div>
      </div>
    </div>
  );
}