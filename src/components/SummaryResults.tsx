import React, { useState } from 'react';
import { SummaryResult } from '../utils/textSummarization';
import QualityMetrics from './QualityMetrics';
import SentenceGraph from './SentenceGraph';
import TopicClusters from './TopicClusters';

interface SummaryResultsProps {
  results: SummaryResult[];
  filename: string;
}

const SummaryResults: React.FC<SummaryResultsProps> = ({ results, filename }) => {
  const [activeTab, setActiveTab] = useState<'summaries' | 'analysis' | 'visualization'>('summaries');

  if (results.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 space-y-6">
      <div className="text-sm text-grey-500 mb-4">
        Results for: <span className="font-medium">{filename}</span>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-grey-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'summaries', label: 'Summaries', count: results.length },
            { id: 'analysis', label: 'Quality Analysis', count: null },
            { id: 'visualization', label: 'Visualizations', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-grey-600 text-grey-800'
                  : 'border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-1 text-xs bg-grey-100 text-grey-600 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="bg-white border border-grey-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-grey-800">{result.method}</h3>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    result.qualityMetrics.confidence >= 0.7 ? 'bg-green-100 text-green-700' :
                    result.qualityMetrics.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {(result.qualityMetrics.confidence * 100).toFixed(0)}% confidence
                  </span>
                  <span className="text-xs text-grey-500">
                    {result.processingTime}ms
                  </span>
                </div>
              </div>
              
              <div className="prose prose-grey max-w-none">
                <p className="text-grey-700 leading-relaxed">
                  {result.summary}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-grey-100">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-grey-600 hover:text-grey-800 select-none">
                    View extracted sentences ({result.sentences.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {result.sentences.map((sentence, sentIndex) => (
                      <div key={sentIndex} className="text-sm text-grey-600 pl-4 border-l-2 border-grey-200">
                        {sentence}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-grey-800 mb-3">{result.method}</h3>
              <QualityMetrics metrics={result.qualityMetrics} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'visualization' && (
        <div className="space-y-8">
          {results.map((result, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-grey-800 mb-4">{result.method} - Visualizations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SentenceGraph nodes={result.visualizationData.sentenceGraph} />
                <TopicClusters clusters={result.visualizationData.topicClusters} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummaryResults;
