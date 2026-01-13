
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentAnalysisResult } from '../types';
import { askDocumentQuestion } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';
import DocumentIcon from './icons/DocumentIcon';
import CloseIcon from './icons/CloseIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GavelIcon from './icons/GavelIcon';
import CalendarIcon from './icons/CalendarIcon';
import UserIcon from './icons/UserIcon';
import NumberIcon from './icons/NumberIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';
import QuestionMarkIcon from './icons/QuestionMarkIcon';
import ScaleIcon from './icons/ScaleIcon';

interface DocumentAnalysisModalProps {
    onClose: () => void;
    onAnalyze: (base64Content: string, mimeType: string, fileName: string) => Promise<void>;
    result: DocumentAnalysisResult | null;
    isLoading: boolean;
    error: string | null;
    onSave: (result: DocumentAnalysisResult) => void;
    onRemoveSave: (result: DocumentAnalysisResult) => void;
    onMapNarrative?: () => void;
    isSaved: boolean;
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case 'judge': return <GavelIcon className="w-5 h-5 mr-3 text-[#b5892f]" />;
    case 'party': return <UserIcon className="w-5 h-5 mr-3 text-[#e2c07d]" />;
    case 'date': return <CalendarIcon className="w-5 h-5 mr-3 text-[#6e501a]" />;
    case 'case_number': return <NumberIcon className="w-5 h-5 mr-3 text-[#b5892f]" />;
    default: return <DocumentIcon className="w-5 h-5 mr-3 text-[#6e501a]" />;
  }
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

