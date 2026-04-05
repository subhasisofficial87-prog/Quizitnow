'use client';

import { useRef, useState } from 'react';
import { validatePDFFile, extractTextFromPDF } from '@/lib/pdf';

export interface PDFUploadProps {
  onPDFExtracted: (text: string, fileName: string) => void;
  isLoading?: boolean;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onPDFExtracted, isLoading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePDFExtraction = async (file: File) => {
    setError(null);

    const validation = validatePDFFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid PDF file');
      return;
    }

    setSelectedFile(file);
    setExtracting(true);

    try {
      const extractedText = await extractTextFromPDF(file);

      if (extractedText.length < 10) {
        throw new Error('PDF contains very little text. Please try a different PDF.');
      }

      onPDFExtracted(extractedText, file.name);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract text from PDF');
    } finally {
      setExtracting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePDFExtraction(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handlePDFExtraction(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-blue bg-sky-blue/5'
            : 'border-gray-300 hover:border-sky-blue hover:bg-sky-blue/2'
        } ${extracting || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={extracting || isLoading}
        />

        <div className="space-y-3">
          <div className="text-4xl">📄</div>

          {extracting ? (
            <>
              <p className="font-semibold text-gray-900">Extracting text from PDF...</p>
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div className="bg-sky-blue h-full animate-pulse"></div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="font-semibold text-gray-900">Drop your PDF here</p>
                <p className="text-sm text-gray-600">or click to select a file</p>
              </div>
              <p className="text-xs text-gray-500">Max 10MB • PDF only</p>
              {selectedFile && (
                <p className="text-sm font-medium text-sky-blue">📎 {selectedFile.name}</p>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  );
};
