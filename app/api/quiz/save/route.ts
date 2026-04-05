import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/quiz/save
 * Save quiz results to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      user_id,
      quiz_title,
      source_type,
      total_questions,
      correct_answers,
      score,
      time_spent_seconds,
      answers,
      questions,
    } = body;

    if (
      !user_id ||
      !quiz_title ||
      !source_type ||
      !total_questions ||
      correct_answers === undefined ||
      score === undefined ||
      !time_spent_seconds ||
      !answers ||
      !questions
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Score must be between 0 and 100',
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase configuration missing',
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Save to database
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([
        {
          user_id,
          quiz_title,
          source_type,
          total_questions,
          correct_answers,
          score,
          time_spent_seconds,
          answers_json: answers,
          questions_json: questions,
        },
      ])
      .select();

    if (error) {
      console.error('[API] Error saving quiz results:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save quiz results: ' + error.message,
        },
        { status: 500 }
      );
    }

    console.log('[API] Quiz results saved successfully:', data?.[0]?.id);

    return NextResponse.json(
      {
        success: true,
        data: data?.[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error in /api/quiz/save:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
