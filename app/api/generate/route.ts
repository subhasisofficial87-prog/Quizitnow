import { NextRequest, NextResponse } from 'next/server';
import { generateLocalQuiz } from '@/lib/local-quiz-generator';

/**
 * POST /api/generate
 * Generate a quiz from a topic using local quiz generator
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { topic } = body;

    // Validate topic
    if (!topic || !topic.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is required',
        },
        { status: 400 }
      );
    }

    if (topic.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic must be at least 3 characters',
        },
        { status: 400 }
      );
    }

    if (topic.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is too long (maximum 5000 characters)',
        },
        { status: 400 }
      );
    }

    console.log('[API] POST /api/generate - Topic:', topic.substring(0, 50));

    // Generate quiz using local generator
    const result = await generateLocalQuiz(topic.trim());

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate quiz',
        },
        { status: 500 }
      );
    }

    // Return quiz data
    return NextResponse.json(
      {
        success: true,
        quiz: {
          id: `quiz-${Date.now()}`,
          title: topic.substring(0, 50),
          sourceType: 'topic',
          createdAt: new Date().toISOString(),
          questions: result.questions,
          stats: result.stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error in /api/generate:', error);
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

/**
 * GET /api/generate
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ready',
      message: 'Quiz generation endpoint is ready. Use POST to generate quizzes.',
    },
    { status: 200 }
  );
}
