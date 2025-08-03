import React from 'react';
import { SummaryResult } from '../utils/textSummarization';

interface DatasetAnalyticsProps {
  results: SummaryResult[];
  originalText: string;
  filename: string;
}

interface DatasetMetrics {
  documentCount: number;
  totalWords: number;
  totalSentences: number;
  avgWordsPerSentence: number;
  vocabularySize: number;
  topWords: { word: string; count: number }[];
  readabilityScore: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  qualityMetricsComparison: {
    method: string;
    coverage: number;
    coherence: number;
    diversity: number;
    confidence: number;
  }[];
}

const DatasetAnalytics: React.FC<DatasetAnalyticsProps> = ({ 
  results, 
  originalText, 
  filename 
}) => {
  const estimateSyllables = (word: string): number => {
    // Simple syllable estimation
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const calculateMetrics = (): DatasetMetrics => {
    // Basic text analysis
    const words: string[] = originalText.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const vocabulary = new Set(words);
    
    // Word frequency analysis
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 3) { // Filter short words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Simple readability score (Flesch Reading Ease approximation)
    const avgSentenceLength = words.length / sentences.length;
    const totalSyllables = words.reduce((sum: number, word: string) => sum + estimateSyllables(word), 0);
    const avgSyllables = totalSyllables / words.length;
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables)
    ));

    // Sentiment distribution from results
    let sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    if (results.length > 0) {
      results.forEach(result => {
        const sentiment = result.qualityMetrics.sentiment;
        if (sentiment.comparative > 0.1) sentimentDistribution.positive++;
        else if (sentiment.comparative < -0.1) sentimentDistribution.negative++;
        else sentimentDistribution.neutral++;
      });
    }

    // Quality metrics comparison
    const qualityMetricsComparison = results.map(result => ({
      method: result.method,
      coverage: result.qualityMetrics.coverage,
      coherence: result.qualityMetrics.coherence,
      diversity: result.qualityMetrics.diversity,
      confidence: result.qualityMetrics.confidence
    }));

    return {
      documentCount: 1, // Single document for now
      totalWords: words.length,
      totalSentences: sentences.length,
      avgWordsPerSentence: Math.round(words.length / sentences.length * 10) / 10,
      vocabularySize: vocabulary.size,
      topWords,
      readabilityScore: Math.round(readabilityScore),
      sentimentDistribution,
      qualityMetricsComparison
    };
  };

  const metrics = calculateMetrics();

  if (!originalText || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-grey-200 p-6">
      <h2 className="text-xl font-bold text-black mb-6">Dataset Analytics</h2>
      
      {/* Document Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalWords.toLocaleString()}</div>
          <div className="text-sm text-blue-700">Total Words</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics.totalSentences}</div>
          <div className="text-sm text-green-700">Total Sentences</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{metrics.vocabularySize.toLocaleString()}</div>
          <div className="text-sm text-purple-700">Unique Words</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{metrics.avgWordsPerSentence}</div>
          <div className="text-sm text-orange-700">Avg Words/Sentence</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vocabulary Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Top Keywords</h3>
          <div className="space-y-2">
            {metrics.topWords.map((item, index) => (
              <div key={item.word} className="flex justify-between items-center p-2 bg-grey-50 rounded">
                <span className="font-medium text-grey-800">#{index + 1} {item.word}</span>
                <span className="text-grey-600">{item.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Distribution */}
        {results.length > 0 && results[0].visualizationData.topicClusters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Topic Clusters</h3>
            <div className="space-y-3">
              {results[0].visualizationData.topicClusters.map((cluster, index) => (
                <div key={cluster.id} className="p-3 bg-grey-50 rounded">
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: cluster.color }}
                    ></div>
                    <span className="font-medium text-grey-800">Cluster {index + 1}</span>
                  </div>
                  <div className="text-xs text-grey-600 mb-2">
                    <strong>Keywords:</strong> {cluster.keywords.join(', ')}
                  </div>
                  <div className="text-xs text-grey-500">
                    {cluster.sentences.length} related sentences
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Characteristics */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Document Characteristics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-grey-50 rounded">
              <span className="text-grey-700">Readability Score</span>
              <div className="text-right">
                <div className="font-semibold text-grey-900">{metrics.readabilityScore}/100</div>
                <div className="text-xs text-grey-500">
                  {metrics.readabilityScore >= 60 ? 'Easy' : 
                   metrics.readabilityScore >= 30 ? 'Moderate' : 'Difficult'}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-grey-50 rounded">
              <div className="text-grey-700 mb-2">Vocabulary Richness</div>
              <div className="w-full bg-grey-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (metrics.vocabularySize / metrics.totalWords) * 200)}%` }}
                ></div>
              </div>
              <div className="text-xs text-grey-500 mt-1">
                {((metrics.vocabularySize / metrics.totalWords) * 100).toFixed(1)}% unique words
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics Comparison */}
      {metrics.qualityMetricsComparison.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-black mb-4">Summarization Quality Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-grey-50">
                  <th className="text-left p-3 font-semibold text-grey-700">Method</th>
                  <th className="text-center p-3 font-semibold text-grey-700">Coverage</th>
                  <th className="text-center p-3 font-semibold text-grey-700">Coherence</th>
                  <th className="text-center p-3 font-semibold text-grey-700">Diversity</th>
                  <th className="text-center p-3 font-semibold text-grey-700">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {metrics.qualityMetricsComparison.map((metric, index) => (
                  <tr key={metric.method} className={index % 2 === 0 ? 'bg-white' : 'bg-grey-25'}>
                    <td className="p-3 font-medium text-grey-900">{metric.method}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.coverage >= 0.7 ? 'bg-green-100 text-green-800' :
                        metric.coverage >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(metric.coverage * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.coherence >= 0.7 ? 'bg-green-100 text-green-800' :
                        metric.coherence >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(metric.coherence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.diversity >= 0.7 ? 'bg-green-100 text-green-800' :
                        metric.diversity >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(metric.diversity * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.confidence >= 0.7 ? 'bg-green-100 text-green-800' :
                        metric.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(metric.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-grey-500">
            <strong>Coverage:</strong> Ratio of important concepts captured • 
            <strong> Coherence:</strong> Flow between sentences • 
            <strong> Diversity:</strong> Vocabulary richness • 
            <strong> Confidence:</strong> Overall quality score
          </div>
        </div>
      )}

      {/* Document Metadata */}
      <div className="mt-8 pt-6 border-t border-grey-200">
        <h3 className="text-lg font-semibold text-black mb-4">Document Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-grey-600">Filename:</span>
            <span className="text-grey-900 font-medium">{filename || 'Untitled'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-grey-600">Processing Methods:</span>
            <span className="text-grey-900 font-medium">{results.length} methods</span>
          </div>
          <div className="flex justify-between">
            <span className="text-grey-600">Avg Processing Time:</span>
            <span className="text-grey-900 font-medium">
              {results.length > 0 ? 
                Math.round(results.reduce((sum, r) => sum + r.processingTime, 0) / results.length) : 0}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-grey-600">Text Complexity:</span>
            <span className="text-grey-900 font-medium">
              {metrics.readabilityScore >= 60 ? 'Low' : 
               metrics.readabilityScore >= 30 ? 'Medium' : 'High'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetAnalytics;