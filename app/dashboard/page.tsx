'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getUserQuizHistory } from '@/lib/supabase';

interface QuizAttempt {
  id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  quizzes: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Load quiz history
        const quizzes = await getUserQuizHistory(currentUser.id);
        setHistory(quizzes);
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      setError('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getPercentage = (score: number, total: number) => Math.round((score / total) * 100);
  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.email}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-all"
            >
              Create Quiz
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          // Empty State
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quizzes Yet</h2>
              <p className="text-gray-600 mb-8">You haven't taken any quizzes. Start your first quiz now!</p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-sky-blue to-baby-pink text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
              >
                Create Your First Quiz
              </Link>
            </div>
          </div>
        ) : (
          // Quiz History
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz History</h2>
              <div className="grid gap-4">
                {history.map((attempt) => {
                  const percentage = getPercentage(attempt.score, attempt.total_questions);
                  const date = new Date(attempt.completed_at);
                  const timeStr = `${Math.floor(attempt.time_taken_seconds / 60)}m ${attempt.time_taken_seconds % 60}s`;

                  return (
                    <div
                      key={attempt.id}
                      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{attempt.quizzes.title}</h3>
                          <p className="text-gray-600 text-sm">
                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                          {percentage}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="text-2xl font-bold text-green-600">
                            {attempt.score}/{attempt.total_questions}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Time Taken</p>
                          <p className="text-xl font-bold text-blue-600">{timeStr}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="text-xl font-bold text-purple-600 capitalize">
                            {attempt.quizzes.source_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-sky-blue mb-2">{history.length}</div>
                <p className="text-gray-600">Total Quizzes Taken</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-baby-pink mb-2">
                  {Math.round(
                    (history.reduce((acc, h) => acc + h.score, 0) /
                    history.reduce((acc, h) => acc + h.total_questions, 0)) * 100
                  )}%
                </div>
                <p className="text-gray-600">Average Score</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-sky-blue mb-2">
                  {Math.round(
                    history.reduce((acc, h) => acc + h.time_taken_seconds, 0) / history.length / 60
                  )}m
                </div>
                <p className="text-gray-600">Avg. Time per Quiz</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
