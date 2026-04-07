/**
 * Quiz Type Definitions
 * Comprehensive TypeScript interfaces for all quiz types
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'fillBlank' | 'oneWord' | 'trueFalse' | 'match' | 'assertionReason';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  correctAnswer: string;
  explanation: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: string[];
  correctAnswer: string;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fillBlank';
  correctAnswer: string;
}

export interface OneWordQuestion extends BaseQuestion {
  type: 'oneWord';
  correctAnswer: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'trueFalse';
  correctAnswer: 'true' | 'false';
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  pairs: MatchPair[];
  correctAnswer: string;
}

export interface AssertionReasonQuestion extends BaseQuestion {
  type: 'assertionReason';
  assertion: string;
  reason: string;
  correctAnswer: 'A' | 'R' | 'Both' | 'Neither';
}

export type AnyQuestion =
  | MCQQuestion
  | FillBlankQuestion
  | OneWordQuestion
  | TrueFalseQuestion
  | MatchQuestion
  | AssertionReasonQuestion;

export interface Quiz {
  success: boolean;
  error?: string;
  questions?: {
    easy: AnyQuestion[];
    medium: AnyQuestion[];
    hard: AnyQuestion[];
  };
  stats?: {
    totalQuestions: number;
    byType: Record<QuestionType, number>;
  };
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId?: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  completedAt: Date;
}
