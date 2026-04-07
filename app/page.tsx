'use client';

import { useState } from 'react';
import { extractTextFromPDF, validatePDFFile } from '@/lib/pdf-processor';
import { extractTextFromImage, validateImageFile } from '@/lib/ocr-processor';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [inputMethod, setInputMethod] = useState<'topic' | 'pdf' | 'image'>('topic');

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, sourceType: inputMethod }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      setQuiz(data.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      // Validate PDF
      const validation = validatePDFFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid PDF file');
      }

      // Extract text
      const extractedText = await extractTextFromPDF(file);
      setTopic(extractedText);
      setInputMethod('pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      // Validate image
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Extract text via OCR
      const extractedText = await extractTextFromImage(file);
      setTopic(extractedText);
      setInputMethod('image');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">QuizItNow</h1>
          <p className="text-xl text-gray-600">Generate AI-powered quizzes instantly</p>
        </div>

        {!quiz ? (
          // Input Section
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <form onSubmit={handleGenerateQuiz}>
                {/* Input Method Tabs */}
                <div className="flex gap-4 mb-8 border-b">
                  {[
                    { value: 'topic', label: '📝 Topic', icon: '✏️' },
                    { value: 'pdf', label: '📄 PDF Upload', icon: '📄' },
                    { value: 'image', label: '🖼️ Image/Photo', icon: '📸' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setInputMethod(value as 'topic' | 'pdf' | 'image');
                        setTopic('');
                        setError('');
                      }}
                      className={`pb-4 px-4 font-semibold transition-all ${
                        inputMethod === value
                          ? 'text-sky-blue border-b-2 border-sky-blue'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Topic Input */}
                {inputMethod === 'topic' && (
                  <div className="mb-6">
                    <label htmlFor="topic" className="block text-lg font-semibold text-gray-700 mb-3">
                      Enter Topic
                    </label>
                    <textarea
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter any topic you want to create a quiz about..."
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-sky-blue resize-none"
                      rows={5}
                      disabled={loading}
                    />
                  </div>
                )}

                {/* PDF Upload */}
                {inputMethod === 'pdf' && (
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Upload PDF
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-blue transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePDFUpload}
                        disabled={loading}
                        className="hidden"
                        id="pdf-input"
                      />
                      <label htmlFor="pdf-input" className="cursor-pointer">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-gray-700 font-semibold mb-1">Drag and drop your PDF here</p>
                        <p className="text-gray-600 text-sm">or click to select a file</p>
                        <p className="text-gray-500 text-xs mt-2">Max 10MB</p>
                      </label>
                    </div>
                    {topic && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 font-semibold">✅ PDF uploaded successfully</p>
                        <p className="text-green-600 text-sm mt-1">{topic.length} characters extracted</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Image Upload */}
                {inputMethod === 'image' && (
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Upload Image or Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-blue transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loading}
                        className="hidden"
                        id="image-input"
                      />
                      <label htmlFor="image-input" className="cursor-pointer">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-gray-700 font-semibold mb-1">Drag and drop your image here</p>
                        <p className="text-gray-600 text-sm">or click to select a file</p>
                        <p className="text-gray-500 text-xs mt-2">Supports JPEG, PNG, WebP (Max 5MB)</p>
                      </label>
                    </div>
                    {topic && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 font-semibold">✅ Image processed successfully</p>
                        <p className="text-green-600 text-sm mt-1">{topic.length} characters extracted</p>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-sky-blue to-baby-pink text-white font-bold py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Processing...' : 'Generate Quiz'}
                </button>
              </form>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-sky-blue mb-2">31</div>
                <p className="text-gray-600">Questions per quiz</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-baby-pink mb-2">6</div>
                <p className="text-gray-600">Question types</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-sky-blue mb-2">3</div>
                <p className="text-gray-600">Difficulty levels</p>
              </div>
            </div>
          </div>
        ) : (
          // Quiz Display Section
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{quiz.title}</h2>
                  <p className="text-gray-600 mt-2">
                    {quiz.stats.totalQuestions} questions • {quiz.stats.byType.mcq} MCQ • {quiz.stats.byType.fillBlank} Fill-blank • {quiz.stats.byType.trueFalse} True/False
                  </p>
                </div>
                <button
                  onClick={() => {
                    setQuiz(null);
                    setTopic('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  ← Back
                </button>
              </div>

              {/* Questions Display */}
              <div className="space-y-6">
                {['easy', 'medium', 'hard'].map((difficulty) => (
                  <div key={difficulty} className="border-t pt-6">
                    <h3 className={`text-xl font-bold mb-4 ${
                      difficulty === 'easy' ? 'text-green-600' :
                      difficulty === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Questions ({quiz.questions[difficulty].length})
                    </h3>

                    <div className="space-y-4">
                      {quiz.questions[difficulty].map((question: any, idx: number) => (
                        <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex gap-3">
                            <span className="font-bold text-gray-500 min-w-8">{idx + 1}.</span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-2">{question.content}</p>
                              <p className="text-sm text-gray-600 italic">Answer: {question.correctAnswer}</p>
                              <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded h-fit">
                              {question.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t space-y-4">
                <button
                  onClick={() => {
                    const quizJson = encodeURIComponent(JSON.stringify(quiz));
                    window.location.href = `/quiz-mode?quiz=${quizJson}`;
                  }}
                  className="w-full bg-gradient-to-r from-sky-blue to-baby-pink text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all text-lg"
                >
                  🎯 Take Quiz Now (Timed Mode)
                </button>
                <button
                  onClick={() => {
                    setQuiz(null);
                    setTopic('');
                  }}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-all"
                >
                  Generate Another Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
