'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface QuizSettings {
  questionCount: number;
  timeLimit: number; // in minutes
  mixDifficulty: boolean;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: QuizSettings) => void;
  totalQuestions?: number;
}

/**
 * Settings modal for quiz taking mode
 * Allows user to customize quiz parameters
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onStart,
  totalQuestions = 31,
}) => {
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);
  const [mixDifficulty, setMixDifficulty] = useState(true);

  const handleStart = () => {
    onStart({
      questionCount,
      timeLimit,
      mixDifficulty,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Settings</h2>

        {/* Question Count Slider */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Number of Questions: {questionCount}/{totalQuestions}
          </label>
          <input
            type="range"
            min="5"
            max={totalQuestions}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-blue"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>{totalQuestions}</span>
          </div>
        </div>

        {/* Time Limit Slider */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Time Limit: {timeLimit} minutes
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-blue"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 min</span>
            <span>60 min</span>
          </div>
        </div>

        {/* Mix Difficulty Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Mix All Difficulty Levels
          </label>
          <button
            onClick={() => setMixDifficulty(!mixDifficulty)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              mixDifficulty ? 'bg-sky-blue' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                mixDifficulty ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-sky-blue/10 border border-sky-blue/30 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Total Duration:</span> {questionCount} questions in {timeLimit} minutes
            ({Math.round((timeLimit * 60) / questionCount)} sec per question)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1 bg-sky-blue text-white hover:bg-sky-600"
          >
            🚀 Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
