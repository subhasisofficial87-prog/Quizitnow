import { NextRequest, NextResponse } from 'next/server';
import { generateLocalQuiz } from '@/lib/local-quiz-generator';
import { generateQuizFromContent } from '@/lib/content-based-generator';

/**
 * POST /api/generate
 * Generate a quiz from topic, PDF text, or image text
 *
 * For PDF/Image: Uses content-based generation (creates questions from actual extracted text)
 * For Topic: Uses local template-based generation
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

    if (input.length > 50000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input is too long (maximum 50000 characters)',
        },
        { status: 400 }
      );
    }

    console.log('[API] POST /api/generate - Source:', source, '- Characters:', input.length);

    let result;

    // Use different generators based on source
    if (source === 'pdf' || source === 'image') {
      // For PDF/Image: use content-based generation (creates questions from actual extracted text)
      console.log('[API] Using content-based generator for', source);
      result = await generateQuizFromContent(input.trim());
    } else {
      // For topic: use local template-based generation
      console.log('[API] Using template-based generator for topic');
      result = await generateLocalQuiz(input.trim(), source);
    }

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
      // Extract first meaningful phrase from content
      const lines = input.split('\n').filter((line) => line.trim().length > 10);
      title = lines[0] ? lines[0].substring(0, 60) : `${source.toUpperCase()} Content`;
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
          extractedText: source !== 'topic' ? input.substring(0, 500) : undefined, // Store preview of extracted text
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
      message: 'Quiz generation endpoint is ready. Supports topic-based and content-based (PDF/Image) quiz generation.',
      generators: {
        topic: 'Template-based generation with topic keywords',
        pdf: 'Content-based generation from extracted PDF text',
        image: 'Content-based generation from extracted image text (OCR)',
      },
    },
    { status: 200 }
  );
}
