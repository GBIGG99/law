import React from 'react';

interface SparklesIconProps {
  className?: string;
}

export default function SparklesIcon({ className = 'w-5 h-5' }: SparklesIconProps): React.ReactNode {
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
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 4.293m5.707 7.293a1 1 0 010 1.414L12 16.414l-2.293-2.293a1 1 0 011.414-1.414L12 13.586l2.293-2.293a1 1 0 011.414 0z"
      />
    </svg>
  );
}