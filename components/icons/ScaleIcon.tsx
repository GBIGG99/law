
import React from 'react';

interface ScaleIconProps {
  className?: string;
}

export default function ScaleIcon({ className = 'w-5 h-5' }: ScaleIconProps): React.ReactNode {
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
      <path d="M12 3v18" />
      <path d="M6 12l-3-3 3-3" />
      <path d="M18 12l3-3-3-3" />
      <path d="M6 6h12" />
      <path d="M6 12h12" />
      <rect x="2" y="12" width="8" height="6" rx="1" />
      <rect x="14" y="12" width="8" height="6" rx="1" />
    </svg>
  );
}
