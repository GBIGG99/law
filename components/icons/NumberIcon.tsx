import React from 'react';

interface NumberIconProps {
  className?: string;
}

const NumberIcon: React.FC<NumberIconProps> = ({ className = 'w-5 h-5' }) => {
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
      <path d="M10 13a4 4 0 0 0 0-8H6v16"></path>
      <path d="M14 13a4 4 0 0 1 0-8h4v16"></path>
    </svg>
  );
};

export default NumberIcon;