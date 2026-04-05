'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export interface QuizQuestion {
  id: string;
  type: string;
  content: string;
  options?: string[];
  correctAnswer: string | boolean | Record<string, string>;
  explanation: string;
  difficulty: string;
}

export interface QuizTakerProps {
  questions: QuizQuestion[];
  quizTitle: string;
  timeLimit: number; // in minutes
  onComplete: (answers: Record<number, string>, timeSpent: number) => void;
  onExit: () => void;
}

/**
 * Full-screen quiz taking interface with timer
 * Handles question display, answer collection, and timer
 */
export const QuizTaker: React.FC<QuizTakerProps> = ({
  questions,
  quizTitle,
  timeLimit,
  onComplete,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (isCompleted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          handleSubmitQuiz();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Color based on time remaining
  const getTimeColor = () => {
    const percentRemaining = timeRemaining / (timeLimit * 60);
    if (percentRemaining > 0.5) return 'text-green-600';
    if (percentRemaining > 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handle answer selection
  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value,
    });
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentAnswer(answers[currentQuestionIndex + 1] || '');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    setIsCompleted(true);
    const timeSpent = timeLimit * 60 - timeRemaining;
    onComplete(answers, timeSpent);
  };

  // Exit quiz (with confirmation)
  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your answers will not be saved.')) {
      onExit();
    }
  };

  // Render answer input based on question type
  const renderAnswerInput = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => (
              <label
                key={idx}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  currentAnswer === option
                    ? 'border-sky-blue bg-sky-blue/5'
                    : 'border-gray-300 hover:border-sky-blue/50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['true', 'false'].map((value) => (
              <label
                key={value}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  currentAnswer === value
                    ? 'border-sky-blue bg-sky-blue/5'
                    : 'border-gray-300 hover:border-sky-blue/50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={value}
                  checked={currentAnswer === value}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-800 font-semibold">
                  {value === 'true' ? '✓ True' : '✗ False'}
                </span>
              </label>
            ))}
          </div>
        );

      case 'fill_blank':
      case 'one_word':
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-blue"
          />
        );

      default:
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-blue"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue/5 to-baby-pink/5 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quizTitle}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-xs text-gray-600">Time Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-sky-blue to-baby-pink transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Difficulty Badge */}
        <div className="mb-6">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              currentQuestion.difficulty === 'easy'
                ? 'bg-green-100 text-green-800'
                : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {currentQuestion.difficulty.toUpperCase()}
          </span>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.content}
          </h2>

          {/* Answer Input */}
          {renderAnswerInput()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </Button>

          <Button
            onClick={handleExit}
            className="flex-1 bg-red-100 text-red-700 hover:bg-red-200"
          >
            Exit Quiz
          </Button>

          {!isLastQuestion ? (
            <Button
              onClick={handleNextQuestion}
              className="flex-1 bg-sky-blue text-white hover:bg-sky-600"
            >
              Next →
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
            >
              Submit Quiz ✓
            </Button>
          )}
        </div>

        {/* Question Indicator */}
        <div className="mt-8 flex flex-wrap gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentAnswer(answers[idx] || '');
                setCurrentQuestionIndex(idx);
              }}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                idx === currentQuestionIndex
                  ? 'bg-sky-blue text-white'
                  : answers[idx]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
