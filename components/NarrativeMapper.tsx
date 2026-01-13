
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NarrativeMapResult, NarrativeNode, NarrativeLink, TimelineEvent } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import CloseIcon from './icons/CloseIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import UserIcon from './icons/UserIcon';
import GavelIcon from './icons/GavelIcon';
import GlobeIcon from './icons/GlobeIcon';
import DocumentIcon from './icons/DocumentIcon';
import AlertIcon from './icons/AlertIcon';
import CalendarIcon from './icons/CalendarIcon';
import DownloadIcon from './icons/DownloadIcon';

interface NarrativeMapperProps {
    onClose: () => void;
    onGenerate: (base64Content: string, mimeType: string, fileName: string) => Promise<NarrativeMapResult>;
    initialData?: { b64: string, mime: string, name: string } | null;
}

const getNodeIcon = (type: string, className = "w-5 h-5") => {
    switch (type) {
        case 'person': return <UserIcon className={className} />;
        case 'location': return <GlobeIcon className={className} />;
        case 'institution': return <GavelIcon className={className} />;
        case 'event': return <CalendarIcon className={className} />;
        default: return <DocumentIcon className={className} />;
    }
};

const getNodeColor = (type: string, isBrady: boolean) => {
    if (isBrady) return 'bg-red-900 border-red-500 text-white';
    return 'bg-[#050505] border-[#b5892f] text-[#e2c07d]';
};

