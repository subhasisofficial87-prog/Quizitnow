import { NextRequest, NextResponse } from 'next/server';
import { generateQuizWithGroq, validateApiKey } from '@/lib/groq';

/**
 * POST /api/quiz/generate
 * Generate a quiz from a topic using HuggingFace Inference API
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { topic } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is required',
        },
        { status: 400 }
      );
    }

    if (topic.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic must be at least 10 characters',
        },
        { status: 400 }
      );
    }

    // Check maximum length (5000 characters for PDF content)
    if (topic.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input is too long (maximum 5000 characters)',
        },
        { status: 400 }
      );
    }

    // Detect input type (PDF, Image, or Topic)
    let sourceType = 'topic';
    let titleForQuiz = topic.trim();

    if (topic.trim().startsWith('PDF:')) {
      sourceType = 'pdf';
      const titleMatch = topic.match(/PDF:\s*([^\n]+)/);
      if (titleMatch) {
        titleForQuiz = titleMatch[1];
      }
    } else if (topic.trim().startsWith('Image:')) {
      sourceType = 'image';
      const titleMatch = topic.match(/Image:\s*([^\n]+)/);
      if (titleMatch) {
        titleForQuiz = titleMatch[1];
      }
    }

    console.log(
      '[API] POST /api/quiz/generate - Type:',
      sourceType,
      '- Title:',
      titleForQuiz.substring(0, 50)
    );

    // Generate quiz using Groq
    const result = await generateQuizWithGroq({ topic: topic.trim() });

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
          title: titleForQuiz,
          sourceType: sourceType,
          createdAt: new Date().toISOString(),
          questions: result.questions,
          stats: result.stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error in /api/quiz/generate:', error);
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
 * GET /api/quiz/generate
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
