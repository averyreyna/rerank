import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import SummaryResults from './components/SummaryResults';
import InfoButton from './components/InfoButton';
import ProjectModal from './components/ProjectModal';
import { 
  textRankSummarize, 
  lexRankSummarize, 
  frequencyBasedSummarize,
  SummaryResult 
} from './utils/textSummarization';

function App() {
  const [results, setResults] = useState<SummaryResult[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [numSentences, setNumSentences] = useState<number>(3);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleFileSelect = useCallback(async (content: string, fileName: string) => {
    setIsProcessing(true);
    setFilename(fileName);
    setResults([]);

    try {
      // Run all summarization methods
      const summaryResults: SummaryResult[] = [];
      
      // TextRank
      const textRankResult = textRankSummarize(content, numSentences);
      summaryResults.push(textRankResult);
      
      // LexRank
      const lexRankResult = lexRankSummarize(content, numSentences);
      summaryResults.push(lexRankResult);
      
      // Frequency-based
      const freqResult = frequencyBasedSummarize(content, numSentences);
      summaryResults.push(freqResult);
      
      setResults(summaryResults);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [numSentences]);

  return (
    <div className="min-h-screen bg-grey-50 font-abc-diatype">
      {/* Header */}
      <div className="bg-white border-b border-grey-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-black">Rerank</h1>
            <div className="text-sm text-grey-600">
              Powered by multiple summarization models
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-grey-700">
              Summary length:
            </label>
            <select
              value={numSentences}
              onChange={(e) => setNumSentences(Number(e.target.value))}
              className="border border-grey-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-grey-400"
              disabled={isProcessing}
            >
              <option value={2}>2 sentences</option>
              <option value={3}>3 sentences</option>
              <option value={4}>4 sentences</option>
              <option value={5}>5 sentences</option>
            </select>
          </div>
        </div>

        {/* File Upload */}
        <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2 text-grey-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-grey-600"></div>
              <span>Processing text with multiple summarization models...</span>
            </div>
          </div>
        )}

        {/* Results */}
        <SummaryResults results={results} filename={filename} />

        {/* Footer Info */}
        {results.length === 0 && !isProcessing && (
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-black mb-4">
                Fast Text Summarization for Data Annotation
              </h2>
              <p className="text-grey-600 mb-6">
                Upload your text files to get instant summaries using TextRank, LexRank, and frequency-based algorithms. 
                Perfect for quickly analyzing interview transcripts, research documents, and large text datasets.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white p-4 rounded-lg border border-grey-200">
                  <h3 className="font-semibold text-grey-800 mb-2">TextRank</h3>
                  <p className="text-grey-600">Graph-based ranking algorithm that identifies important sentences based on their relationships.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-grey-200">
                  <h3 className="font-semibold text-grey-800 mb-2">LexRank</h3>
                  <p className="text-grey-600">Similarity-based approach using cosine similarity and centrality scoring.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-grey-200">
                  <h3 className="font-semibold text-grey-800 mb-2">Frequency-Based</h3>
                  <p className="text-grey-600">Traditional approach scoring sentences by word frequency and importance.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Button */}
      <InfoButton onClick={() => setIsModalOpen(true)} />

      {/* Project Modal */}
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default App;
