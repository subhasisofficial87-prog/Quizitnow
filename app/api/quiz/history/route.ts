import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/quiz/history
 * Fetch user's quiz history
 */
export async function GET(request: NextRequest) {
  try {
    // Extract user_id from query parameters
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
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

    // Fetch quiz results for the user
    const { data, error, count } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .order('attempted_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[API] Error fetching quiz history:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch quiz history: ' + error.message,
        },
        { status: 500 }
      );
    }

    console.log('[API] Fetched quiz history for user:', user_id, '- Count:', count);

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: count || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error in /api/quiz/history:', error);
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
