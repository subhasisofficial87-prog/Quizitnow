'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { validateTopic } from '@/lib/validation';
import { PDFUpload } from './PDFUpload';
import { ImageUpload } from './ImageUpload';
import type { ToastType } from '@/components/ui/Toast';

export interface QuizInputProps {
  onGenerateClick: (topic: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Quiz input component - Phase 7
 * Handles topic input, PDF upload, and image OCR
 */
export const QuizInput: React.FC<QuizInputProps> = ({
  onGenerateClick,
  isLoading = false,
}) => {
  const [topic, setTopic] = useState('');
  const [inputMode, setInputMode] = useState<'topic' | 'pdf' | 'image'>('topic');
  const [error, setError] = useState<string>();
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isFormValid = topic.trim().length >= 10;

  const handleGenerateClick = async () => {
    setError(undefined);

    const validation = validateTopic(topic);
    if (!validation.valid) {
      setError(validation.error);
      addToast(validation.error || 'Invalid input', 'error');
      return;
    }

    try {
      addToast('Generating quiz...', 'info');
      await onGenerateClick(topic.trim());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate quiz';
      addToast(errorMessage, 'error');
    }
  };

  const handlePDFExtracted = async (pdfText: string, fileName: string) => {
    const topicFromPDF = `PDF: ${fileName}\n\nContent:\n${pdfText.substring(0, 500)}...`;
    setTopic(topicFromPDF);
    setError(undefined);

    try {
      addToast('Generating quiz from PDF...', 'info');
      await onGenerateClick(topicFromPDF);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate quiz from PDF';
      addToast(errorMessage, 'error');
    }
  };

  const handleImageExtracted = async (imageText: string, fileName: string) => {
    const topicFromImage = `Image: ${fileName}\n\nContent:\n${imageText.substring(0, 500)}...`;
    setTopic(topicFromImage);
    setError(undefined);

    try {
      addToast('Generating quiz from image...', 'info');
      await onGenerateClick(topicFromImage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate quiz from image';
      addToast(errorMessage, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Input Mode Selector - 3 Tabs */}
      <div className="flex gap-3 bg-white rounded-lg shadow-md p-1">
        <button
          onClick={() => {
            setInputMode('topic');
            setTopic('');
            setError(undefined);
          }}
          className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
            inputMode === 'topic'
              ? 'bg-sky-blue text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          📝 Topic
        </button>
        <button
          onClick={() => {
            setInputMode('pdf');
            setTopic('');
            setError(undefined);
          }}
          className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
            inputMode === 'pdf'
              ? 'bg-sky-blue text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          📄 PDF
        </button>
        <button
          onClick={() => {
            setInputMode('image');
            setTopic('');
            setError(undefined);
          }}
          className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
            inputMode === 'image'
              ? 'bg-sky-blue text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          🖼️ Image
        </button>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border-2 border-gray-100">
        {inputMode === 'topic' ? (
          <>
            <Textarea
              label="Enter Your Topic or Subject"
              placeholder="Example: Photosynthesis in plants, World War II causes, Python programming basics..."
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError(undefined);
              }}
              rows={5}
              disabled={isLoading}
              error={error}
              helpText={`${topic.length}/1000 characters`}
            />
          </>
        ) : inputMode === 'pdf' ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your PDF</h3>
            <PDFUpload onPDFExtracted={handlePDFExtracted} isLoading={isLoading} />
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Image</h3>
            <ImageUpload onImageExtracted={handleImageExtracted} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-sky-blue/10 to-baby-pink/10 border-l-4 border-sky-blue rounded-lg p-6">
        <p className="text-gray-900 font-semibold mb-2">
          {inputMode === 'topic'
            ? '💡 Tips for best results:'
            : inputMode === 'pdf'
              ? '📋 PDF Requirements:'
              : '📸 Image Requirements:'}
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          {inputMode === 'topic' ? (
            <>
              <li>✓ Be specific: "Photosynthesis in C3 plants" works better than "plants"</li>
              <li>✓ Include context: Subject, class level, or topic area</li>
              <li>✓ Minimum 10 characters, maximum 1000 characters</li>
            </>
          ) : inputMode === 'pdf' ? (
            <>
              <li>✓ Format: PDF files only</li>
              <li>✓ Size: Maximum 10MB</li>
              <li>✓ Content: Should contain readable text</li>
              <li>✓ We'll extract the content and generate questions automatically</li>
            </>
          ) : (
            <>
              <li>✓ Formats: JPG, PNG, WebP, or GIF images</li>
              <li>✓ Size: Maximum 5MB</li>
              <li>✓ Content: Should contain readable text (documents, textbooks, screenshots)</li>
              <li>✓ We use OCR to extract text and generate questions automatically</li>
            </>
          )}
        </ul>
      </div>

      {/* Generate Button (only show for topic mode) */}
      {inputMode === 'topic' && (
        <Button
          onClick={handleGenerateClick}
          disabled={!isFormValid || isLoading}
          isLoading={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? 'Generating Quiz...' : '🚀 Generate Quiz'}
        </Button>
      )}

      {/* Status Message */}
      {inputMode === 'topic' && !isFormValid && topic.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ Topic must be at least 10 characters (currently {topic.length})
        </div>
      )}
    </div>
  );
};
