
import React from 'react';

interface AlertIconProps {
  className?: string;
}

export default function AlertIcon({ className = 'w-5 h-5' }: AlertIconProps): React.ReactNode {
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
      <path d="M12 2L2 22h20L12 2z" />
      <path d="M12 9v6" />
      <path d="M12 18h.01" />
    </svg>
  );
}
