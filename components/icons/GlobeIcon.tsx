import React from 'react';

interface GlobeIconProps {
  className?: string;
}

export default function GlobeIcon({ className = 'w-5 h-5' }: GlobeIconProps): React.ReactNode {
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
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.707-.707a2 2 0 012.828 0l.707.707M15.707 4.5l-.707-.707a2 2 0 00-2.828 0l-.707.707M7.707 20.5l.707.707a2 2 0 002.828 0l.707-.707M15.707 20.5l-.707.707a2 2 0 01-2.828 0l-.707-.707M12 21a9 9 0 100-18 9 9 0 000 18z"
      />
    </svg>
  );
}