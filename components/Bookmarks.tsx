import React from 'react';
import { type Bookmark } from '../types';
import EyeIcon from './icons/EyeIcon';
import TrashIcon from './icons/TrashIcon';
import BookmarkFilledIcon from './icons/BookmarkFilledIcon';

interface BookmarksProps {
  bookmarks: Bookmark[];
  onView: (bookmark: Bookmark) => void;
  onDelete: (key: string) => void;
}

export default function Bookmarks({ bookmarks, onView, onDelete }: BookmarksProps): React.ReactNode {
  if (bookmarks.length === 0) return null;

  return (
    <div className="tech-card p-6 flex flex-col gap-6">
      <div className="bracket-tl"></div><div className="bracket-tr"></div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Encrypted Vault</h3>
        <p className="text-[9px] font-mono-legal text-[#5e5239] uppercase tracking-[0.3em]">Stored Assets: {bookmarks.length}</p>
      </div>

      <div className="flex flex-col gap-3">
        {bookmarks.slice(0, 5).map(bookmark => (
          <div key={bookmark.key} className="p-3 bg-[#050505] border border-[#5e5239]/30 flex justify-between items-center group hover:border-[#a18d66] transition-colors">
            <div className="flex flex-col gap-1 min-w-0">
               <span className="text-[10px] text-[#999999] font-bold truncate">
                 {bookmark.type === 'search' ? bookmark.params.query : 'Dossier Analysis'}
               </span>
               <span className="text-[8px] font-mono-legal text-[#5e5239]">{new Date(bookmark.savedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => onView(bookmark)} className="p-1.5 text-[#5e5239] hover:text-[#d1c19d] transition-colors"><EyeIcon className="w-4 h-4" /></button>
               <button onClick={() => onDelete(bookmark.key)} className="p-1.5 text-[#5e5239] hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}