export default function DocumentAnalysisModal({ onClose, onAnalyze, result, isLoading, error, onSave, onRemoveSave, isSaved, onMapNarrative }: DocumentAnalysisModalProps): React.ReactNode {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [questionInput, setQuestionInput] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isAsking]);

    const handleFileChange = useCallback((files: FileList | null) => {
        setLocalError(null);
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type !== 'application/pdf') {
                setLocalError('Dossier Input must be PDF.');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    }, []);

    const handleAnalyzeClick = useCallback(async () => {
        if (!selectedFile) return;
        setLocalError(null);
        try {
            const base64Content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const res = e.target?.result as string;
                    if (res) {
                        resolve(res.split(',')[1]);
                    } else {
                        reject(new Error("Empty dossier result"));
                    }
                };
                reader.onerror = () => reject(new Error("Dossier access failure"));
                reader.readAsDataURL(selectedFile);
            });
            await onAnalyze(base64Content, selectedFile.type, selectedFile.name);
        } catch (e) {
             console.error("Analysis execution error:", e);
             setLocalError("Strategic audit failure: Connection or payload corruption.");
        }
    }, [selectedFile, onAnalyze]);

    const handleAskQuestion = async () => {
        if (!questionInput.trim() || !result) return;
        const userQ = questionInput.trim();
        setQuestionInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userQ }]);
        setIsAsking(true);
        try {
            const answer = await askDocumentQuestion(result, userQ);
            setChatHistory(prev => [...prev, { role: 'ai', content: answer }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "Neural link failure: Data sync interrupted." }]);
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-[#121212] border border-[#6e501a] shadow-[0_60px_150px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[92vh] overflow-y-auto relative custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6e501a] via-[#b5892f] to-[#6e501a]"></div>
                
                <div className="flex justify-between items-center p-8 border-b border-[#6e501a]/20">
                    <h2 className="text-2xl font-black text-[#efefef] uppercase tracking-[0.3em] italic flex items-center">
                        <DocumentIcon className="w-8 h-8 mr-6 text-[#b5892f]" />
                        Strategic Evidence Audit
                    </h2>
                    <div className="flex items-center gap-6">
                        {result && (
                            <button onClick={() => isSaved ? onRemoveSave(result) : onSave(result)} className="text-[#b5892f] hover:text-[#efefef] transition-colors">
                                {isSaved ? <BookmarkFilledIcon className="w-8 h-8" /> : <BookmarkIcon className="w-8 h-8" />}
                            </button>
                        )}
                        <button onClick={onClose} className="text-[#6e501a] hover:text-[#efefef] transition-colors"><CloseIcon className="w-8 h-8" /></button>
                    </div>
                </div>

                <div className="p-10">
                    {(localError || error) && (
                        <div className="bg-[#ff0033]/10 border border-[#ff0033]/40 text-[#ff0033] p-4 mb-6 text-xs font-mono uppercase tracking-widest animate-pulse">
                            CRITICAL_ERROR: {localError || error}
                        </div>
                    )}
                    
                    {!result && !isLoading ? (
                        <div className="space-y-12">
                            <div
                                onDragOver={(e) => {e.preventDefault(); setDragActive(true);}}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => {e.preventDefault(); setDragActive(false); handleFileChange(e.dataTransfer.files);}}
                                onClick={() => inputRef.current?.click()}
                                className={`flex flex-col items-center justify-center p-20 border-2 border-dashed transition-all cursor-pointer ${
                                    dragActive ? 'border-[#b5892f] bg-[#b5892f]/10 shadow-inner scale-[0.99]' : 'border-[#6e501a]/40 bg-[#050505] hover:border-[#b5892f]/60'
                                }`}
                            >
                                <input ref={inputRef} type="file" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
                                <DocumentIcon className="w-20 h-20 text-[#6e501a] mb-8" />
                                <p className="text-xl font-bold text-[#e2c07d] uppercase tracking-[0.2em] text-center">
                                    Inject Source Dossier (PDF)
                                </p>
                                {selectedFile && <p className="mt-8 text-sm text-[#050505] font-black uppercase tracking-[0.2em] bg-[#b5892f] px-6 py-2">{selectedFile.name}</p>}
                            </div>
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={!selectedFile || isLoading}
                                className="w-full py-8 bg-[#b5892f] text-[#050505] font-black uppercase italic tracking-tighter text-3xl hover:bg-[#e2c07d] transition-all disabled:opacity-20 shadow-2xl"
                            >
                                Execute Intelligence Harvest
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center space-y-10">
                             <SpinnerIcon className="w-20 h-20 text-[#b5892f]" />
                             <p className="text-xs font-black text-[#6e501a] uppercase tracking-[0.6em] animate-pulse">Reconstructing Legal Landscape...</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-16 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex-grow p-10 bg-[#050505] border-l-8 border-[#b5892f] shadow-2xl">
                                    <h4 className="text-xs font-black text-[#b5892f] uppercase tracking-[0.5em] mb-8 border-b border-[#5e5239]/20 pb-4">Tactical Executive Summary</h4>
                                    <div className="prose prose-invert prose-2xl max-w-none text-[#efefef] leading-loose">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {result.strategicSummary}
                                      </ReactMarkdown>
                                    </div>
                                </div>
                                {onMapNarrative && (
                                    <button 
                                        onClick={onMapNarrative}
                                        className="lg:w-64 bg-[#1a1a1a] border border-[#b5892f]/30 hover:border-[#b5892f] p-10 flex flex-col items-center justify-center gap-6 transition-all group shrink-0"
                                    >
                                        <BrainCircuitIcon className="w-16 h-16 text-[#b5892f] group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-widest text-[#b5892f] text-center">Narrative Matrix Visualization</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div>
                                    <h4 className="text-xs font-black text-[#6e501a] uppercase tracking-[0.4em] mb-8 flex items-center gap-6">
                                        <div className="h-1 flex-grow bg-[#6e501a]/20"></div> Leveraged Arguments
                                    </h4>
                                    <ul className="space-y-6">
                                        {result.keyArguments.map((arg, i) => (
                                            <li key={i} className="text-lg text-[#efefef] pl-8 border-l-4 border-[#6e501a] italic leading-relaxed">{arg}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-[#6e501a] uppercase tracking-[0.4em] mb-8 flex items-center gap-6">
                                        <div className="h-1 flex-grow bg-[#6e501a]/20"></div> Adversarial Entities
                                    </h4>
                                    <ul className="space-y-4">
                                        {result.identifiedEntities.map((entity, i) => (
                                            <li key={i} className="flex items-center text-sm font-bold text-[#efefef] bg-[#0d0d0d] p-6 border border-[#6e501a]/20">
                                                {getEntityIcon(entity.type)}
                                                <span className="text-[10px] font-mono uppercase text-[#6e501a] mr-4">{entity.type} ID:</span> {entity.value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-[#b5892f]/5 p-10 border border-[#b5892f]/30 shadow-inner">
                                <h4 className="text-xs font-black text-[#b5892f] uppercase tracking-[0.5em] mb-10 border-b border-[#b5892f]/20 pb-4">Counter-Maneuver Protocols</h4>
                                <div className="grid grid-cols-1 gap-8">
                                    {result.actionableInsights.map((insight, i) => (
                                        <div key={i} className="flex gap-8 group">
                                            <div className="text-3xl font-mono text-[#6e501a] group-hover:text-[#b5892f] transition-colors leading-none">0{i+1}</div>
                                            <p className="text-xl font-bold text-[#e2c07d] leading-relaxed italic">{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 pt-12 border-t border-[#6e501a]/20">
                                <h4 className="text-xs font-black text-[#b5892f] uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
                                    <QuestionMarkIcon className="w-5 h-5" /> [NEURAL_QUERY_CHANNEL]
                                </h4>
                                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-6 border ${msg.role === 'user' ? 'bg-[#00ff41]/5 border-[#00ff41]/20 text-[#00ff41]' : 'bg-[#121212] border-[#6e501a]/40 text-[#efefef]'}`}>
                                                <div className="text-[8px] font-black uppercase tracking-widest mb-2 opacity-50">{msg.role === 'user' ? 'OPERATOR_SIGNAL' : 'AI_RESPONSE'}</div>
                                                <div className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {isAsking && (
                                        <div className="flex justify-start">
                                            <div className="bg-[#121212] border border-[#6e501a]/40 p-6 flex items-center gap-4">
                                                <SpinnerIcon className="w-4 h-4 text-[#b5892f]" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#6e501a] animate-pulse">Syncing...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <div className="flex gap-4">
                                    <textarea
                                        value={questionInput}
                                        onChange={(e) => setQuestionInput(e.target.value)}
                                        placeholder="INPUT_QUERY_SELECTOR..."
                                        className="flex-grow bg-[#050505] border border-[#6e501a]/40 p-6 font-mono text-sm text-[#e2c07d] focus:outline-none focus:border-[#b5892f] resize-none"
                                        rows={2}
                                        disabled={isAsking}
                                    />
                                    <button
                                        onClick={handleAskQuestion}
                                        disabled={!questionInput.trim() || isAsking}
                                        className="px-10 bg-[#b5892f] text-black font-black uppercase tracking-widest hover:bg-[#e2c07d] transition-all disabled:opacity-20"
                                    >
                                        [SEND]
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #6e501a; }`}</style>
        </div>
    );
}
