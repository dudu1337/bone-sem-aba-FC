import React from 'react';

interface IconProps {
  className?: string;
}

const PalmTreeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 21v-4.5a3 3 0 00-6 0V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 016.92 14.08L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 00-6.92 14.08L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15.75s1.25-2.75 5.25-3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.75s-1.25-2.75-5.25-3.75" />
    </svg>
);

export default PalmTreeIcon;
