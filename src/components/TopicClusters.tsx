import React from 'react';
import { TopicCluster } from '../utils/textSummarization';

interface TopicClustersProps {
  clusters: TopicCluster[];
}

const TopicClusters: React.FC<TopicClustersProps> = ({ clusters }) => {
  if (clusters.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-grey-200">
      <h4 className="text-sm font-semibold text-grey-800 mb-3">Topic Clusters</h4>
      <div className="space-y-3">
        {clusters.map((cluster, index) => (
          <div key={cluster.id} className="relative">
            <div className="flex items-start space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: cluster.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-2">
                  {cluster.keywords.map((keyword, keyIndex) => (
                    <span 
                      key={keyIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: cluster.color + '20',
                        color: cluster.color 
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="space-y-1">
                  {cluster.sentences.slice(0, 3).map((sentence, sentIndex) => (
                    <p 
                      key={sentIndex}
                      className="text-xs text-grey-600 leading-relaxed"
                    >
                      {sentence}
                    </p>
                  ))}
                  {cluster.sentences.length > 3 && (
                    <p className="text-xs text-grey-500 italic">
                      +{cluster.sentences.length - 3} more sentences...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-grey-500 mt-3">
        Topics are automatically identified based on keyword co-occurrence
      </p>
    </div>
  );
};

export default TopicClusters;