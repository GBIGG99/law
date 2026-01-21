
import React from 'react';
import { StrategicTelemetry } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import AlertIcon from './icons/AlertIcon';
import StrategicRadarChart from './StrategicRadarChart';

interface StrategicTelemetryWidgetProps {
  telemetry?: StrategicTelemetry;
  isLoading?: boolean;
}

const ThreatIndicator: React.FC<{ label: string; impact: number; probability: number }> = ({ label, impact, probability }) => {
  const score = (impact * probability) / 100;
  const isHigh = score > 0.5;
  
  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-900/40 border border-slate-800 rounded-lg group hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[140px]">{label}</span>
        {isHigh && <AlertIcon className="w-3 h-3 text-red-500 animate-pulse" />}
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isHigh ? 'bg-red-500' : 'bg-orange-500'}`} 
          style={{ width: `${(impact/10)*100}%` }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase">
        <span>Impact: {impact}/10</span>
        <span>Prob: {probability * 10}%</span>
      </div>
    </div>
  );
};

export default function StrategicTelemetryWidget({ telemetry, isLoading }: StrategicTelemetryWidgetProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center gap-6 shadow-2xl">
        <SpinnerIcon className="w-12 h-12 text-blue-500/40" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Scanning_Threat_Vectors...</span>
      </div>
    );
  }

  if (!telemetry) return null;

  return (
    <div className="bg-slate-950 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden page-break-avoid">
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <div className="w-32 h-32 border-2 border-blue-500 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start mb-12 border-b border-slate-800 pb-12">
        {/* Readiness Meter & Radar Container */}
        <div className="flex flex-col sm:flex-row gap-12 items-center shrink-0">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="58" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * telemetry.readinessScore) / 100}
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white italic tracking-tighter">{telemetry.readinessScore}</span>
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Readiness</span>
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center max-w-[120px]">Case Preparation Velocity</p>
          </div>

          {/* Strategic Factor Pulse (Radar Chart) */}
          <div className="flex flex-col items-center gap-2">
            <StrategicRadarChart factors={telemetry.strategicFactors} size={180} />
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center max-w-[120px]">Strategic_Strength_Pulse</p>
          </div>
        </div>

        {/* Complexity Index */}
        <div className="flex-grow space-y-8 w-full">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Intelligence_Telemetry</h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Complexity Index</span>
                <span className="text-xl font-black text-white font-mono">{telemetry.complexityIndex}/10</span>
              </div>
            </div>
            <div className="h-4 w-full bg-slate-900 rounded-sm overflow-hidden border border-slate-800 p-0.5">
               <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000" 
                style={{ width: `${telemetry.complexityIndex * 10}%` }}
               />
            </div>
          </div>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Neural sensors indicate a <span className="text-white font-bold">{telemetry.complexityIndex > 7 ? 'High' : telemetry.complexityIndex > 4 ? 'Moderate' : 'Low'}</span> complexity legal landscape. Strategy deployment should focus on procedural efficiency.
          </p>
        </div>
      </div>

      {/* Threat Matrix */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Adversarial_Threat_Matrix</h4>
          <div className="h-px flex-grow bg-slate-800"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {telemetry.threatMatrix.map((threat, i) => (
            <ThreatIndicator key={i} {...threat} />
          ))}
        </div>
      </div>
    </div>
  );
}
