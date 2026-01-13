import React from 'react';

interface BookmarkIconProps {
  className?: string;
}

export default function BookmarkIcon({ className = 'w-5 h-5' }: BookmarkIconProps): React.ReactNode {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
      />
    </svg>
  );
}
