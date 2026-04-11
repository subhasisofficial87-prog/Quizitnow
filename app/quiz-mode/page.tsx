'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function QuizModePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizData = searchParams?.get('quiz');

  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!quizData) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(quizData));
      setQuiz(parsed);
    } catch (e) {
      console.error('Failed to parse quiz data');
      router.push('/');
    }
  }, [quizData, router]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            handleSubmitQuiz();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
        <div className="text-center">
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const allQuestions = [...quiz.questions.easy, ...quiz.questions.medium, ...quiz.questions.hard];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let score = 0;
    allQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score++;
      }
    });

    // Navigate to results
    const resultData = {
      quizTitle: quiz.title,
      totalQuestions: allQuestions.length,
      score,
      answers,
      questions: allQuestions,
    };

    router.push(`/results?data=${encodeURIComponent(JSON.stringify(resultData))}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">Question {currentQuestionIndex + 1} of {allQuestions.length}</p>
          </div>
          <div className={`text-4xl font-bold font-mono ${timeLeft < 60 ? 'text-red-600' : 'text-sky-blue'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-blue to-baby-pink transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.content}</h2>

          {/* Question Type Specific Rendering */}
          <div className="mb-8">
            {currentQuestion.type === 'mcq' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-sky-blue bg-sky-blue/10'
                        : 'border-gray-300 hover:border-sky-blue'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[currentQuestion.id] === option
                          ? 'border-sky-blue bg-sky-blue'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'trueFalse' && (
              <div className="flex gap-4">
                {['true', 'false'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`flex-1 p-4 font-bold rounded-lg transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'bg-sky-blue text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {option === 'true' ? '✓ True' : '✗ False'}
                  </button>
                ))}
              </div>
            )}

            {(currentQuestion.type === 'fillBlank' || currentQuestion.type === 'oneWord') && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-sky-blue"
              />
            )}

            {currentQuestion.type === 'match' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Match the pairs..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-sky-blue resize-none"
                rows={3}
              />
            )}

            {currentQuestion.type === 'assertionReason' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Assertion:</p>
                  <p className="text-gray-900">{currentQuestion.assertion}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Reason:</p>
                  <p className="text-gray-900">{currentQuestion.reason}</p>
                </div>
                <div className="space-y-3">
                  {['Both', 'Neither', 'A', 'R'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        answers[currentQuestion.id] === option
                          ? 'border-sky-blue bg-sky-blue/10'
                          : 'border-gray-300 hover:border-sky-blue'
                      }`}
                    >
                      <span className="font-semibold text-gray-900">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-bold py-3 rounded-lg transition-all"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === allQuestions.length - 1}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-bold py-3 rounded-lg transition-all"
          >
            Next →
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitQuiz}
          className="w-full bg-gradient-to-r from-sky-blue to-baby-pink text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all text-lg"
        >
          Submit Quiz & See Results
        </button>

        {/* Answered Questions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Questions Answered: {Object.keys(answers).length}/{allQuestions.length}</h3>
          <div className="grid grid-cols-10 gap-2">
            {allQuestions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded font-bold transition-all ${
                  answers[q.id]
                    ? 'bg-green-500 text-white'
                    : idx === currentQuestionIndex
                    ? 'bg-sky-blue text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function QuizModePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-blue/10 to-baby-pink/10">
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      }
    >
      <QuizModePageInner />
    </Suspense>
  );
}
