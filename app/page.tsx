'use client';

import { useState } from 'react';
import { extractTextFromPDF, validatePDFFile } from '@/lib/pdf-processor';
import { extractTextFromImage, validateImageFile } from '@/lib/ocr-processor';

/**
 * Quiz Display Component - Shows questions with reveal answer functionality
 */
function QuizDisplaySection({ quiz, onBack }: { quiz: any; onBack: () => void }) {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  const toggleRevealAnswer = (questionId: string) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(questionId)) {
      newRevealed.delete(questionId);
    } else {
      newRevealed.add(questionId);
    }
    setRevealedAnswers(newRevealed);
  };

  const renderQuestionOptions = (question: any) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-2 mt-3">
            {question.options.map((option: string, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded border-2 transition-all ${
                  option === question.correctAnswer && revealedAnswers.has(question.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                <p className="text-gray-900 font-medium">
                  {String.fromCharCode(65 + idx)}. {option}
                </p>
              </div>
            ))}
          </div>
        );

      case 'trueFalse':
        return (
          <div className="flex gap-4 mt-3">
            {['true', 'false'].map((option) => (
              <div
                key={option}
                className={`flex-1 p-3 rounded border-2 text-center transition-all ${
                  option === question.correctAnswer && revealedAnswers.has(question.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <p className="font-bold text-gray-900">
                  {option === 'true' ? '✓ True' : '✗ False'}
                </p>
              </div>
            ))}
          </div>
        );

      case 'fillBlank':
      case 'oneWord':
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded border-2 border-gray-300">
            <p className="text-gray-900 font-medium">Answer: __________</p>
          </div>
        );

      case 'match':
        return (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600 font-semibold">Match the following pairs:</p>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 mb-2">Left Column:</p>
                <div className="space-y-2">
                  {question.pairs?.map((pair: any, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 border border-gray-300 rounded text-sm">
                      {pair.left}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 mb-2">Right Column:</p>
                <div className="space-y-2">
                  {question.pairs?.map((pair: any, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 border border-gray-300 rounded text-sm">
                      {pair.right}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'assertionReason':
        return (
          <div className="mt-3 space-y-3">
            <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded">
              <p className="text-xs font-bold text-blue-900 mb-1">ASSERTION (A):</p>
              <p className="text-sm text-gray-900">{question.assertion}</p>
            </div>
            <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded">
              <p className="text-xs font-bold text-purple-900 mb-1">REASON (R):</p>
              <p className="text-sm text-gray-900">{question.reason}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
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
            onClick={onBack}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Questions Display */}
        <div className="space-y-8">
          {['easy', 'medium', 'hard'].map((difficulty) => (
            <div key={difficulty} className="border-t pt-6">
              <h3 className={`text-xl font-bold mb-6 ${
                difficulty === 'easy' ? 'text-green-600' :
                difficulty === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Questions ({quiz.questions[difficulty].length})
              </h3>

              <div className="space-y-6">
                {quiz.questions[difficulty].map((question: any, idx: number) => {
                  const isRevealed = revealedAnswers.has(question.id);
                  return (
                    <div key={question.id} className="bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all">
                      {/* Question Header */}
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 border-b border-gray-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-500 mb-2">Question {idx + 1}</p>
                            <p className="font-semibold text-gray-900 text-lg">{question.content}</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 bg-gray-200 rounded-full whitespace-nowrap">
                            {question.type === 'mcq' ? 'MCQ' :
                             question.type === 'fillBlank' ? 'Fill-blank' :
                             question.type === 'oneWord' ? 'One-word' :
                             question.type === 'trueFalse' ? 'True/False' :
                             question.type === 'match' ? 'Match' :
                             'Assertion-Reason'}
                          </span>
                        </div>
                      </div>

                      {/* Question Options */}
                      <div className="p-4">
                        {renderQuestionOptions(question)}
                      </div>

                      {/* Reveal Answer Button */}
                      <div className="border-t border-gray-200 p-4 bg-white">
                        <button
                          onClick={() => toggleRevealAnswer(question.id)}
                          className={`w-full py-2 px-4 rounded font-semibold transition-all ${
                            isRevealed
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                          }`}
                        >
                          {isRevealed ? '✓ Answer Revealed' : '📋 Reveal Answer'}
                        </button>
                      </div>

                      {/* Answer Section (shown when revealed) */}
                      {isRevealed && (
                        <div className="border-t border-gray-200 bg-green-50 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">✓</span>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-green-900 mb-1">Correct Answer:</p>
                              <p className="text-gray-900 font-semibold">{question.correctAnswer}</p>
                            </div>
                          </div>
                          <div className="border-t border-green-200 pt-3">
                            <p className="text-sm font-bold text-green-900 mb-2">Explanation:</p>
                            <p className="text-gray-900 text-sm leading-relaxed">{question.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 pt-8 border-t space-y-4">
          <button
            onClick={() => {
              const quizJson = encodeURIComponent(JSON.stringify(quiz));
              window.location.href = `/quiz-mode?quiz=${quizJson}`;
            }}
            className="w-full bg-gradient-to-r from-sky-blue to-baby-pink text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all text-lg"
          >
            🎯 Take Quiz Now (Timed Mode)
          </button>
          <button
            onClick={onBack}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-all"
          >
            Generate Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

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
          <QuizDisplaySection quiz={quiz} onBack={() => { setQuiz(null); setTopic(''); }} />
        )}
      </div>
    </main>
  );
}
