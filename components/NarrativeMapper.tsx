
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
import ChevronDownIcon from './icons/ChevronDownIcon';

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

const EvidenceBadge: React.FC<{ tag: string }> = ({ tag }) => {
    let borderColor = "#6e501a";
    let textColor = "#a0a0a0";
    if (tag.toLowerCase().includes("brady")) { borderColor = "#ef4444"; textColor = "#ef4444"; }
    else if (tag.toLowerCase().includes("contradiction")) { borderColor = "#f59e0b"; textColor = "#fbbf24"; }
    return (
        <span className="px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase border tracking-tighter shadow-sm" style={{borderColor, color: textColor, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            {tag}
        </span>
    );
};

const GraphView: React.FC<{ 
    data: NarrativeMapResult; 
    onNodeClick: (node: NarrativeNode) => void; 
    activeNodeId: string | null; 
    svgRef: React.RefObject<SVGSVGElement | null>; 
    containerRef: React.RefObject<HTMLDivElement | null>; 
    filter: string;
}> = ({ data, onNodeClick, activeNodeId, svgRef, containerRef, filter }) => {
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const filteredNodes = useMemo(() => {
        if (filter === 'all') return data.nodes;
        return data.nodes.filter(n => n.type === filter);
    }, [data.nodes, filter]);

    const filteredLinks = useMemo(() => {
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        return data.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
    }, [data.links, filteredNodes]);

    const contradictionNodeIds = useMemo(() => {
        const ids = new Set<string>();
        data.links.forEach(link => {
            if (link.type === 'contradiction') {
                ids.add(link.source);
                ids.add(link.target);
            }
        });
        return ids;
    }, [data.links]);

    // Simple Force-Directed Simulation
    useEffect(() => {
        if (filteredNodes.length === 0) return;
        
        const width = 800;
        const height = 600;
        const currentPos: Record<string, { x: number, y: number }> = {};
        
        // Initial random placement
        filteredNodes.forEach((node) => {
            currentPos[node.id] = { 
                x: width / 2 + (Math.random() - 0.5) * 300, 
                y: height / 2 + (Math.random() - 0.5) * 300 
            };
        });

        const iterations = 150;
        const k = Math.sqrt((width * height) / filteredNodes.length) * 0.8;
        let temp = 20;

        for (let iter = 0; iter < iterations; iter++) {
            const displacements: Record<string, { dx: number, dy: number }> = {};
            filteredNodes.forEach(n => displacements[n.id] = { dx: 0, dy: 0 });

            // Repulsion
            for (let i = 0; i < filteredNodes.length; i++) {
                for (let j = 0; j < filteredNodes.length; j++) {
                    if (i === j) continue;
                    const u = filteredNodes[i], v = filteredNodes[j];
                    const dx = currentPos[u.id].x - currentPos[v.id].x;
                    const dy = currentPos[u.id].y - currentPos[v.id].y;
                    const distSq = dx * dx + dy * dy || 0.01;
                    const dist = Math.sqrt(distSq);
                    const f = (k * k) / dist;
                    displacements[u.id].dx += (dx / dist) * f;
                    displacements[u.id].dy += (dy / dist) * f;
                }
            }

            // Attraction
            filteredLinks.forEach(link => {
                const uId = link.source, vId = link.target;
                const dx = currentPos[uId].x - currentPos[vId].x;
                const dy = currentPos[uId].y - currentPos[vId].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
                const f = (dist * dist) / k;
                const dxNorm = (dx / dist) * f;
                const dyNorm = (dy / dist) * f;
                displacements[uId].dx -= dxNorm;
                displacements[uId].dy -= dyNorm;
                displacements[vId].dx += dxNorm;
                displacements[vId].dy += dyNorm;
            });

            // Update
            filteredNodes.forEach(node => {
                const disp = displacements[node.id];
                const dist = Math.sqrt(disp.dx * disp.dx + disp.dy * disp.dy) || 0.01;
                currentPos[node.id].x += (disp.dx / dist) * Math.min(dist, temp);
                currentPos[node.id].y += (disp.dy / dist) * Math.min(dist, temp);
                currentPos[node.id].x = Math.max(80, Math.min(width - 80, currentPos[node.id].x));
                currentPos[node.id].y = Math.max(80, Math.min(height - 80, currentPos[node.id].y));
            });
            temp *= 0.98;
        }
        setPositions(currentPos);
    }, [filteredNodes, filteredLinks]);

    const handleTouchMove = (e: React.TouchEvent) => {
      if (draggingId) {
        const r = svgRef.current!.getBoundingClientRect();
        const touch = e.touches[0];
        setPositions(p => ({
          ...p,
          [draggingId]: {
            x: (touch.clientX - r.left) * (800 / r.width),
            y: (touch.clientY - r.top) * (600 / r.height)
          }
        }));
      }
    };

    return (
        <div ref={containerRef} className="bg-[#050505] rounded-none overflow-hidden relative h-full w-full border border-[#6e501a]/20">
            {/* HUD Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]"></div>
            
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b5892f 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <svg 
              ref={svgRef} 
              width="100%" height="100%" 
              viewBox="0 0 800 600" 
              className="cursor-crosshair touch-none"
              onMouseMove={(e) => { 
                if (draggingId) { 
                  const r = svgRef.current!.getBoundingClientRect(); 
                  setPositions(p => ({...p, [draggingId]: { x: (e.clientX - r.left) * (800/r.width), y: (e.clientY - r.top) * (600/r.height) }})); 
                } 
              }} 
              onMouseUp={() => setDraggingId(null)} 
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setDraggingId(null)}
            >
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#6e501a" /></marker>
                    <marker id="arrow-contradiction" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ef4444" /></marker>
                </defs>
                {filteredLinks.map((l, i) => {
                    const s = positions[l.source], e = positions[l.target]; if (!s || !e) return null;
                    const isContradiction = l.type === 'contradiction';
                    return (
                        <g key={i}>
                            <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke={isContradiction ? '#ef4444' : '#6e501a'} strokeWidth={isContradiction ? "2" : "1"} opacity="0.6" markerEnd={isContradiction ? "url(#arrow-contradiction)" : "url(#arrow)"} />
                            <foreignObject x={(s.x+e.x)/2 - 40} y={(s.y+e.y)/2 - 10} width="80" height="20">
                                <div className={`text-[7px] font-black text-center uppercase tracking-tighter ${isContradiction ? 'text-red-500 bg-red-950/40' : 'text-[#6e501a]'}`}>{l.label}</div>
                            </foreignObject>
                        </g>
                    );
                })}
                {filteredNodes.map(n => {
                    const p = positions[n.id]; if (!p) return null;
                    const isActive = activeNodeId === n.id;
                    const isContradiction = contradictionNodeIds.has(n.id);
                    const isBrady = !!n.bradyFlag;
                    return (
                        <g key={n.id} transform={`translate(${p.x}, ${p.y})`} onClick={() => onNodeClick(n)} onMouseDown={(e) => { e.stopPropagation(); setDraggingId(n.id); }} onTouchStart={(e) => { e.stopPropagation(); setDraggingId(n.id); }} className="cursor-pointer select-none">
                            {isBrady && <circle r="26" fill="transparent" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" className="animate-[spin_8s_linear_infinite]" />}
                            <circle r="20" fill="#050505" stroke={isActive ? '#b5892f' : (isContradiction ? '#ef4444' : (isBrady ? '#ef4444/60' : '#6e501a'))} strokeWidth={isActive ? "3" : "1"} />
                            <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                                <div className="flex justify-center" style={{color: isContradiction || isBrady ? '#ef4444' : '#b5892f'}}>
                                    {getNodeIcon(n.type, "w-5 h-5")}
                                </div>
                            </foreignObject>
                            <text y="35" fill={isContradiction || isBrady ? "#ff6b6b" : "#efefef"} fontSize="8" fontWeight="900" textAnchor="middle" className="uppercase tracking-widest pointer-events-none">{n.label}</text>
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
    const [filter, setFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const loadingSteps = [
        "Initalizing Neural Link...",
        "Scanning Semantic Vectors...",
        "Correlating Witness Testimonies...",
        "Identifying Brady Discrepancies...",
        "Finalizing Matrix Projection..."
    ];

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingStep(s => (s + 1) % loadingSteps.length);
            }, 3500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerateInternal = useCallback(async (b64: string, mime: string, name: string) => {
        setIsLoading(true);
        try {
            const res = await onGenerate(b64, mime, name);
            setResult(res);
        } catch (e) {
            console.error("Mapping fault:", e);
        } finally {
            setIsLoading(false);
        }
    }, [onGenerate]);

    useEffect(() => {
        if (initialData) handleGenerateInternal(initialData.b64, initialData.mime, initialData.name);
    }, [initialData, handleGenerateInternal]);

    const handleManualGenerate = async () => {
        if (!file) return; 
        const b64 = await new Promise<string>(r => { const rd = new FileReader(); rd.onload = () => r((rd.result as string).split(',')[1]); rd.readAsDataURL(file); });
        await handleGenerateInternal(b64, file.type, file.name);
    };

    const handleExportPNG = async () => {
        if (!containerRef.current) return;
        setIsExporting(true);
        setShowExportMenu(false);
        try {
            // @ts-ignore
            const canvas = await html2canvas(containerRef.current, { backgroundColor: '#050505', scale: 2 });
            const link = document.createElement('a');
            link.download = `NARRATIVE_MATRIX_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportSVG = () => {
        if (!svgRef.current) return;
        setShowExportMenu(false);
        const svgData = svgRef.current.outerHTML;
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `NARRATIVE_MATRIX_${new Date().getTime()}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (!result && !isLoading) {
        return (
            <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md flex justify-center items-center z-50 p-4">
                <div className="bg-[#121212] border border-[#6e501a] p-10 max-w-xl w-full text-center relative shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#b5892f]"></div>
                    <h2 className="text-3xl font-black text-[#efefef] tracking-tighter uppercase italic mb-6">Narrative Matrix Generator</h2>
                    <input type="file" accept="application/pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" id="f-mapper-manual" />
                    <label htmlFor="f-mapper-manual" className="block p-12 border border-dashed border-[#6e501a]/40 mb-10 cursor-pointer hover:bg-[#b5892f]/5 transition-colors group">
                        <BrainCircuitIcon className="w-16 h-16 text-[#6e501a] mx-auto mb-6 group-hover:text-[#b5892f] transition-colors" />
                        <span className="text-xs font-black text-[#e2c07d] uppercase tracking-widest">{file ? file.name : "Inject Discovery Dossier (PDF)"}</span>
                    </label>
                    <button onClick={handleManualGenerate} disabled={!file} className="w-full py-5 bg-[#b5892f] text-[#050505] font-black uppercase italic tracking-tighter text-xl hover:bg-[#e2c07d] transition-all disabled:opacity-20">Initialize Reconstruction</button>
                    <button onClick={onClose} className="mt-6 text-[#6e501a] text-[10px] font-black uppercase tracking-widest hover:text-[#efefef] transition-colors">Abort Reconstruction</button>
                </div>
            </div>
        );
    }

    if (isLoading) return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50 p-8 text-center">
            <div className="relative mb-12">
                <SpinnerIcon className="w-24 h-24 text-[#b5892f]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuitIcon className="w-8 h-8 text-[#b5892f] animate-pulse" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="text-[12px] font-black text-[#efefef] uppercase tracking-[0.8em]">{loadingSteps[loadingStep]}</div>
                <div className="text-[9px] font-black text-[#6e501a] uppercase tracking-[0.4em]">Node Cluster: 0x42_DNVR_DCO</div>
            </div>
            {/* Visual HUD progress bar */}
            <div className="w-64 h-1 bg-[#1a1a1a] mt-12 overflow-hidden border border-white/5">
                <div className="h-full bg-[#b5892f] animate-[loadingProgress_15s_linear_infinite]" style={{width: '30%'}}></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            <header className="p-4 lg:p-6 bg-[#121212] border-b border-[#6e501a]/30 flex justify-between items-center z-50">
                <div className="flex items-center gap-3 lg:gap-6">
                    <BrainCircuitIcon className="w-6 h-6 lg:w-8 lg:h-8 text-[#b5892f]" />
                    <h2 className="text-sm lg:text-2xl font-black text-[#efefef] uppercase italic tracking-tighter truncate max-w-[150px] lg:max-w-none">Narrative Matrix</h2>
                </div>
                <div className="flex gap-2 lg:gap-4 relative">
                    <div className="relative">
                      <button 
                        onClick={() => setShowExportMenu(!showExportMenu)} 
                        className="px-3 py-2 lg:px-6 lg:py-2 border border-[#6e501a] text-[#b5892f] text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-[#b5892f]/5 flex items-center gap-2"
                      >
                          {isExporting ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <DownloadIcon className="w-4 h-4" />}
                          <span className="hidden sm:inline">Export Analysis</span>
                          <ChevronDownIcon className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showExportMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#121212] border border-[#6e501a] shadow-2xl z-[60] py-2">
                           <button onClick={handleExportPNG} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase text-[#efefef] hover:bg-[#b5892f]/10 flex items-center gap-3">
                              <span className="w-1.5 h-1.5 bg-[#b5892f] rounded-full"></span>
                              Capture PNG (Image)
                           </button>
                           <button onClick={handleExportSVG} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase text-[#efefef] hover:bg-[#b5892f]/10 flex items-center gap-3 border-t border-[#6e501a]/10">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              Source SVG (Vector)
                           </button>
                        </div>
                      )}
                    </div>
                    <button onClick={onClose} className="p-2 text-[#6e501a] hover:text-[#efefef]"><CloseIcon className="w-6 h-6" /></button>
                </div>
            </header>

            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#6e501a]/20 flex flex-col bg-[#121212] max-h-[30vh] lg:max-h-none">
                    <div className="p-3 lg:p-4 bg-[#050505] border-b border-[#6e501a]/20 text-[9px] lg:text-[10px] font-black text-[#6e501a] uppercase tracking-widest">Temporal Sequence</div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {result?.timeline.map((e, i) => (
                            <div key={i} className={`p-4 border border-[#6e501a]/20 ${e.narrativeTrack === 'defense' ? 'bg-[#b5892f]/5 border-l-2 border-l-[#b5892f]' : (e.narrativeTrack === 'prosecution' ? 'border-l-2 border-l-red-500/50' : 'bg-[#050505]')}`}>
                                <div className="text-[9px] font-black text-[#6e501a] mb-1">{e.date}</div>
                                <p className="text-xs text-white leading-tight font-bold">{e.description}</p>
                            </div>
                        ))}
                    </div>
                    {/* Legend in Sidebar for Desktop */}
                    <div className="hidden lg:block p-4 border-t border-[#6e501a]/20 bg-[#050505]">
                        <h4 className="text-[8px] font-black text-[#6e501a] uppercase tracking-widest mb-3">Matrix Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[7px] font-black text-slate-500 uppercase"><div className="w-2 h-2 rounded-full border border-red-500 bg-red-950/40"></div> Contradiction</div>
                            <div className="flex items-center gap-2 text-[7px] font-black text-slate-500 uppercase"><div className="w-2 h-2 rounded-full border border-red-500 border-dashed"></div> Brady Material</div>
                            <div className="flex items-center gap-2 text-[7px] font-black text-slate-500 uppercase"><div className="w-2 h-2 rounded-full border border-[#b5892f]"></div> Active Entity</div>
                        </div>
                    </div>
                </aside>

                <main className="flex-grow flex flex-col relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 flex gap-1 lg:gap-2">
                        {['all', 'person', 'location', 'event'].map(t => (
                            <button key={t} onClick={() => setFilter(t)} className={`px-2 py-1.5 lg:px-4 lg:py-2 text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-[#b5892f] text-black' : 'bg-black/50 text-[#6e501a] border border-[#6e501a]/30'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow relative">
                      <GraphView data={result!} onNodeClick={setSelectedNode} activeNodeId={selectedNode?.id || null} svgRef={svgRef} containerRef={containerRef} filter={filter} />
                    </div>
                    
                    <div className="h-1/3 lg:h-64 bg-[#121212] border-t border-[#6e501a] flex flex-col lg:flex-row shadow-2xl z-20 overflow-hidden">
                        <div className="w-full lg:w-1/2 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[#6e501a]/10 overflow-y-auto custom-scrollbar">
                            <h3 className="text-[9px] lg:text-[10px] font-black text-[#b5892f] uppercase tracking-[0.4em] mb-3 lg:mb-4">Strategic Correlate</h3>
                            <p className="text-sm lg:text-lg text-white font-light italic leading-relaxed">"{result?.strategicAssessment}"</p>
                        </div>
                        <div className="w-full lg:w-1/2 p-6 lg:p-8 overflow-y-auto bg-[#050505] custom-scrollbar">
                            {selectedNode ? (
                                <div>
                                    <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                                        <div className="p-1.5 lg:p-2 bg-[#121212] border border-[#6e501a]/50 text-[#b5892f]">{getNodeIcon(selectedNode.type, "w-4 h-4 lg:w-6 lg:h-6")}</div>
                                        <h4 className="text-sm lg:text-xl font-black text-[#efefef] uppercase tracking-tighter italic">{selectedNode.label}</h4>
                                    </div>
                                    <p className="text-xs lg:text-sm text-slate-400 font-light mb-3 lg:mb-4 leading-relaxed">{selectedNode.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNode.bradyFlag && <EvidenceBadge tag={`Brady Alert: ${selectedNode.bradyFlag}`} />}
                                        {selectedNode.evidenceTags?.map((t, i) => <EvidenceBadge key={i} tag={t} />)}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#6e501a] text-[8px] lg:text-[10px] font-black uppercase tracking-widest italic opacity-20 text-center">Select node for deep evidence drill-down</div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes loadingProgress { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #6e501a; }
            `}</style>
        </div>
    );
}
