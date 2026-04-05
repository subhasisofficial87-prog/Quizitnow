'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';

interface QuizResults {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  answers: Record<number, string>;
  questions: any[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Failed to parse results:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, []);

  const handleSaveToHistory = async () => {
    if (!user || !results) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          quiz_title: results.quizTitle,
          source_type: 'topic', // Default to topic, could be enhanced
          total_questions: results.totalQuestions,
          correct_answers: results.correctAnswers,
          score: results.score,
          time_spent_seconds: results.timeSpent,
          answers: results.answers,
          questions: results.questions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save quiz results');
      }

      const data = await response.json();
      console.log('[Results] Quiz saved to history:', data);
      setHasSaved(true);
    } catch (error) {
      console.error('[Results] Error saving quiz:', error);
      alert('Failed to save quiz to history: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackHome = () => {
    sessionStorage.removeItem('quizResults');
    sessionStorage.removeItem('generatedQuiz');
    router.push('/');
  };

  const handleRetakeQuiz = () => {
    sessionStorage.removeItem('quizResults');
    router.back();
  };

  if (isLoading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const percentage = results.score;
  const timeMinutes = Math.floor(results.timeSpent / 60);
  const timeSeconds = results.timeSpent % 60;

  // Determine performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Outstanding!', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 75) return { label: 'Great Job!', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 60) return { label: 'Good Effort!', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Keep Practicing!', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/5 to-baby-pink/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold gradient-text">QuizItNow</h1>
          <div className="flex gap-3">
            <Button onClick={handleRetakeQuiz} className="bg-sky-blue text-white">
              Retake Quiz
            </Button>
            <Button onClick={handleBackHome} className="bg-gray-200 text-gray-900">
              Back Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto py-12 px-4">
        {/* Score Card */}
        <div className={`${performance.bg} rounded-lg shadow-2xl p-12 mb-8 text-center`}>
          <h2 className={`text-4xl font-bold ${performance.color} mb-4`}>
            {performance.label}
          </h2>
          <div className="mb-6">
            <div className="text-6xl font-bold text-gray-900">{percentage}%</div>
            <p className="text-gray-600 text-lg mt-2">
              {results.correctAnswers} out of {results.totalQuestions} correct
            </p>
          </div>

          {/* Progress Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={
                    percentage >= 90
                      ? '#22c55e'
                      : percentage >= 75
                        ? '#3b82f6'
                        : percentage >= 60
                          ? '#eab308'
                          : '#ef4444'
                  }
                  strokeWidth="8"
                  strokeDasharray={`${(percentage / 100) * 283} 283`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-600 text-sm">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-600 text-sm">Questions</p>
              <p className="text-2xl font-bold text-gray-900">{results.totalQuestions}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-600 text-sm">Avg Time/Q</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(results.timeSpent / results.totalQuestions)}s
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Title */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{results.quizTitle}</h3>
          <p className="text-gray-600">
            Quiz completed on {new Date().toLocaleDateString()} at{' '}
            {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Question Review</h3>
          <div className="space-y-4">
            {results.questions.map((question, idx) => {
              const userAnswer = results.answers[idx];
              const isCorrect =
                userAnswer.toLowerCase() === String(question.correctAnswer).toLowerCase();

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    isCorrect
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">
                      {idx + 1}. {question.content}
                    </h4>
                    <span
                      className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                        isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="text-gray-700">
                      <span className="font-semibold">Your answer:</span> {userAnswer}
                    </p>
                    {!isCorrect && (
                      <p className="text-green-700">
                        <span className="font-semibold">Correct answer:</span>{' '}
                        {question.correctAnswer}
                      </p>
                    )}
                    <p className="text-gray-600 italic">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save to History Message */}
        {user ? (
          <div className="mb-6 bg-sky-blue/10 border border-sky-blue/30 rounded-lg p-4 text-center">
            {hasSaved ? (
              <p className="text-green-700 font-semibold">✓ Quiz saved to your history!</p>
            ) : (
              <p className="text-gray-700">
                Save this quiz to your history to track your progress over time.
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              📝 <a href="/auth/login" className="font-semibold hover:underline">Sign in</a> to save your quiz results and track your learning progress!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          {user && !hasSaved && (
            <Button
              onClick={handleSaveToHistory}
              disabled={isSaving}
              className="px-8 py-3 bg-green-600 text-white hover:bg-green-700 text-lg font-semibold disabled:opacity-50"
            >
              {isSaving ? '💾 Saving...' : '💾 Save to History'}
            </Button>
          )}
          <Button
            onClick={handleRetakeQuiz}
            className="px-8 py-3 bg-sky-blue text-white hover:bg-sky-600 text-lg font-semibold"
          >
            🔄 Retake Quiz
          </Button>
          <Button
            onClick={handleBackHome}
            className="px-8 py-3 bg-baby-pink text-white hover:opacity-90 text-lg font-semibold"
          >
            ➕ Create New Quiz
          </Button>
        </div>
      </main>
    </div>
  );
}
