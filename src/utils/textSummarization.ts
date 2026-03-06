import Sentiment from 'sentiment';

export interface QualityMetrics {
  coverage: number;
  coherence: number;
  diversity: number;
  confidence: number;
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
  };
}

export interface SentenceNode {
  id: string;
  text: string;
  score: number;
  sentiment: number;
  connections: { target: string; weight: number }[];
  position?: { x: number; y: number };
}

export interface TopicCluster {
  id: string;
  keywords: string[];
  sentences: string[];
  centroid: number[];
  color: string;
}

export interface SummaryResult {
  method: string;
  summary: string;
  sentences: string[];
  processingTime: number;
  qualityMetrics: QualityMetrics;
  visualizationData: {
    sentenceGraph: SentenceNode[];
    topicClusters: TopicCluster[];
  };
}

function tokenizeSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

function cosineSimilarity(sent1: string, sent2: string): number {
  const words1 = sent1.toLowerCase().split(/\s+/);
  const words2 = sent2.toLowerCase().split(/\s+/);
  
  const allWords = Array.from(new Set([...words1, ...words2]));
  
  const vector1 = allWords.map(word => words1.filter(w => w === word).length);
  const vector2 = allWords.map(word => words2.filter(w => w === word).length);
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

const sentiment = new Sentiment();

function calculateQualityMetrics(
  originalText: string, 
  summaryText: string, 
  selectedSentences: string[],
  allSentences: string[]
): QualityMetrics {
  const originalWords = new Set(originalText.toLowerCase().match(/\b\w+\b/g) || []);
  const summaryWords = new Set(summaryText.toLowerCase().match(/\b\w+\b/g) || []);
  const coverage = summaryWords.size / originalWords.size;

  let coherenceSum = 0;
  for (let i = 0; i < selectedSentences.length - 1; i++) {
    coherenceSum += cosineSimilarity(selectedSentences[i], selectedSentences[i + 1]);
  }
  const coherence = selectedSentences.length > 1 ? coherenceSum / (selectedSentences.length - 1) : 1;

  const totalSummaryWords = summaryText.toLowerCase().match(/\b\w+\b/g) || [];
  const diversity = summaryWords.size / totalSummaryWords.length;

  const confidence = (coverage * 0.4 + coherence * 0.3 + diversity * 0.3);

  const sentimentResult = sentiment.analyze(summaryText);

  return {
    coverage: Math.round(coverage * 100) / 100,
    coherence: Math.round(coherence * 100) / 100,
    diversity: Math.round(diversity * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    sentiment: {
      score: sentimentResult.score,
      comparative: Math.round(sentimentResult.comparative * 100) / 100,
      positive: sentimentResult.positive,
      negative: sentimentResult.negative
    }
  };
}

function generateVisualizationData(
  sentences: string[], 
  scores: number[], 
  similarityMatrix: number[][]
): { sentenceGraph: SentenceNode[]; topicClusters: TopicCluster[] } {
  const MAX_NODES = 25;

  const rankedIndices = sentences
    .map((_, index) => ({ index, score: scores[index] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(MAX_NODES, sentences.length))
    .map(item => item.index);

  const sentenceGraph: SentenceNode[] = rankedIndices.map((originalIndex) => {
    const sentence = sentences[originalIndex];
    const sentimentScore = sentiment.analyze(sentence).comparative;

    const connections = rankedIndices.map((targetIndex) => ({
      target: `sentence-${targetIndex}`,
      weight: similarityMatrix[originalIndex]?.[targetIndex] || 0
    })).filter(conn => conn.weight > 0.1 && conn.target !== `sentence-${originalIndex}`);

    return {
      id: `sentence-${originalIndex}`,
      text: sentence.slice(0, 100) + (sentence.length > 100 ? '...' : ''),
      score: scores[originalIndex] || 0,
      sentiment: sentimentScore,
      connections
    };
  });

  const topicClusters = generateTopicClusters(sentences);

  return { sentenceGraph, topicClusters };
}

function generateTopicClusters(sentences: string[]): TopicCluster[] {
  const words = sentences.flatMap(s => 
    s.toLowerCase().match(/\b\w{4,}\b/g) || []
  );
  
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 12)
    .map(([word]) => word);

  const clusters: TopicCluster[] = [];
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

  for (let i = 0; i < Math.min(3, Math.ceil(topWords.length / 4)); i++) {
    const clusterKeywords = topWords.slice(i * 4, (i + 1) * 4);
    const clusterSentences = sentences.filter(sentence => 
      clusterKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    );

    if (clusterSentences.length > 0) {
      clusters.push({
        id: `cluster-${i}`,
        keywords: clusterKeywords,
        sentences: clusterSentences.map(s => s.slice(0, 80) + '...'),
        centroid: [Math.random() * 100, Math.random() * 100],
        color: colors[i % colors.length]
      });
    }
  }

  return clusters;
}

export function textRankSummarize(text: string, numSentences: number = 3): SummaryResult {
  const startTime = Date.now();
  const sentences = tokenizeSentences(text);
  
  if (sentences.length <= numSentences) {
    const summary = sentences.join('. ') + '.';
    const qualityMetrics = calculateQualityMetrics(text, summary, sentences, sentences);
    const visualizationData = generateVisualizationData(sentences, sentences.map(() => 1), []);
    
    return {
      method: 'TextRank',
      summary,
      sentences,
      processingTime: Date.now() - startTime,
      qualityMetrics,
      visualizationData
    };
  }

  const similarityMatrix: number[][] = [];
  for (let i = 0; i < sentences.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < sentences.length; j++) {
      if (i === j) {
        similarityMatrix[i][j] = 0;
      } else {
        similarityMatrix[i][j] = cosineSimilarity(sentences[i], sentences[j]);
      }
    }
  }

  const scores = new Array(sentences.length).fill(1);
  const damping = 0.85;
  const iterations = 50;
  
  for (let iter = 0; iter < iterations; iter++) {
    const newScores = [...scores];
    for (let i = 0; i < sentences.length; i++) {
      let sum = 0;
      for (let j = 0; j < sentences.length; j++) {
        if (i !== j) {
          const totalSim = similarityMatrix[j].reduce((a, b) => a + b, 0);
          if (totalSim > 0) {
            sum += (similarityMatrix[j][i] / totalSim) * scores[j];
          }
        }
      }
      newScores[i] = (1 - damping) + damping * sum;
    }
    scores.splice(0, scores.length, ...newScores);
  }

  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, score: scores[index], index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);

  const summary = rankedSentences.map(item => item.sentence).join('. ') + '.';
  const selectedSentences = rankedSentences.map(item => item.sentence);

  const qualityMetrics = calculateQualityMetrics(text, summary, selectedSentences, sentences);
  const visualizationData = generateVisualizationData(sentences, scores, similarityMatrix);

  return {
    method: 'TextRank',
    summary,
    sentences: selectedSentences,
    processingTime: Date.now() - startTime,
    qualityMetrics,
    visualizationData
  };
}

export function lexRankSummarize(text: string, numSentences: number = 3): SummaryResult {
  const startTime = Date.now();
  const sentences = tokenizeSentences(text);
  
  if (sentences.length <= numSentences) {
    const summary = sentences.join('. ') + '.';
    const qualityMetrics = calculateQualityMetrics(text, summary, sentences, sentences);
    const visualizationData = generateVisualizationData(sentences, sentences.map(() => 1), []);
    
    return {
      method: 'LexRank',
      summary,
      sentences,
      processingTime: Date.now() - startTime,
      qualityMetrics,
      visualizationData
    };
  }

  const threshold = 0.1;
  const similarityMatrix: number[][] = [];

  for (let i = 0; i < sentences.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < sentences.length; j++) {
      const similarity = cosineSimilarity(sentences[i], sentences[j]);
      similarityMatrix[i][j] = similarity > threshold ? similarity : 0;
    }
  }

  for (let i = 0; i < sentences.length; i++) {
    const rowSum = similarityMatrix[i].reduce((a, b) => a + b, 0);
    if (rowSum > 0) {
      for (let j = 0; j < sentences.length; j++) {
        similarityMatrix[i][j] /= rowSum;
      }
    }
  }

  const scores = new Array(sentences.length).fill(1 / sentences.length);
  const iterations = 50;

  for (let iter = 0; iter < iterations; iter++) {
    const newScores = new Array(sentences.length).fill(0);
    for (let i = 0; i < sentences.length; i++) {
      for (let j = 0; j < sentences.length; j++) {
        newScores[i] += similarityMatrix[j][i] * scores[j];
      }
    }
    scores.splice(0, scores.length, ...newScores);
  }

  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, score: scores[index], index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);

  const summary = rankedSentences.map(item => item.sentence).join('. ') + '.';
  const selectedSentences = rankedSentences.map(item => item.sentence);

  const qualityMetrics = calculateQualityMetrics(text, summary, selectedSentences, sentences);
  const visualizationData = generateVisualizationData(sentences, scores, similarityMatrix);

  return {
    method: 'LexRank',
    summary,
    sentences: selectedSentences,
    processingTime: Date.now() - startTime,
    qualityMetrics,
    visualizationData
  };
}

