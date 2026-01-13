
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { JudgeDetail } from '../types';
import { getJudgeDetails } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';
import GavelIcon from './icons/GavelIcon';
import CloseIcon from './icons/CloseIcon';
import AlertIcon from './icons/AlertIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface JudgeDetailModalProps {
  judgeName: string;
  onClose: () => void;
}

const ChartDataPointView: React.FC<{ 
  label: string; 
  value: number; 
  displayValue: string;
  riskLevel?: 'low' | 'medium' | 'high';
}> = ({ label, value, displayValue, riskLevel }) => (
    <div className="group space-y-3">
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#efefef] uppercase tracking-widest">{label}</span>
                {riskLevel === 'high' && (
                  <div className="animate-pulse" title="CRITICAL RISK: High probability of unfavorable/unpredictable outcome.">
                    <AlertIcon className="w-3.5 h-3.5 text-red-500" />
                  </div>
                )}
                {riskLevel === 'medium' && (
                  <div title="CAUTION: Moderate unpredictability detected.">
                    <AlertIcon className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                )}
            </div>
            <span className="text-xs font-mono font-bold text-[#b5892f]">{displayValue}</span>
        </div>
        <div className="h-2 w-full bg-[#050505] rounded-none overflow-hidden border border-[#6e501a]/30 shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                riskLevel === 'high' ? 'bg-gradient-to-r from-red-900 to-red-600' : 
                riskLevel === 'medium' ? 'bg-gradient-to-r from-orange-900 to-orange-500' : 
                'bg-gradient-to-r from-[#6e501a] to-[#b5892f]'
              }`} 
              style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

export default function JudgeDetailModal({ judgeName, onClose }: JudgeDetailModalProps): React.ReactNode {
  const [judgeDetails, setJudgeDetails] = useState<JudgeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const details = await getJudgeDetails(judgeName);
        setJudgeDetails(details);
      } catch (err) { setError('Sync failure.'); }
      finally { setIsLoading(false); }
    })();
  }, [judgeName]);

  const chartData = useMemo(() => {
    if (!judgeDetails?.rulingPatternsByCaseType) return [];
    return judgeDetails.rulingPatternsByCaseType.map(item => {
        const match = item.percentage?.match(/(\d+(?:\.\d+)?)%/);
        return { 
          label: item.caseType, 
          value: match ? parseFloat(match[1]) : 0, 
          displayValue: item.percentage || 'N/A',
          riskLevel: item.riskLevel
        };
    }).filter(i => i.value > 0);
  }, [judgeDetails]);

  return (
    <div className="fixed inset-0 bg-[#050505]/98 backdrop-blur-xl flex justify-center items-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#121212] border border-[#6e501a] shadow-[0_80px_200px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[92vh] overflow-y-auto relative custom-scrollbar">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6e501a] via-[#b5892f] to-[#6e501a]"></div>
        <div className="flex justify-between items-center p-10 border-b border-[#6e501a]/20">
          <h2 className="text-2xl font-black text-[#efefef] uppercase tracking-[0.3em] italic flex items-center">
            <GavelIcon className="w-10 h-10 mr-6 text-[#b5892f]" />
            Judicial Dossier: {judgeName}
          </h2>
          <button onClick={onClose} className="text-[#6e501a] hover:text-[#efefef] transition-colors"><CloseIcon className="w-10 h-10" /></button>
        </div>

        {isLoading ? (
          <div className="p-40 flex flex-col items-center justify-center space-y-8">
              <SpinnerIcon className="w-20 h-20 text-[#b5892f]" />
              <div className="text-[11px] font-black text-[#6e501a] uppercase tracking-[0.6em] animate-pulse">Decrypting Public Record...</div>
          </div>
        ) : error ? (
          <div className="p-20 text-red-500 font-black text-center uppercase tracking-[0.4em]">{error}</div>
        ) : judgeDetails ? (
          <div className="p-10 lg:p-16 space-y-20 animate-[fadeIn_0.5s_ease-out]">
            <section className="max-w-3xl">
              <h3 className="text-xs font-black text-[#b5892f] uppercase tracking-[0.5em] mb-10 border-b border-[#b5892f]/20 pb-4">Identified Behavioral Tendencies</h3>
              <p className="text-2xl text-[#efefef] font-light leading-loose prose prose-invert prose-2xl max-w-none prose-strong:text-[#d1c19d] italic">
                  {judgeDetails.tendencies}
              </p>
            </section>

            <section className="bg-[#050505] p-12 border border-[#6e501a]/30 shadow-2xl">
              <h3 className="text-xs font-black text-[#6e501a] uppercase tracking-[0.4em] mb-12 border-b border-[#6e501a]/20 pb-6">Statistical Ruling Probability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {chartData.map((d, i) => <ChartDataPointView key={i} {...d} />)}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <section>
                    <h3 className="text-xs font-black text-[#6e501a] uppercase tracking-[0.4em] mb-10">Neural Bench Stats</h3>
                    <ul className="space-y-6">
                        {judgeDetails.statistics.map((s, i) => (
                            <li key={i} className="bg-[#0d0d0d] p-8 border border-[#6e501a]/30 shadow-xl">
                                {s.convictionRate && <div className="mb-4"><span className="text-[#6e501a] font-mono uppercase text-[10px] tracking-widest block mb-1">Conviction Rate</span> <span className="text-2xl text-[#e2c07d] font-black italic">{s.convictionRate}</span></div>}
                                {s.averageSentence && <div><span className="text-[#6e501a] font-mono uppercase text-[10px] tracking-widest block mb-1">Mean Sentencing Depth</span> <span className="text-2xl text-[#e2c07d] font-black italic">{s.averageSentence}</span></div>}
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <h3 className="text-xs font-black text-[#6e501a] uppercase tracking-[0.4em] mb-10">Strategic Reference Cases</h3>
                    <ul className="space-y-8">
                        {judgeDetails.notableCases.map((c, i) => (
                            <li key={i} className="group border-l-2 border-[#6e501a]/40 pl-6 hover:border-[#b5892f] transition-colors">
                                <span className="text-xl font-black text-[#efefef] block uppercase tracking-tighter italic group-hover:text-[#b5892f] transition-colors">{c.caseName}</span>
                                <span className="text-[#6e501a] text-[10px] block uppercase mt-2 tracking-widest font-bold">{c.outcome} • {c.date}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="bg-[#b5892f]/5 p-12 border border-[#b5892f]/40 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
              <h3 className="text-xs font-black text-[#b5892f] uppercase tracking-[0.6em] mb-10 border-b border-[#b5892f]/30 pb-4">Adversarial Counter-Offensive Strategy</h3>
              <div className="prose prose-invert prose-2xl max-w-none text-[#efefef] leading-loose font-light prose-strong:text-[#d1c19d] prose-h3:text-xl prose-h3:text-[#d1c19d] prose-li:mb-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{judgeDetails.strategicInsights}</ReactMarkdown>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
