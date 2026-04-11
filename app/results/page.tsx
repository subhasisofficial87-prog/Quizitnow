'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const data = searchParams?.get('data');
    if (!data) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      setResults(parsed);
    } catch (e) {
      console.error('Failed to parse results');
      router.push('/');
    }
  }, [searchParams, router]);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  const percentage = Math.round((results.score / results.totalQuestions) * 100);
  const isPassed = percentage >= 50;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (pct >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (pct >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (pct >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(percentage);
  const correctAnswers = results.questions.filter((q: any) => results.answers[q.id] === q.correctAnswer);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
      <div className="container mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Quiz Complete! 🎉</h1>
          <p className="text-xl text-gray-600">Here's how you performed</p>
        </div>

        {/* Score Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-xl p-12">
            <div className="text-center mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${gradeInfo.bg}`}>
                <span className={`text-6xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {results.score} / {results.totalQuestions}
              </h2>
              <p className="text-3xl font-bold text-gray-700 mb-4">{percentage}%</p>
              <p className={`text-xl font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {isPassed ? '✅ Passed!' : '❌ Try Again'}
              </p>
            </div>

            {/* Progress Circle */}
            <div className="mb-8">
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-blue to-baby-pink transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.score}</div>
                <p className="text-gray-600">Correct</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.totalQuestions - results.score}</div>
                <p className="text-gray-600">Incorrect</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                <p className="text-gray-600">Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Review</h3>

          <div className="space-y-4">
            {results.questions.map((question: any, idx: number) => {
              const isCorrect = results.answers[question.id] === question.correctAnswer;
              return (
                <div
                  key={question.id}
                  className={`bg-white rounded-lg p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-bold text-gray-500">Q{idx + 1}</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                      isCorrect
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 mb-3">{question.content}</p>

                  {!isCorrect && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-bold">Your Answer:</span> {results.answers[question.id] || 'Not answered'}
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                    <p className="text-sm text-green-700">
                      <span className="font-bold">Correct Answer:</span> {question.correctAnswer}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 italic">{question.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-all"
          >
            ← Back Home
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gradient-to-r from-sky-blue to-baby-pink text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
          <p className="text-gray-600">Loading results...</p>
        </div>
      }
    >
      <ResultsPageInner />
    </Suspense>
  );
}
