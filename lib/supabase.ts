/**
 * Supabase Client Configuration
 * Initialize and configure Supabase for database and auth
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Environment variables not configured. Database features disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Save quiz result to database
 */
export async function saveQuizResult(
  userId: string | undefined,
  quizData: {
    title: string;
    sourceType: string;
    questions: any;
    stats: any;
  },
  answers: Record<string, string>,
  score: number,
  totalQuestions: number,
  timeTakenSeconds: number
) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Supabase] Database not configured');
      return null;
    }

    // Save quiz if not already saved
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          user_id: userId,
          title: quizData.title,
          source_type: quizData.sourceType,
          questions_json: quizData.questions,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (quizError) {
      console.error('[Supabase] Quiz save error:', quizError);
      return null;
    }

    // Save result
    const { data: result, error: resultError } = await supabase
      .from('quiz_results')
      .insert([
        {
          quiz_id: quiz.id,
          user_id: userId,
          answers_json: answers,
          score,
          total_questions: totalQuestions,
          time_taken_seconds: timeTakenSeconds,
          completed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (resultError) {
      console.error('[Supabase] Result save error:', resultError);
      return null;
    }

    console.log('[Supabase] Quiz result saved:', result.id);
    return result;
  } catch (error) {
    console.error('[Supabase] Error saving quiz result:', error);
    return null;
  }
}

/**
 * Get user's quiz history
 */
export async function getUserQuizHistory(userId: string) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Supabase] Database not configured');
      return [];
    }

    const { data, error } = await supabase
      .from('quiz_results')
      .select(
        `
        id,
        score,
        total_questions,
        time_taken_seconds,
        completed_at,
        quizzes:quiz_id(title, source_type)
      `
      )
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('[Supabase] History fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Supabase] Error fetching quiz history:', error);
    return [];
  }
}

/**
 * Get specific quiz result
 */
export async function getQuizResult(resultId: string) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Supabase] Database not configured');
      return null;
    }

    const { data, error } = await supabase
      .from('quiz_results')
      .select('*, quizzes(*)')
      .eq('id', resultId)
      .single();

    if (error) {
      console.error('[Supabase] Result fetch error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Supabase] Error fetching result:', error);
    return null;
  }
}
