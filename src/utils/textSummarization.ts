// Text summarization utilities implementing TextRank and LexRank algorithms

export interface SummaryResult {
  method: string;
  summary: string;
  sentences: string[];
  processingTime: number;
}

// Simple sentence tokenizer
function tokenizeSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short sentences
}

// Calculate cosine similarity between two sentences
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

// TextRank implementation
export function textRankSummarize(text: string, numSentences: number = 3): SummaryResult {
  const startTime = Date.now();
  const sentences = tokenizeSentences(text);
  
  if (sentences.length <= numSentences) {
    return {
      method: 'TextRank',
      summary: sentences.join('. ') + '.',
      sentences,
      processingTime: Date.now() - startTime
    };
  }
  
  // Build similarity matrix
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
  
  // PageRank algorithm
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
  
  // Get top sentences
  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, score: scores[index], index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);
  
  const summary = rankedSentences.map(item => item.sentence).join('. ') + '.';
  
  return {
    method: 'TextRank',
    summary,
    sentences: rankedSentences.map(item => item.sentence),
    processingTime: Date.now() - startTime
  };
}

// LexRank implementation
export function lexRankSummarize(text: string, numSentences: number = 3): SummaryResult {
  const startTime = Date.now();
  const sentences = tokenizeSentences(text);
  
  if (sentences.length <= numSentences) {
    return {
      method: 'LexRank',
      summary: sentences.join('. ') + '.',
      sentences,
      processingTime: Date.now() - startTime
    };
  }
  
  // Build similarity matrix
  const threshold = 0.1;
  const similarityMatrix: number[][] = [];
  
  for (let i = 0; i < sentences.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < sentences.length; j++) {
      const similarity = cosineSimilarity(sentences[i], sentences[j]);
      similarityMatrix[i][j] = similarity > threshold ? similarity : 0;
    }
  }
  
  // Normalize rows
  for (let i = 0; i < sentences.length; i++) {
    const rowSum = similarityMatrix[i].reduce((a, b) => a + b, 0);
    if (rowSum > 0) {
      for (let j = 0; j < sentences.length; j++) {
        similarityMatrix[i][j] /= rowSum;
      }
    }
  }
  
  // Power iteration
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
  
  // Get top sentences
  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, score: scores[index], index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);
  
  const summary = rankedSentences.map(item => item.sentence).join('. ') + '.';
  
  return {
    method: 'LexRank',
    summary,
    sentences: rankedSentences.map(item => item.sentence),
    processingTime: Date.now() - startTime
  };
}

// Simple extractive summarization (frequency-based)
export function frequencyBasedSummarize(text: string, numSentences: number = 3): SummaryResult {
  const startTime = Date.now();
  const sentences = tokenizeSentences(text);
  
  if (sentences.length <= numSentences) {
    return {
      method: 'Frequency-Based',
      summary: sentences.join('. ') + '.',
      sentences,
      processingTime: Date.now() - startTime
    };
  }
  
  // Calculate word frequencies
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: { [key: string]: number } = {};
  
  words.forEach((word: string) => {
    if (word.length > 3) { // Ignore short words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Score sentences based on word frequencies
  const sentenceScores: number[] = sentences.map((sentence: string) => {
    const sentenceWords: string[] = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score: number = sentenceWords.reduce((sum: number, word: string) => sum + (wordFreq[word] || 0), 0);
    return score / sentenceWords.length; // Normalize by sentence length
  });
  
  // Get top sentences
  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, score: sentenceScores[index], index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);
  
  const summary = rankedSentences.map(item => item.sentence).join('. ') + '.';
  
  return {
    method: 'Frequency-Based',
    summary,
    sentences: rankedSentences.map(item => item.sentence),
    processingTime: Date.now() - startTime
  };
}
