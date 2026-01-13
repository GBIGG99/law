import React, { useState, useCallback } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
}

export default function CopyButton({ 
  textToCopy, 
  className, 
  label = "Copy", 
  copiedLabel = "Copied!" 
}: CopyButtonProps): React.ReactNode {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (isCopied) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    }
  }, [textToCopy, isCopied]);

  const defaultClasses = "inline-flex items-center justify-center gap-x-2 px-3 py-1.5 border border-slate-600 text-sm font-semibold rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all";
  const successClasses = "disabled:bg-green-700/80 disabled:text-green-100 disabled:border-green-600/80";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isCopied}
      className={`${defaultClasses} ${isCopied ? successClasses : ''} ${className || ''}`}
      aria-live="polite"
      title={`Copy to clipboard`}
    >
      {isCopied ? (
        <>
          <CheckIcon className="w-1 h-1" />
          {copiedLabel}
        </>
      ) : (
        <>
          <ClipboardIcon className="w-1 h-1" />
          {label}
        </>
      )}
    </button>
  );
}
