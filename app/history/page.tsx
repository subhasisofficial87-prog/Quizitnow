'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';

interface QuizResult {
  id: string;
  quiz_title: string;
  source_type: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent_seconds: number;
  attempted_at: string;
  answers_json?: Record<string, string>;
  questions_json?: any[];
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    totalTimeSpent: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchHistory();
  }, [user, authLoading]);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/quiz/history?user_id=${user.id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }

      const data = await response.json();
      setQuizHistory(data.data || []);

      // Calculate stats
      if (data.data && data.data.length > 0) {
        const avgScore =
          data.data.reduce((sum: number, q: QuizResult) => sum + q.score, 0) /
          data.data.length;
        const totalTime = data.data.reduce(
          (sum: number, q: QuizResult) => sum + q.time_spent_seconds,
          0
        );

        setStats({
          totalAttempts: data.data.length,
          averageScore: Math.round(avgScore),
          totalTimeSpent: totalTime,
        });
      }

      setError(null);
    } catch (err) {
      console.error('[History] Error fetching quiz history:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load quiz history'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetakeQuiz = (quiz: QuizResult) => {
    // Store quiz for replay
    if (quiz.questions_json && quiz.answers_json) {
      sessionStorage.setItem(
        'generatedQuiz',
        JSON.stringify({
          id: quiz.id,
          title: quiz.quiz_title,
          sourceType: quiz.source_type,
          createdAt: quiz.attempted_at,
          questions: quiz.questions_json,
        })
      );
      router.push('/quiz');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quiz history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/5 to-baby-pink/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold gradient-text">QuizItNow</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/')}
              className="bg-sky-blue text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto py-12 px-4">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Quiz History
          </h2>
          <p className="text-gray-600">
            Track your learning progress and review past quiz attempts
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-700 font-semibold">❌ Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Section */}
        {stats.totalAttempts > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-sky-blue">
              <p className="text-gray-600 text-sm">Total Quizzes Attempted</p>
              <p className="text-3xl font-bold text-sky-blue mt-2">
                {stats.totalAttempts}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-baby-pink">
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-baby-pink mt-2">
                {stats.averageScore}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
              <p className="text-gray-600 text-sm">Total Time Spent</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {Math.floor(stats.totalTimeSpent / 3600)}h{' '}
                {Math.floor((stats.totalTimeSpent % 3600) / 60)}m
              </p>
            </div>
          </div>
        )}

        {/* Quiz History List */}
        {quizHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              📚 No quiz attempts yet
            </p>
            <p className="text-gray-500 mb-6">
              Start taking quizzes and your results will appear here!
            </p>
            <Button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-sky-blue text-white"
            >
              🚀 Create Your First Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizHistory.map((quiz, idx) => (
              <div
                key={quiz.id}
                className={`rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${getScoreBg(
                  quiz.score
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {idx + 1}. {quiz.quiz_title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(quiz.attempted_at)}
                    </p>
                  </div>
                  <div
                    className={`text-right px-4 py-2 rounded-lg font-bold text-xl ${getScoreColor(
                      quiz.score
                    )}`}
                  >
                    {quiz.score}%
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Correct Answers</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {quiz.correct_answers}/{quiz.total_questions}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Time Spent</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {formatTime(quiz.time_spent_seconds)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Questions</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {quiz.total_questions}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Source Type</p>
                    <p className="font-semibold text-lg text-gray-900 capitalize">
                      {quiz.source_type}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleRetakeQuiz(quiz)}
                    className="flex-1 px-4 py-2 bg-sky-blue text-white hover:bg-sky-600 text-sm font-semibold"
                  >
                    🔄 Review Quiz
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 hover:bg-gray-300 text-sm font-semibold"
                  >
                    ➕ Create New
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
