
import React from 'react';

export const RockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M7 13.5l5 5" />
        <path d="M12 18.5l5-5" />
        <path d="M12 11.5l-5-5" />
        <path d="M17 6.5l-5 5" />
    </svg>
);

export const PaperIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10.5V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
        <path d="M14 2v6h6" />
        <path d="M10 14h-1" />
        <path d="M15 14h-1" />
        <path d="M10 17h-1" />
        <path d="M15 17h-1" />
    </svg>
);

export const ScissorsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="3" />
        <circle cx="17" cy="7" r="3" />
        <line x1="20" y1="17" x2="10" y2="7" />
        <line x1="4" y1="17" x2="14" y2="7" />
    </svg>
);