const EvidenceBadge: React.FC<{ tag: string }> = ({ tag }) => {
    let borderColor = "#6e501a";
    let textColor = "#a0a0a0";
    if (tag.includes("Brady")) { borderColor = "#ef4444"; textColor = "#ef4444"; }
    else if (tag.includes("613")) { borderColor = "#b5892f"; textColor = "#e2c07d"; }
    return (
        <span className="px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase border tracking-tighter shadow-sm" style={{borderColor, color: textColor, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            {tag}
        </span>
    );
};

const GraphView: React.FC<{ data: NarrativeMapResult; onNodeClick: (node: NarrativeNode) => void; activeNodeId: string | null; }> = ({ data, onNodeClick, activeNodeId }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [draggingId, setDraggingId] = useState<string | null>(null);

    useEffect(() => {
        const width = 800; const height = 600; const newPos: Record<string, { x: number, y: number }> = {};
        const people = data.nodes.filter(n => n.type === 'person');
        const others = data.nodes.filter(n => n.type !== 'person');
        people.forEach((node, i) => { const angle = (i / people.length) * 2 * Math.PI; newPos[node.id] = { x: 400 + Math.cos(angle) * 150, y: 300 + Math.sin(angle) * 150 }; });
        others.forEach((node, i) => { const angle = (i / others.length) * 2 * Math.PI; newPos[node.id] = { x: 400 + Math.cos(angle) * 250, y: 300 + Math.sin(angle) * 250 }; });
        setPositions(newPos);
    }, [data]);

    return (
        <div className="bg-[#050505] rounded-none overflow-hidden relative h-full w-full border border-[#6e501a]/20">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b5892f 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" onMouseMove={(e) => { if (draggingId) { const r = svgRef.current!.getBoundingClientRect(); setPositions(p => ({...p, [draggingId]: { x: (e.clientX - r.left) * (800/r.width), y: (e.clientY - r.top) * (600/r.height) }})); } }} onMouseUp={() => setDraggingId(null)} className="cursor-crosshair">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#6e501a" /></marker>
                    <marker id="arrow-contradiction" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ef4444" /></marker>
                </defs>
                {data.links.map((l, i) => {
                    const s = positions[l.source], e = positions[l.target]; if (!s || !e) return null;
                    const isContradiction = l.type === 'contradiction';
                    const isInferred = l.type === 'inferred';
                    return (
                        <g key={i}>
                            <line 
                                x1={s.x} y1={s.y} x2={e.x} y2={e.y} 
                                stroke={isContradiction ? '#ef4444' : (isInferred ? '#6e501a' : '#b5892f')} 
                                strokeWidth={isContradiction ? "2" : "1"} 
                                strokeDasharray={isInferred ? "5,5" : "0"}
                                opacity="0.6" 
                                markerEnd={isContradiction ? "url(#arrow-contradiction)" : "url(#arrow)"} 
                            />
                            <foreignObject x={(s.x+e.x)/2 - 50} y={(s.y+e.y)/2 - 10} width="100" height="20">
                                <div className={`text-[8px] font-black text-center uppercase tracking-tighter ${isContradiction ? 'text-red-500' : 'text-[#6e501a]'}`}>{l.label}</div>
                            </foreignObject>
                        </g>
                    );
                })}
                {data.nodes.map(n => {
                    const p = positions[n.id]; if (!p) return null;
                    const isActive = activeNodeId === n.id;
                    const color = !!n.bradyFlag ? '#ef4444' : '#b5892f';
                    return (
                        <g key={n.id} transform={`translate(${p.x}, ${p.y})`} onClick={() => onNodeClick(n)} onMouseDown={() => setDraggingId(n.id)} className="cursor-pointer">
                            <circle r="24" fill="#050505" stroke={isActive ? '#e2c07d' : color} strokeWidth={isActive ? "3" : "1"} />
                            <foreignObject x="-12" y="-12" width="24" height="24"><div className="flex justify-center" style={{color: !!n.bradyFlag ? '#ef4444' : '#b5892f'}}>{getNodeIcon(n.type, "w-6 h-6")}</div></foreignObject>
                            <text y="42" fill="#efefef" fontSize="10" fontWeight="900" textAnchor="middle" className="uppercase tracking-widest">{n.label}</text>
                            {n.bradyFlag && <circle r="6" cx="18" cy="-18" fill="#ef4444" />}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default function NarrativeMapper({ onClose, onGenerate, initialData }: NarrativeMapperProps): React.ReactNode {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<NarrativeMapResult | null>(null);
    const [selectedNode, setSelectedNode] = useState<NarrativeNode | null>(null);

    const handleGenerateInternal = useCallback(async (b64: string, mime: string, name: string) => {
        setIsLoading(true);
        try {
            const res = await onGenerate(b64, mime, name);
            setResult(res);
        } catch (e) {
            console.error("Mapping failure:", e);
        } finally {
            setIsLoading(false);
        }
    }, [onGenerate]);

    useEffect(() => {
        if (initialData) {
            handleGenerateInternal(initialData.b64, initialData.mime, initialData.name);
        }
    }, [initialData, handleGenerateInternal]);

    const handleManualGenerate = async () => {
        if (!file) return; 
        try {
            const b64 = await new Promise<string>((resolve, reject) => { 
                const rd = new FileReader(); 
                rd.onload = () => {
                    const res = rd.result as string;
                    if (res) resolve(res.split(',')[1]);
                    else reject(new Error("File read error"));
                }; 
                rd.onerror = () => reject(new Error("Dossier injection failed"));
                rd.readAsDataURL(file); 
            });
            await handleGenerateInternal(b64, file.type, file.name);
        } catch (e) {
            console.error("Manual mapping trigger error:", e);
        }
    };

    if (!result && !isLoading) {
        return (
            <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md flex justify-center items-center z-50 p-4">
                <div className="bg-[#121212] border border-[#6e501a] p-10 max-w-xl w-full text-center relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#b5892f]"></div>
                    <h2 className="text-3xl font-black text-[#efefef] tracking-tighter uppercase italic mb-6">Narrative Matrix Generator</h2>
                    <input type="file" accept="application/pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" id="f-mapper" />
                    <label htmlFor="f-mapper" className="block p-12 border border-dashed border-[#6e501a]/40 mb-10 cursor-pointer hover:bg-[#b5892f]/5">
                        <DocumentIcon className="w-12 h-12 text-[#6e501a] mx-auto mb-4" />
                        <span className="text-xs font-black text-[#e2c07d] uppercase tracking-widest">{file ? file.name : "Inject Discovery Data"}</span>
                    </label>
                    <button onClick={handleManualGenerate} disabled={!file} className="w-full py-5 bg-[#b5892f] text-[#050505] font-black uppercase italic tracking-tighter text-xl hover:bg-[#e2c07d] transition-all shadow-xl">Synchronise Narrative tracks</button>
                    <button onClick={onClose} className="mt-6 text-[#6e501a] text-[10px] font-black uppercase tracking-widest hover:text-[#efefef]">Abort Command</button>
                </div>
            </div>
        );
    }

    if (isLoading) return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50">
            <SpinnerIcon className="w-16 h-16 text-[#b5892f] mb-8" />
            <div className="text-[10px] font-black text-[#6e501a] uppercase tracking-[0.6em] animate-pulse">Reconstructing Narrative Timeline...</div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col animate-[fadeIn_0.3s_ease-out]">
            <div className="p-6 bg-[#121212] border-b border-[#6e501a]/30 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-6">
                    <BrainCircuitIcon className="w-8 h-8 text-[#b5892f]" />
                    <h2 className="text-2xl font-black text-[#efefef] uppercase italic tracking-tighter">Narrative Matrix: {initialData?.name || file?.name}</h2>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 border border-[#6e501a] text-[#b5892f] text-[10px] font-black uppercase tracking-widest hover:bg-[#b5892f]/5 transition-all"><DownloadIcon className="w-4 h-4 mr-2 inline" /> Export Exhibit</button>
                    <button onClick={onClose} className="text-[#6e501a] hover:text-[#efefef]"><CloseIcon className="w-6 h-6" /></button>
                </div>
            </div>

            <div className="flex-grow flex overflow-hidden">
                <div className="w-[30%] xl:w-[25%] border-r border-[#6e501a]/20 flex flex-col bg-[#121212]">
                    <div className="p-4 bg-[#050505] border-b border-[#6e501a]/20 text-[10px] font-black text-[#6e501a] uppercase tracking-widest flex items-center gap-3">
                        <CalendarIcon className="w-3 h-3" />
                        Chronological Vector Log
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {result?.timeline.map((e, i) => (
                            <div key={i} className={`p-4 border border-[#6e501a]/20 relative group hover:border-[#b5892f]/40 transition-all ${e.narrativeTrack === 'defense' ? 'bg-[#b5892f]/5 border-l-2 border-l-[#b5892f]' : 'bg-[#050505]'}`}>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
                                    <span className="text-[#e2c07d]">{e.date}</span>
                                    <span className={`px-1 ${e.narrativeTrack === 'prosecution' ? 'text-red-500' : 'text-blue-400'}`}>{e.narrativeTrack}</span>
                                </div>
                                <p className="text-sm font-bold text-white leading-tight">{e.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow flex flex-col relative">
                    <GraphView data={result!} onNodeClick={setSelectedNode} activeNodeId={selectedNode?.id || null} />
                    <div className="h-[35%] bg-[#121212] border-t border-[#6e501a] flex shadow-2xl z-20">
                        <div className="w-1/2 p-8 border-r border-[#6e501a]/10 overflow-y-auto custom-scrollbar">
                            <h3 className="text-[10px] font-black text-[#b5892f] uppercase tracking-[0.4em] mb-4">Strategic Assessment</h3>
                            <p className="text-lg text-white font-light italic leading-relaxed">"{result?.strategicAssessment}"</p>
                        </div>
                        <div className="w-1/2 p-8 overflow-y-auto bg-[#050505] custom-scrollbar">
                            {selectedNode ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-[#121212] border border-[#6e501a]/50 rounded-sm text-[#b5892f]">
                                                {getNodeIcon(selectedNode.type, "w-8 h-8")}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[#efefef] uppercase tracking-tighter italic">{selectedNode.label}</h4>
                                                <div className="text-[9px] font-black text-[#6e501a] uppercase tracking-[0.2em]">{selectedNode.type} profile</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {selectedNode.evidenceTags?.map((t, i) => <EvidenceBadge key={i} tag={t} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 font-light mb-6 leading-relaxed">{selectedNode.description}</p>
                                    {selectedNode.sourceCitation && (
                                        <div className="p-4 bg-[#121212] border-l-2 border-[#b5892f]">
                                            <span className="text-[9px] font-black text-[#6e501a] uppercase block mb-1">Authenticated Citation</span>
                                            <p className="text-[10px] text-[#e2c07d] font-mono uppercase tracking-widest">{selectedNode.sourceCitation}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#6e501a] text-[10px] font-black uppercase tracking-widest italic opacity-20">Link to Neural Node to Inspect Evidence</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #6e501a; }
            `}</style>
        </div>
    );
}
