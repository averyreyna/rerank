import React from 'react';
import { SummaryResult } from '../utils/textSummarization';

interface SummaryResultsProps {
  results: SummaryResult[];
  filename: string;
}

const SummaryResults: React.FC<SummaryResultsProps> = ({ results, filename }) => {
  if (results.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      <div className="text-sm text-gray-500 mb-4">
        Results for: <span className="font-medium">{filename}</span>
      </div>
      
      {results.map((result, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{result.method}</h3>
            <span className="text-xs text-gray-500">
              {result.processingTime}ms
            </span>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {result.summary}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 select-none">
                View extracted sentences ({result.sentences.length})
              </summary>
              <div className="mt-3 space-y-2">
                {result.sentences.map((sentence, sentIndex) => (
                  <div key={sentIndex} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                    {sentence}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryResults;
