import React from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-400 hover:text-grey-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">About Rerank</h2>
          
          <p className="text-grey-600 mb-4 leading-relaxed">
            Rerank is an experimental tool that helps researchers analyze and visualize their 
            research topics across different dimensions of methodology and novelty.
          </p>

          <p className="text-grey-600 mb-4 leading-relaxed">
            The tool uses AI to analyze research topics and place them on a graph, helping you 
            understand:
          </p>

          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-grey-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-grey-600">The balance between quantitative and qualitative approaches</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-grey-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-grey-600">The relationship between traditional and novel methodologies</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-grey-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-grey-600">Potential gaps in research methodology</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-grey-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-grey-600">Opportunities for innovative approaches</span>
            </li>
          </ul>

          <p className="text-grey-600 leading-relaxed">
            You can add your own research topics, see AI predictions, and even make your own 
            predictions about where topics should be placed on the graph.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
