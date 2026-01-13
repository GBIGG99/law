import React from 'react';

interface GavelIconProps {
  className?: string;
}

const GavelIcon: React.FC<GavelIconProps> = ({ className = 'w-5 h-5' }) => {
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
      <path d="M14 10H2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h12v-6z"></path>
      <path d="M22 2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2V2h-2z"></path>
      <path d="M14 16c0 4.418 3.582 8 8 8s8-3.582 8-8v-2H6v2z"></path>
    </svg>
  );
};

export default GavelIcon;