export async function bartSummarize(text: string, numSentences: number = 3): Promise<SummaryResult> {
  const startTime = Date.now();
  const sentences = tokenizeSentences(text);

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text.slice(0, 1024), // huggingface inference api input length limit
        parameters: {
          max_length: Math.min(150, numSentences * 50),
          min_length: Math.min(50, numSentences * 15),
          do_sample: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`BART API error: ${response.status}`);
    }

    const result = await response.json();
    let summary = result[0]?.summary_text || text.slice(0, 200) + '...';

    const summarySentences = tokenizeSentences(summary);
    const qualityMetrics = calculateQualityMetrics(text, summary, summarySentences, sentences);

    const sentenceScores: number[] = sentences.map((sentence: string) => {
      return cosineSimilarity(sentence, summary);
    });

    const similarityMatrix: number[][] = [];
    for (let i = 0; i < sentences.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < sentences.length; j++) {
        similarityMatrix[i][j] = i === j ? 0 : cosineSimilarity(sentences[i], sentences[j]);
      }
    }

    const visualizationData = generateVisualizationData(sentences, sentenceScores, similarityMatrix);

    return {
      method: 'BART',
      summary,
      sentences: summarySentences,
      processingTime: Date.now() - startTime,
      qualityMetrics,
      visualizationData
    };
    
  } catch (error) {
    console.error('BART summarization failed:', error);
    // fallback: extractive summary when bart api fails
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach((word: string) => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const sentenceScores: number[] = sentences.map((sentence: string) => {
      const sentenceWords: string[] = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const score: number = sentenceWords.reduce((sum: number, word: string) => sum + (wordFreq[word] || 0), 0);
      return score / sentenceWords.length;
    });
    
    const rankedSentences = sentences
      .map((sentence, index) => ({ sentence, score: sentenceScores[index], index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index);
    
    const summary = rankedSentences.map(item => item.sentence).join('. ') + '.';
    const selectedSentences = rankedSentences.map(item => item.sentence);
    const qualityMetrics = calculateQualityMetrics(text, summary, selectedSentences, sentences);
    
    const similarityMatrix: number[][] = [];
    for (let i = 0; i < sentences.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < sentences.length; j++) {
        similarityMatrix[i][j] = i === j ? 0 : cosineSimilarity(sentences[i], sentences[j]);
      }
    }
    
    const visualizationData = generateVisualizationData(sentences, sentenceScores, similarityMatrix);
    
    return {
      method: 'BART (Fallback)',
      summary,
      sentences: selectedSentences,
      processingTime: Date.now() - startTime,
      qualityMetrics,
      visualizationData
    };
  }
}
