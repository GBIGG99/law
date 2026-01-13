import React, { useState } from 'react';
import QuestionMarkIcon from './icons/QuestionMarkIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export default function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionsProps): React.ReactNode {
  const [clickedQuestion, setClickedQuestion] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleClick = (q: string) => {
    setClickedQuestion(q);
    onQuestionClick(q);
    // Reset after some time if needed, though usually the page will reload/re-render
    setTimeout(() => setClickedQuestion(null), 3000);
  };
  
  return (
    <div className="pt-10 mt-10 border-t border-[#6e501a]/20">
      <h4 className="text-[10px] font-black text-[#6e501a] uppercase tracking-[0.4em] mb-6">
        Suggested Counter-Queries
      </h4>
      <div className="flex flex-col gap-3">
        {questions.map((question, index) => (
          <button
            key={index}
            disabled={clickedQuestion !== null}
            onClick={() => handleClick(question)}
            className="flex items-center text-left p-5 bg-[#0d0d0d] border border-[#6e501a]/20 text-[#a0a0a0] text-xs font-bold hover:bg-[#b5892f]/5 hover:border-[#b5892f] hover:text-[#efefef] transition-all group disabled:opacity-50"
          >
            <div className="p-2 bg-[#050505] border border-[#6e501a]/40 mr-4 group-hover:border-[#b5892f] transition-colors">
              {clickedQuestion === question ? (
                <SpinnerIcon className="w-4 h-4 text-[#b5892f]" />
              ) : (
                <QuestionMarkIcon className="w-4 h-4 text-[#6e501a] group-hover:text-[#b5892f]" />
              )}
            </div>
            <span className="flex-grow italic leading-tight">{question}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6e501a] ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {clickedQuestion === question ? 'Branching...' : 'Run Logic'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
