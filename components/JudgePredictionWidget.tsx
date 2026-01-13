import React, { useState, useEffect } from 'react';
import { type SearchParams, type JudgeDetail } from '../types';
import { getJudgeDetails } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import ScaleIcon from './icons/ScaleIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import GavelIcon from './icons/GavelIcon';

interface JudgePredictionWidgetProps {
  judgeName: string;
  searchParams: SearchParams | null;
}

export default function JudgePredictionWidget({ judgeName, searchParams }: JudgePredictionWidgetProps): React.ReactNode {
  const [prediction, setPrediction] = useState<{ pattern: string; percentage?: string; caseType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Helper to detect case type context from params or query
  const detectCaseContext = (params: SearchParams | null): string | null => {
    if (!params) return null;

    // 1. Check explicit Case Type filter
    if (params.caseType && params.caseType !== 'all') {
      // Capitalize first letter
      return params.caseType.charAt(0).toUpperCase() + params.caseType.slice(1);
    }

    // 2. Check query keywords
    const q = params.query.toLowerCase();
    if (q.includes('civil') || q.includes('lawsuit') || q.includes('damages') || q.includes('plaintiff') || q.includes('defendant')) return 'Civil';
    if (q.includes('criminal') || q.includes('arrest') || q.includes('felony') || q.includes('misdemeanor') || q.includes('prosecution')) return 'Criminal';
    if (q.includes('family') || q.includes('divorce') || q.includes('custody') || q.includes('alimony') || q.includes('child')) return 'Family';
    if (q.includes('probate') || q.includes('will') || q.includes('estate') || q.includes('trust')) return 'Probate';
    if (q.includes('traffic') || q.includes('dui') || q.includes('ticket')) return 'Traffic';

    return null;
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      const caseContext = detectCaseContext(searchParams);
      
      // Only run if we haven't tried yet, we have a judge, and we have a context
      if (hasAttempted || !judgeName || !caseContext) return;
      
      setHasAttempted(true);
      setIsLoading(true);

      try {
        // We re-use the existing service which fetches deep details
        const details: JudgeDetail = await getJudgeDetails(judgeName);
        
        if (details.rulingPatternsByCaseType) {
          // Fuzzy match the case type
          const match = details.rulingPatternsByCaseType.find(p => 
            p.caseType.toLowerCase().includes(caseContext.toLowerCase()) || 
            caseContext.toLowerCase().includes(p.caseType.toLowerCase())
          );

          if (match) {
            setPrediction({
              pattern: match.pattern,
              percentage: match.percentage,
              caseType: match.caseType
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch judge prediction:", err);
        // Silently fail for the widget; user still has main results
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();
  }, [judgeName, searchParams, hasAttempted]);

  if (!prediction && !isLoading) return null;

  return (
    <div className="pt-6 mt-6 border-t border-[#1a1a1a] animate-[fadeIn_0.5s_ease-out]">
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      
      {isLoading ? (
        <div className="flex items-center space-x-3 text-[#999999] bg-[#0d0d0d]/50 p-4 rounded-lg border border-[#5e5239]/30">
          <SpinnerIcon className="w-5 h-5 text-[#a18d66]" />
          <span className="text-sm font-medium">Analyzing historical data for likely {detectCaseContext(searchParams)} outcome...</span>
        </div>
      ) : prediction ? (
        <div className="bg-gradient-to-r from-[#121212] to-[#0d0d0d] border border-[#a18d66]/40 rounded-xl p-1 shadow-lg relative overflow-hidden group">
            {/* Inner Content Container */}
            <div className="bg-[#050505]/80 backdrop-blur-sm rounded-lg p-5 relative z-10">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                    <ScaleIcon className="w-24 h-24 text-[#a18d66]" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-[#a18d66]/10 rounded-md border border-[#a18d66]/20">
                        <SparklesIcon className="w-4 h-4 text-[#a18d66]" />
                    </div>
                    <h4 className="text-sm font-bold text-[#d1c19d] uppercase tracking-wider">
                        AI Probability: {judgeName}
                    </h4>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-grow">
                         <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold text-[#5e5239] uppercase bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#5e5239]">
                                 Context: {prediction.caseType}
                             </span>
                         </div>
                         <p className="text-lg font-medium text-[#e5e5e5] leading-snug">
                             "{prediction.pattern}"
                         </p>
                    </div>

                    {prediction.percentage && (
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#1a1a1a]/80 rounded-lg p-3 border border-[#5e5239] min-w-[100px]">
                            <span className="text-2xl font-extrabold text-[#d1c19d]">
                                {prediction.percentage}
                            </span>
                            <span className="text-[10px] font-bold text-[#5e5239] uppercase mt-1 text-center">
                                Historical Rate
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#5e5239] via-[#a18d66] to-[#5e5239] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
        </div>
      ) : null}
    </div>
  );
}