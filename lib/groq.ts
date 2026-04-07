/**
 * Groq API Integration
 * Handles all communication with Groq's free inference API
 * Uses mixtral-8x7b-32768 model for quiz generation
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

/**
 * System prompt for quiz generation
 */
const SYSTEM_PROMPT = `You are an expert quiz generator. Your task is to create a comprehensive, well-structured quiz with EXACTLY 31 questions.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - NO markdown, NO explanations, NO additional text
2. Generate EXACTLY 31 questions total (no more, no less)
3. Distribute by type: 10 MCQ + 5 Fill-blank + 4 One-word + 4 True/False + 4 Match + 4 Assertion-Reason
4. Categorize by difficulty: 10 Easy, 10 Medium, 11 Hard
5. Each question MUST have correct answer and brief explanation

RESPONSE FORMAT (STRICT JSON ONLY):
{
  "success": true,
  "questions": {
    "easy": [
      {
        "id": "easy-0",
        "type": "mcq",
        "difficulty": "easy",
        "content": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4",
        "explanation": "2 plus 2 equals 4"
      }
    ],
    "medium": [],
    "hard": []
  },
  "stats": {
    "totalQuestions": 31,
    "byType": {
      "mcq": 10,
      "fillBlank": 5,
      "oneWord": 4,
      "trueFalse": 4,
      "match": 4,
      "assertionReason": 4
    }
  }
}`;

interface GenerateQuizParams {
  topic?: string;
  pdfText?: string;
  imageText?: string;
}

interface QuizResponse {
  success: boolean;
  error?: string;
  questions?: {
    easy: any[];
    medium: any[];
    hard: any[];
  };
  stats?: {
    totalQuestions: number;
    byType: Record<string, number>;
  };
}

export const generateQuizWithGroq = async (
  params: GenerateQuizParams
): Promise<QuizResponse> => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Set NEXT_PUBLIC_GROQ_API_KEY in environment variables');
    }

    // Determine source and create prompt
    let sourceType = 'topic';
    let sourceContent = params.topic || 'General Knowledge';

    if (params.pdfText) {
      sourceType = 'pdf';
      sourceContent = params.pdfText.substring(0, 3000); // Limit to 3000 chars
    } else if (params.imageText) {
      sourceType = 'image';
      sourceContent = params.imageText.substring(0, 3000); // Limit to 3000 chars
    }

    const userPrompt = `Generate a quiz about: ${sourceContent}

${SYSTEM_PROMPT}`;

    console.log('[Groq] Calling API for', sourceType, '...');

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator that returns ONLY valid JSON with no markdown or explanations.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Groq] API Error:', error);
      throw new Error(`Groq API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('[Groq] Raw response:', data);

    // Extract generated text from Groq response
    let generatedText = '';
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      generatedText = data.choices[0].message.content;
    } else {
      throw new Error('Unexpected Groq response format');
    }

    // Extract JSON from response (it might be wrapped in markdown or text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Groq response');
    }

    const quizData: QuizResponse = JSON.parse(jsonMatch[0]);

    if (!quizData.success) {
      throw new Error('Quiz generation failed');
    }

    console.log('[Groq] Quiz generated successfully');
    return quizData;
  } catch (error) {
    console.error('[Groq] Error:', error);
    throw new Error(
      `Failed to generate quiz with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validateApiKey = (): boolean => {
  return !!GROQ_API_KEY;
};
