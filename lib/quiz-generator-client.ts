/**
 * Client-side quiz generator
 *
 * Mirrors the former /api/generate route but runs entirely in the browser.
 * Used by the Android (Capacitor) build since static export cannot ship
 * Next.js route handlers.
 */

import { generateLocalQuiz } from './local-quiz-generator';
import { generateQuizFromContent } from './content-based-generator';

export type QuizSource = 'topic' | 'pdf' | 'image';

export interface GenerateQuizInput {
  topic?: string;
  pdfText?: string;
  imageText?: string;
  sourceType?: QuizSource;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  sourceType: QuizSource;
  createdAt: string;
  extractedText?: string;
  questions: NonNullable<Awaited<ReturnType<typeof generateLocalQuiz>>['questions']>;
  stats: NonNullable<Awaited<ReturnType<typeof generateLocalQuiz>>['stats']>;
}

export interface GenerateQuizResponse {
  success: boolean;
  quiz?: GeneratedQuiz;
  error?: string;
}

export async function generateQuiz(
  body: GenerateQuizInput
): Promise<GenerateQuizResponse> {
  const { topic, pdfText, imageText, sourceType = 'topic' } = body;

  // Determine source and input
  let input = '';
  let source: QuizSource = sourceType;

  if (pdfText) {
    input = pdfText;
    source = 'pdf';
  } else if (imageText) {
    input = imageText;
    source = 'image';
  } else if (topic) {
    input = topic;
    source = 'topic';
  } else {
    return { success: false, error: 'Topic, PDF text, or image text is required' };
  }

  if (!input || !input.trim()) {
    return { success: false, error: 'Input content cannot be empty' };
  }
  if (input.trim().length < 3) {
    return { success: false, error: 'Input must be at least 3 characters' };
  }
  if (input.length > 50000) {
    return { success: false, error: 'Input is too long (maximum 50000 characters)' };
  }

  const result =
    source === 'pdf' || source === 'image'
      ? await generateQuizFromContent(input.trim())
      : await generateLocalQuiz(input.trim(), source);

  if (!result.success || !result.questions || !result.stats) {
    return { success: false, error: result.error || 'Failed to generate quiz' };
  }

  // Determine title based on source
  let title = input.substring(0, 50);
  if (source === 'pdf' || source === 'image') {
    const lines = input.split('\n').filter((line) => line.trim().length > 10);
    title = lines[0] ? lines[0].substring(0, 60) : `${source.toUpperCase()} Content`;
  }

  return {
    success: true,
    quiz: {
      id: `quiz-${Date.now()}`,
      title,
      sourceType: source,
      createdAt: new Date().toISOString(),
      extractedText: source !== 'topic' ? input.substring(0, 500) : undefined,
      questions: result.questions,
      stats: result.stats,
    },
  };
}
