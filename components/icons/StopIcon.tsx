import React from 'react';

interface StopIconProps {
  className?: string;
}

export default function StopIcon({ className = 'w-5 h-5' }: StopIconProps): React.ReactNode {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    </svg>
  );
}