'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsModal, QuizSettings } from '@/components/quiz/SettingsModal';
import { QuizTaker } from '@/components/quiz/QuizTaker';
import { Button } from '@/components/ui/Button';

interface Quiz {
  id: string;
  title: string;
  sourceType: string;
  createdAt: string;
  questions: any[];
}

export default function QuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load quiz from sessionStorage
  useEffect(() => {
    try {
      const storedQuiz = sessionStorage.getItem('generatedQuiz');
      if (storedQuiz) {
        const parsedQuiz = JSON.parse(storedQuiz);
        setQuiz(parsedQuiz);
        setIsLoading(false);
      } else {
        console.error('No quiz found in sessionStorage');
        setIsLoading(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to parse quiz:', error);
      setIsLoading(false);
      router.push('/');
    }
  }, []);

  const handleStartQuiz = (settings: QuizSettings) => {
    // Select questions based on settings
    const shuffledQuestions = [...(quiz?.questions || [])].sort(
      () => Math.random() - 0.5
    );
    const selectedQuestions = shuffledQuestions.slice(0, settings.questionCount);
    setSelectedQuestions(selectedQuestions);
    setIsTakingQuiz(true);
    setIsSettingsOpen(false);
  };

  const handleQuizComplete = (answers: Record<number, string>, timeSpent: number) => {
    // Calculate score
    let correctCount = 0;
    selectedQuestions.forEach((question, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = String(question.correctAnswer).toLowerCase();
      if (userAnswer.toLowerCase() === correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / selectedQuestions.length) * 100;

    // Store results in sessionStorage
    sessionStorage.setItem(
      'quizResults',
      JSON.stringify({
        quizId: quiz?.id,
        quizTitle: quiz?.title,
        totalQuestions: selectedQuestions.length,
        correctAnswers: correctCount,
        score: Math.round(score),
        timeSpent,
        answers,
        questions: selectedQuestions,
      })
    );

    // Navigate to results page
    router.push('/quiz/results');
  };

  const handleExitQuiz = () => {
    setIsTakingQuiz(false);
    setSelectedQuestions([]);
  };

  const handleBackHome = () => {
    sessionStorage.removeItem('generatedQuiz');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quiz not found</p>
          <Button onClick={handleBackHome} className="bg-sky-blue text-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isTakingQuiz) {
    return (
      <QuizTaker
        questions={selectedQuestions}
        quizTitle={quiz.title}
        timeLimit={
          quiz.questions.length > 0
            ? Math.ceil((quiz.questions.length / 31) * 15)
            : 15
        }
        onComplete={handleQuizComplete}
        onExit={handleExitQuiz}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/5 to-baby-pink/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold gradient-text">QuizItNow</h1>
          <Button onClick={handleBackHome} className="bg-gray-200 text-gray-900">
            ← Back Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto py-12 px-4">
        {/* Quiz Title and Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📊 {quiz.questions.length} questions</span>
                <span>
                  📁 {quiz.sourceType.charAt(0).toUpperCase() + quiz.sourceType.slice(1)}
                </span>
                <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-6 py-3 bg-sky-blue text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold text-lg"
            >
              🚀 Quiz It Now
            </button>
          </div>
        </div>

        {/* Questions Preview - Organized by Difficulty */}
        <div className="grid grid-cols-1 gap-8">
          {/* Easy Questions */}
          {quiz.questions.some((q: any) => q.difficulty === 'easy') && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-100 border-b-4 border-green-500 px-6 py-4">
                <h3 className="text-xl font-bold text-green-900">
                  🟢 Easy Questions ({quiz.questions.filter((q: any) => q.difficulty === 'easy').length})
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {quiz.questions
                  .filter((q: any) => q.difficulty === 'easy')
                  .slice(0, 3)
                  .map((question: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                    >
                      <p className="font-semibold text-gray-900 mb-2">
                        {question.content}
                      </p>
                      <p className="text-sm text-green-700">
                        ✓ {question.explanation}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Medium Questions */}
          {quiz.questions.some((q: any) => q.difficulty === 'medium') && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-yellow-100 border-b-4 border-yellow-500 px-6 py-4">
                <h3 className="text-xl font-bold text-yellow-900">
                  🟡 Medium Questions ({quiz.questions.filter((q: any) => q.difficulty === 'medium').length})
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {quiz.questions
                  .filter((q: any) => q.difficulty === 'medium')
                  .slice(0, 3)
                  .map((question: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500"
                    >
                      <p className="font-semibold text-gray-900 mb-2">
                        {question.content}
                      </p>
                      <p className="text-sm text-yellow-700">
                        ✓ {question.explanation}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Hard Questions */}
          {quiz.questions.some((q: any) => q.difficulty === 'hard') && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-100 border-b-4 border-red-500 px-6 py-4">
                <h3 className="text-xl font-bold text-red-900">
                  🔴 Hard Questions ({quiz.questions.filter((q: any) => q.difficulty === 'hard').length})
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {quiz.questions
                  .filter((q: any) => q.difficulty === 'hard')
                  .slice(0, 3)
                  .map((question: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-500"
                    >
                      <p className="font-semibold text-gray-900 mb-2">
                        {question.content}
                      </p>
                      <p className="text-sm text-red-700">
                        ✓ {question.explanation}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-sky-blue/10 border-l-4 border-sky-blue rounded-lg p-6">
          <h4 className="font-bold text-gray-900 mb-2">💡 Ready to Test Your Knowledge?</h4>
          <p className="text-gray-700 text-sm">
            Click the "Quiz It Now" button to customize your quiz settings (number of questions,
            time limit, difficulty level) and begin the timed quiz taking mode.
          </p>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onStart={handleStartQuiz}
        totalQuestions={quiz.questions.length}
      />
    </div>
  );
}
