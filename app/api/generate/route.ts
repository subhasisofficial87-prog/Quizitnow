import { NextRequest, NextResponse } from 'next/server';
import { generateLocalQuiz } from '@/lib/local-quiz-generator';

/**
 * POST /api/generate
 * Generate a quiz from topic, PDF text, or image text
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { topic, pdfText, imageText, sourceType = 'topic' } = body;

    // Determine source and input
    let input = '';
    let source = sourceType;

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
      return NextResponse.json(
        {
          success: false,
          error: 'Topic, PDF text, or image text is required',
        },
        { status: 400 }
      );
    }

    // Validate input
    if (!input || !input.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input content cannot be empty',
        },
        { status: 400 }
      );
    }

    if (input.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input must be at least 3 characters',
        },
        { status: 400 }
      );
    }

    if (input.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input is too long (maximum 10000 characters)',
        },
        { status: 400 }
      );
    }

    console.log('[API] POST /api/generate - Source:', source, '- Content:', input.substring(0, 50));

    // Generate quiz using local generator
    const result = await generateLocalQuiz(input.trim(), source);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate quiz',
        },
        { status: 500 }
      );
    }

    // Determine title based on source
    let title = input.substring(0, 50);
    if (source === 'pdf' || source === 'image') {
      title = `${source.toUpperCase()} Content`;
    }

    // Return quiz data
    return NextResponse.json(
      {
        success: true,
        quiz: {
          id: `quiz-${Date.now()}`,
          title,
          sourceType: source,
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
      message: 'Quiz generation endpoint is ready. Use POST to generate quizzes from topic, PDF, or image.',
    },
    { status: 200 }
  );
}
