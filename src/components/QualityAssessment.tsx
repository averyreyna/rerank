import React from 'react';
import { SummaryResult } from '../utils/textSummarization';

interface QualityAssessmentProps {
  results: SummaryResult[];
  originalText: string;
}

interface AgreementAnalysis {
  overallAgreement: number;
  pairwiseAgreements: {
    methods: string[];
    similarity: number;
    confidence: 'high' | 'medium' | 'low';
  }[];
  consensusStrength: number;
  disagreementAreas: string[];
}

interface QualityIndicators {
  methodConfidence: {
    method: string;
    confidence: number;
    reliability: 'high' | 'medium' | 'low';
    issues: string[];
  }[];
  consistencyScore: number;
  outlierDetection: {
    method: string;
    isOutlier: boolean;
    deviation: number;
  }[];
}

const QualityAssessment: React.FC<QualityAssessmentProps> = ({ 
  results, 
  originalText 
}) => {
  // Calculate cosine similarity between two texts
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const allWords = Array.from(new Set([...words1, ...words2]));
    
    const vector1 = allWords.map(word => words1.filter(w => w === word).length);
    const vector2 = allWords.map(word => words2.filter(w => w === word).length);
    
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  };

  // Calculate Jaccard similarity for sentence overlap
  const calculateJaccardSimilarity = (sentences1: string[], sentences2: string[]): number => {
    const set1 = new Set(sentences1.map(s => s.toLowerCase().trim()));
    const set2 = new Set(sentences2.map(s => s.toLowerCase().trim()));
    
    const intersection = new Set();
    set1.forEach(x => {
      if (set2.has(x)) {
        intersection.add(x);
      }
    });
    
    const union = new Set();
    set1.forEach(x => union.add(x));
    set2.forEach(x => union.add(x));
    
    return union.size > 0 ? intersection.size / union.size : 0;
  };

  // Analyze inter-method agreement
  const analyzeAgreement = (): AgreementAnalysis => {
    if (results.length < 2) {
      return {
        overallAgreement: 0,
        pairwiseAgreements: [],
        consensusStrength: 0,
        disagreementAreas: ['Insufficient methods for comparison']
      };
    }

    const pairwiseAgreements = [];
    let totalSimilarity = 0;
    let comparisons = 0;

    // Calculate pairwise similarities
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const textSimilarity = calculateSimilarity(results[i].summary, results[j].summary);
        const sentenceSimilarity = calculateJaccardSimilarity(results[i].sentences, results[j].sentences);
        const avgSimilarity = (textSimilarity + sentenceSimilarity) / 2;
        
        const confidence: 'high' | 'medium' | 'low' = avgSimilarity > 0.7 ? 'high' : avgSimilarity > 0.4 ? 'medium' : 'low';
        
        pairwiseAgreements.push({
          methods: [results[i].method, results[j].method],
          similarity: Math.round(avgSimilarity * 100) / 100,
          confidence
        });
        
        totalSimilarity += avgSimilarity;
        comparisons++;
      }
    }

    const overallAgreement = comparisons > 0 ? totalSimilarity / comparisons : 0;
    
    // Identify disagreement areas
    const disagreementAreas: string[] = [];
    const lowAgreements = pairwiseAgreements.filter(p => p.confidence === 'low');
    
    if (lowAgreements.length > 0) {
      disagreementAreas.push(`Low agreement between ${lowAgreements.map(p => p.methods.join(' vs ')).join(', ')}`);
    }
    
    if (overallAgreement < 0.3) {
      disagreementAreas.push('Methods produce significantly different summaries');
    }
    
    // Calculate consensus strength
    const highAgreements = pairwiseAgreements.filter(p => p.confidence === 'high').length;
    const consensusStrength = comparisons > 0 ? highAgreements / comparisons : 0;

    return {
      overallAgreement: Math.round(overallAgreement * 100) / 100,
      pairwiseAgreements,
      consensusStrength: Math.round(consensusStrength * 100) / 100,
      disagreementAreas: disagreementAreas.length > 0 ? disagreementAreas : ['No significant disagreements detected']
    };
  };

  // Analyze quality indicators
  const analyzeQualityIndicators = (): QualityIndicators => {
    const methodConfidence = results.map(result => {
      const issues: string[] = [];
      let confidence = result.qualityMetrics.confidence;
      
      // Adjust confidence based on various factors
      if (result.qualityMetrics.coverage < 0.5) {
        issues.push('Low content coverage');
        confidence *= 0.8;
      }
      
      if (result.qualityMetrics.coherence < 0.4) {
        issues.push('Poor sentence coherence');
        confidence *= 0.9;
      }
      
      if (result.qualityMetrics.diversity < 0.3) {
        issues.push('Limited vocabulary diversity');
        confidence *= 0.95;
      }
      
      if (result.processingTime > 5000) {
        issues.push('Unusually long processing time');
      }
      
      // Special considerations for different methods
      if (result.method === 'BART' && result.summary.length < 50) {
        issues.push('Unusually short BART summary');
        confidence *= 0.9;
      }
      
      if (result.method.includes('Fallback')) {
        issues.push('API fallback mode used');
        confidence *= 0.7;
      }
      
      const reliability: 'high' | 'medium' | 'low' = confidence > 0.7 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
      
      return {
        method: result.method,
        confidence: Math.round(confidence * 100) / 100,
        reliability,
        issues: issues.length > 0 ? issues : ['No issues detected']
      };
    });

    // Calculate consistency score
    const confidenceValues = methodConfidence.map(m => m.confidence);
    const avgConfidence = confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length;
    const variance = confidenceValues.reduce((sum, val) => sum + Math.pow(val - avgConfidence, 2), 0) / confidenceValues.length;
    const consistencyScore = Math.max(0, 1 - variance);

    // Detect outliers
    const outlierDetection = methodConfidence.map(method => {
      const deviation = Math.abs(method.confidence - avgConfidence);
      return {
        method: method.method,
        isOutlier: deviation > 0.2,
        deviation: Math.round(deviation * 100) / 100
      };
    });

    return {
      methodConfidence,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      outlierDetection
    };
  };

  const agreementAnalysis = analyzeAgreement();
  const qualityIndicators = analyzeQualityIndicators();

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-grey-200 p-6">
      <h2 className="text-xl font-bold text-black mb-6">Quality Assessment Tools</h2>
      
      {/* Overall Quality Score */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((agreementAnalysis.overallAgreement + qualityIndicators.consistencyScore) * 50)}%
            </div>
            <div className="text-sm text-blue-700">Overall Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(agreementAnalysis.overallAgreement * 100)}%
            </div>
            <div className="text-sm text-purple-700">Method Agreement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(qualityIndicators.consistencyScore * 100)}%
            </div>
            <div className="text-sm text-green-700">Consistency Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inter-Method Agreement */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Inter-Method Agreement</h3>
          <div className="space-y-3">
            {agreementAnalysis.pairwiseAgreements.map((agreement, index) => (
              <div key={index} className="p-3 bg-grey-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-grey-800">
                    {agreement.methods.join(' vs ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    agreement.confidence === 'high' ? 'bg-green-100 text-green-800' :
                    agreement.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(agreement.similarity * 100)}% similarity
                  </span>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      agreement.confidence === 'high' ? 'bg-green-500' :
                      agreement.confidence === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${agreement.similarity * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">Consensus Analysis</h4>
            <div className="text-sm text-blue-700">
              <div>Consensus Strength: {Math.round(agreementAnalysis.consensusStrength * 100)}%</div>
              <div className="mt-2">
                <strong>Areas of Disagreement:</strong>
                <ul className="list-disc list-inside mt-1">
                  {agreementAnalysis.disagreementAreas.map((area, index) => (
                    <li key={index} className="text-xs">{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Method Confidence & Reliability */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Method Confidence & Reliability</h3>
          <div className="space-y-3">
            {qualityIndicators.methodConfidence.map((method, index) => (
              <div key={index} className="p-3 bg-grey-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-grey-800">{method.method}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      method.reliability === 'high' ? 'bg-green-100 text-green-800' :
                      method.reliability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {method.reliability}
                    </span>
                    <span className="text-sm font-semibold text-grey-700">
                      {Math.round(method.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      method.reliability === 'high' ? 'bg-green-500' :
                      method.reliability === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${method.confidence * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-grey-600">
                  <strong>Issues:</strong> {method.issues.join(', ')}
                </div>
              </div>
            ))}
          </div>

          {/* Outlier Detection */}
          {qualityIndicators.outlierDetection.some(o => o.isOutlier) && (
            <div className="mt-4 p-3 bg-orange-50 rounded">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Outlier Detection</h4>
              <div className="text-sm text-orange-700">
                {qualityIndicators.outlierDetection
                  .filter(o => o.isOutlier)
                  .map((outlier, index) => (
                    <div key={index} className="text-xs">
                      <strong>{outlier.method}</strong> shows unusual confidence deviation ({outlier.deviation * 100}%)
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-3">📋 Annotation Recommendations</h3>
        <div className="text-sm text-green-700 space-y-2">
          {agreementAnalysis.overallAgreement > 0.7 ? (
            <div>✅ <strong>High Agreement:</strong> Methods show strong consensus. Summaries are likely reliable for annotation.</div>
          ) : agreementAnalysis.overallAgreement > 0.4 ? (
            <div>⚠️ <strong>Moderate Agreement:</strong> Some variation between methods. Consider manual review of summaries.</div>
          ) : (
            <div>❌ <strong>Low Agreement:</strong> Significant disagreement detected. Manual annotation strongly recommended.</div>
          )}
          
          {qualityIndicators.consistencyScore > 0.8 ? (
            <div>✅ <strong>Consistent Quality:</strong> All methods performing reliably.</div>
          ) : (
            <div>⚠️ <strong>Variable Quality:</strong> Some methods may be less reliable for this text type.</div>
          )}
          
          <div>
            <strong>Best Method:</strong> {qualityIndicators.methodConfidence
              .sort((a, b) => b.confidence - a.confidence)[0]?.method} 
            (highest confidence: {Math.round(qualityIndicators.methodConfidence
              .sort((a, b) => b.confidence - a.confidence)[0]?.confidence * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAssessment;