import React, { useState, useCallback, useRef } from 'react';
import { CrossReferenceResult } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import DocumentIcon from './icons/DocumentIcon';
import CloseIcon from './icons/CloseIcon';
import ScaleIcon from './icons/ScaleIcon';
import AlertIcon from './icons/AlertIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';

interface CrossReferenceModalProps {
    onClose: () => void;
    onAnalyze: (
        fileABase64: string, fileAMime: string, fileAName: string,
        fileBBase64: string, fileBMime: string, fileBName: string
    ) => Promise<void>;
    result: CrossReferenceResult | null;
    isLoading: boolean;
    error: string | null;
    onSave: (result: CrossReferenceResult) => void;
    onRemoveSave: (result: CrossReferenceResult) => void;
    isSaved: boolean;
}

const MAX_FILE_SIZE_MB = 10;

const SeverityBadge: React.FC<{ severity: 'high' | 'medium' | 'low' }> = ({ severity }) => {
    switch (severity) {
        case 'high':
            return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-red-950 text-red-500 border border-red-500/30 uppercase tracking-widest">High Risk</span>;
        case 'medium':
            return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-orange-950 text-orange-500 border border-orange-500/30 uppercase tracking-widest">Conflict</span>;
        case 'low':
            return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-blue-950 text-blue-500 border border-blue-500/30 uppercase tracking-widest">Minor</span>;
    }
};

const FileUploader: React.FC<{
    label: string;
    file: File | null;
    onSetFile: (f: File | null) => void;
}> = ({ label, file, onSetFile }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    return (
        <div 
            className={`border border-dashed p-10 text-center cursor-pointer transition-all ${dragActive ? 'border-[#b5892f] bg-[#b5892f]/5' : 'border-[#6e501a]/30 bg-[#050505] hover:border-[#b5892f]/40'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); onSetFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files && onSetFile(e.target.files[0])} />
            {file ? (
                <div className="flex flex-col items-center">
                    <DocumentIcon className="w-10 h-10 text-[#b5892f] mb-4" />
                    <p className="text-xs font-black text-white uppercase tracking-widest truncate max-w-[200px]">{file.name}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <DocumentIcon className="w-10 h-10 text-[#6e501a] opacity-30 mb-4" />
                    <p className="text-[10px] font-black text-[#6e501a] uppercase tracking-widest">{label}</p>
                </div>
            )}
        </div>
    );
};

export default function CrossReferenceModal({ onClose, onAnalyze, result, isLoading, error, onSave, onRemoveSave, isSaved }: CrossReferenceModalProps): React.ReactNode {
    const [fileA, setFileA] = useState<File | null>(null);
    const [fileB, setFileB] = useState<File | null>(null);
    const handleAnalyzeClick = async () => {
        if (!fileA || !fileB) return;
        const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(f);
        });
        const [b64A, b64B] = await Promise.all([toBase64(fileA), toBase64(fileB)]);
        await onAnalyze(b64A, fileA.type, fileA.name, b64B, fileB.type, fileB.name);
    };

    return (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-[#121212] border border-[#6e501a] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6e501a] via-[#b5892f] to-[#6e501a]"></div>
                
                <div className="flex justify-between items-center p-6 border-b border-[#6e501a]/20">
                    <div className="flex items-center gap-4">
                        <ScaleIcon className="w-6 h-6 text-[#b5892f]" />
                        <h2 className="text-xl font-black text-[#efefef] uppercase tracking-[0.2em] italic">Cross-Examination Engine</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {result && (
                             <button onClick={() => isSaved ? onRemoveSave(result) : onSave(result)} className="text-[#b5892f] hover:text-[#e2c07d]">
                                {isSaved ? <BookmarkFilledIcon className="w-6 h-6" /> : <BookmarkIcon className="w-6 h-6" />}
                            </button>
                        )}
                        <button onClick={onClose} className="text-[#6e501a] hover:text-[#efefef]"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                </div>

                <div className="p-10">
                    {!result && !isLoading ? (
                        <div className="space-y-12">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <FileUploader label="Primary Dossier" file={fileA} onSetFile={setFileA} />
                                <FileUploader label="Corroborating Evidence" file={fileB} onSetFile={setFileB} />
                            </div>
                            <button onClick={handleAnalyzeClick} disabled={!fileA || !fileB} className="w-full py-6 bg-[#b5892f] text-[#050505] font-black uppercase italic tracking-tighter text-2xl hover:bg-[#e2c07d] transition-all disabled:opacity-20 shadow-xl">
                                INITIATE CROSS-REFERENCE
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerIcon className="w-14 h-14 text-[#b5892f] mb-8" />
                            <h3 className="text-xl font-black text-[#efefef] uppercase tracking-[0.3em] animate-pulse italic">Auditing Credibility...</h3>
                            <p className="text-[#6e501a] font-mono text-[9px] mt-4 uppercase tracking-[0.4em]">Matching semantic discrepancies in vector space</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col md:flex-row items-stretch gap-8 bg-[#050505] p-8 border border-[#6e501a]/30 shadow-inner">
                                <div className="flex flex-col items-center justify-center border-r border-[#6e501a]/20 pr-8 md:w-48">
                                    <div className="text-4xl font-black text-[#b5892f] italic tracking-tighter">{result.overallCredibilityScore}%</div>
                                    <div className="text-[9px] font-black text-[#6e501a] uppercase tracking-widest mt-2">Dossier Integrity</div>
                                </div>
                                <div className="flex-grow pl-0 md:pl-4">
                                    <h4 className="text-[10px] font-black text-[#6e501a] uppercase tracking-[0.3em] mb-4">Strategic Discrepancy Map</h4>
                                    <p className="text-base text-white font-light leading-relaxed">{result.summaryOfDiscrepancies}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-[#efefef] uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                                    Detected Anomalies ({result.contradictions.length})
                                    <div className="h-px flex-grow bg-[#6e501a]/20"></div>
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {result.contradictions.map((c, i) => (
                                        <div key={i} className="bg-[#050505] border border-[#6e501a]/40 p-6 group hover:border-[#b5892f]/40 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <h4 className="text-lg font-black text-[#e2c07d] uppercase tracking-wider italic">{c.topic}</h4>
                                                <SeverityBadge severity={c.severity as any} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <div className="p-4 bg-[#121212] border-l-2 border-red-900">
                                                    <span className="text-[9px] font-black text-[#6e501a] uppercase block mb-2">Claim Node A</span>
                                                    <p className="text-sm text-slate-300 italic">"{c.sourceAClaim}"</p>
                                                </div>
                                                <div className="p-4 bg-[#121212] border-l-2 border-blue-900">
                                                    <span className="text-[9px] font-black text-[#6e501a] uppercase block mb-2">Claim Node B</span>
                                                    <p className="text-sm text-slate-300 italic">"{c.sourceBClaim}"</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-white bg-[#b5892f]/5 p-4 border border-[#b5892f]/10 leading-relaxed font-bold">
                                                <span className="text-[#6e501a] mr-2 font-mono uppercase text-[9px]">Tactical Analysis:</span>
                                                {c.analysis}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}