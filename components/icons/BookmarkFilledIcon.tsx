import React from 'react';

interface BookmarkFilledIconProps {
  className?: string;
}

export default function BookmarkFilledIcon({ className = 'w-5 h-5' }: BookmarkFilledIconProps): React.ReactNode {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path 
        fillRule="evenodd" 
        d="M6.002 2.8a2 2 0 012-2h8a2 2 0 012 2v18.283a1 1 0 01-1.574.82L12 18.232l-4.426 3.67a1 1 0 01-1.574-.82V2.8z" 
        clipRule="evenodd" 
      />
    </svg>
  );
}
