'use client';

import { useRef, useState } from 'react';
import { validateImageFile, extractTextFromImage } from '@/lib/ocr';

export interface ImageUploadProps {
  onImageExtracted: (text: string, fileName: string) => void;
  isLoading?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageExtracted,
  isLoading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageExtraction = async (file: File) => {
    setError(null);
    setProgress(0);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setSelectedFile(file);
    setExtracting(true);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      const extractedText = await extractTextFromImage(file);

      clearInterval(progressInterval);
      setProgress(100);

      onImageExtracted(extractedText, file.name);
      setSelectedFile(null);
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract text from image');
      setProgress(0);
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
      handleImageExtraction(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleImageExtraction(files[0]);
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
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={extracting || isLoading}
        />

        <div className="space-y-3">
          <div className="text-4xl">🖼️</div>

          {extracting ? (
            <>
              <p className="font-semibold text-gray-900">Extracting text from image...</p>
              <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-blue h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="font-semibold text-gray-900">Drop your image here</p>
                <p className="text-sm text-gray-600">or click to select a file</p>
              </div>
              <p className="text-xs text-gray-500">Max 5MB • JPG, PNG, WebP, or GIF</p>
              {selectedFile && (
                <p className="text-sm font-medium text-sky-blue">🖼️ {selectedFile.name}</p>
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
