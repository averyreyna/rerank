import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (content: string, filename: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-4">
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg text-gray-600">
              Drop your text file here, or{' '}
              <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.csv"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </label>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Supports .txt, .md, and .csv files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
