import React from 'react';
import { QualityMetrics as QualityMetricsType } from '../utils/textSummarization';

interface QualityMetricsProps {
  metrics: QualityMetricsType;
}

const QualityMetrics: React.FC<QualityMetricsProps> = ({ metrics }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentDisplay = () => {
    const { score, comparative } = metrics.sentiment;
    if (comparative > 0.1) return { text: 'Positive', color: 'text-green-600' };
    if (comparative < -0.1) return { text: 'Negative', color: 'text-red-600' };
    return { text: 'Neutral', color: 'text-grey-600' };
  };

  const sentiment = getSentimentDisplay();

  return (
    <div className="bg-white p-4 rounded-lg border border-grey-200">
      <h4 className="text-sm font-semibold text-grey-800 mb-3">Quality Analysis</h4>
      
      {/* Overall Confidence Score */}
      <div className="mb-4 p-3 rounded-lg bg-grey-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-grey-700">Overall Confidence</span>
          <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(metrics.confidence)}`}>
            {(metrics.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-grey-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics.confidence)}`}
            style={{ width: `${metrics.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-grey-800">{(metrics.coverage * 100).toFixed(0)}%</div>
          <div className="text-xs text-grey-600">Coverage</div>
          <div className="text-xs text-grey-500 mt-1">Content representation</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-grey-800">{(metrics.coherence * 100).toFixed(0)}%</div>
          <div className="text-xs text-grey-600">Coherence</div>
          <div className="text-xs text-grey-500 mt-1">Sentence flow</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-grey-800">{(metrics.diversity * 100).toFixed(0)}%</div>
          <div className="text-xs text-grey-600">Diversity</div>
          <div className="text-xs text-grey-500 mt-1">Vocabulary richness</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${sentiment.color}`}>{sentiment.text}</div>
          <div className="text-xs text-grey-600">Sentiment</div>
          <div className="text-xs text-grey-500 mt-1">({metrics.sentiment.comparative.toFixed(2)})</div>
        </div>
      </div>

      {/* Sentiment Details */}
      {(metrics.sentiment.positive.length > 0 || metrics.sentiment.negative.length > 0) && (
        <div className="border-t border-grey-100 pt-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {metrics.sentiment.positive.length > 0 && (
              <div>
                <span className="font-medium text-green-600">Positive:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {metrics.sentiment.positive.slice(0, 3).map((word, index) => (
                    <span key={index} className="bg-green-100 text-green-700 px-1 py-0.5 rounded">
                      {word}
                    </span>
                  ))}
                  {metrics.sentiment.positive.length > 3 && (
                    <span className="text-green-600">+{metrics.sentiment.positive.length - 3}</span>
                  )}
                </div>
              </div>
            )}
            {metrics.sentiment.negative.length > 0 && (
              <div>
                <span className="font-medium text-red-600">Negative:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {metrics.sentiment.negative.slice(0, 3).map((word, index) => (
                    <span key={index} className="bg-red-100 text-red-700 px-1 py-0.5 rounded">
                      {word}
                    </span>
                  ))}
                  {metrics.sentiment.negative.length > 3 && (
                    <span className="text-red-600">+{metrics.sentiment.negative.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityMetrics;