import React from 'react';

interface InfoButtonProps {
  onClick: () => void;
}

const InfoButton: React.FC<InfoButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 bg-white border border-grey-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-2 px-4 py-2 group"
      title="Click to learn more"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none"
        className="text-grey-600 group-hover:text-grey-800 transition-colors flex-shrink-0"
      >
        <circle 
          cx="8" 
          cy="8" 
          r="7" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
        <path 
          d="M8 12V8M8 4h.01" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm text-grey-600 group-hover:text-grey-800 transition-colors whitespace-nowrap">
        More about this experiment
      </span>
    </button>
  );
};

export default InfoButton;
