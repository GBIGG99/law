import React from 'react';
import { TimelineEvent } from '../types';
import CalendarIcon from './icons/CalendarIcon'; 
import GavelIcon from './icons/GavelIcon';
import DocumentIcon from './icons/DocumentIcon';
import SparklesIcon from './icons/SparklesIcon';

interface TimelineChartProps {
    events: TimelineEvent[];
    isLoading: boolean;
}

const getEventStyles = (type: TimelineEvent['type']) => {
    switch (type) {
        case 'filing': return { 
            icon: <DocumentIcon className="w-6 h-6 text-white/20" />,
            accent: 'border-l-white/10',
            tag: 'DOC_FILING'
        };
        case 'court_date': return {
            icon: <CalendarIcon className="w-6 h-6 text-white" />,
            accent: 'border-l-white',
            tag: 'SESS_PROTOCOL'
        };
        case 'ruling': return {
            icon: <GavelIcon className="w-6 h-6 text-white/60" />,
            accent: 'border-l-white/60',
            tag: 'FINAL_DECISION'
        };
        default: return {
            icon: <SparklesIcon className="w-6 h-6 text-white/10" />,
            accent: 'border-l-white/5',
            tag: 'DATA_NODE'
        };
    }
}

const getTrackClasses = (track?: 'prosecution' | 'defense' | 'undisputed') => {
    switch (track) {
        case 'prosecution':
            return 'bg-gradient-to-r from-red-950/20 to-[#050505] border-red-900/30';
        case 'defense':
            return 'bg-gradient-to-r from-blue-950/20 to-[#050505] border-blue-900/30';
        case 'undisputed':
            return 'bg-gradient-to-r from-gray-800/20 to-[#050505] border-white/10';
        default:
            return 'bg-white/5 border-white/10';
    }
};

const getTrackLabel = (track?: 'prosecution' | 'defense' | 'undisputed') => {
    if (!track) return null;
    const colors = {
        prosecution: 'text-red-500/60 border-red-500/20 bg-red-500/5',
        defense: 'text-blue-400/60 border-blue-400/20 bg-blue-400/5',
        undisputed: 'text-gray-400/60 border-gray-400/20 bg-gray-400/5'
    };
    return (
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 border rounded-sm ${colors[track]}`}>
            {track}_vector
        </span>
    );
};

export default function TimelineChart({ events, isLoading }: TimelineChartProps): React.ReactNode {
    if (isLoading) return null;
    if (!events || events.length === 0) return null;

    return (
        <div className="relative">
            <div className="flex items-center gap-10 mb-20 page-break-avoid">
                <div className="p-8 bg-white text-black shadow-2xl border border-white/20 timeline-node">
                    <CalendarIcon className="w-12 h-12 no-print" />
                    <span className="hidden pdf-only text-xs font-black">CHRONOLOGY</span>
                </div>
                <div>
                    <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Temporal<br/>Vector Map</h4>
                    <p className="etched-label mt-3 opacity-40">Chronological Data Sequence</p>
                </div>
            </div>
            
            <div className="relative pl-20 border-l-2 border-white/5 space-y-24 ml-10">
                {events.map((event, index) => {
                    const styles = getEventStyles(event.type);
                    const trackClasses = getTrackClasses(event.narrativeTrack);
                    
                    return (
                        <div key={index} className="relative group page-break-avoid">
                            <div className="absolute -left-[101px] top-0 w-20 h-20 flex items-center justify-center bg-[#050505] border border-white/10 text-white font-mono text-2xl font-black z-10 group-hover:border-white transition-all shadow-2xl timeline-node">
                                {index + 1}
                            </div>
                            
                            <div className="flex items-center justify-between gap-10 mb-8 max-w-4xl">
                                <div className="flex items-center gap-10">
                                    <span className="font-mono font-black text-sm text-white bg-white/5 border border-white/10 px-8 py-3 tracking-widest timeline-node">
                                        {event.date}
                                    </span>
                                    <div className="flex items-center gap-5">
                                        <div className="no-print">{styles.icon}</div>
                                        <span className="etched-label text-[10px] opacity-20 group-hover:opacity-100 transition-opacity font-black section-index-label">
                                            {styles.tag}
                                        </span>
                                    </div>
                                </div>
                                {getTrackLabel(event.narrativeTrack)}
                            </div>

                            <div className={`p-12 border group-hover:bg-white/[0.08] transition-all border-l-[12px] shadow-inner ${trackClasses} ${styles.accent} ${event.narrativeTrack === 'prosecution' ? 'adversarial-move' : event.narrativeTrack === 'defense' ? 'defense-counter' : ''}`}>
                                <p className="text-3xl text-white font-extralight italic leading-relaxed tracking-tight max-w-4xl">
                                    "{event.description}"
                                </p>
                                {event.citation && (
                                    <p className="mt-10 text-[9px] text-white/20 font-mono uppercase tracking-[0.5em] border-t border-white/5 pt-8 font-black section-index-label">
                                        REF_BLOCK_ID: <span className="text-white/50">{event.citation}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}