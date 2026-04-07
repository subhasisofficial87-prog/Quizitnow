/**
 * HuggingFace Inference API Integration
 * Handles all communication with HuggingFace's free inference API
 * Uses Mistral-7B-Instruct model for quiz generation
 */

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/google/flan-t5-large';
const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

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

export const generateQuizWithHuggingFace = async (
  params: GenerateQuizParams
): Promise<QuizResponse> => {
  try {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HuggingFace API key not configured. Set NEXT_PUBLIC_HUGGINGFACE_API_KEY in .env');
    }

    // Determine source and create prompt
    let sourceType = 'topic';
    let sourceContent = params.topic || 'General Knowledge';

    if (params.pdfText) {
      sourceType = 'pdf';
      sourceContent = params.pdfText.substring(0, 2000); // Limit to 2000 chars
    } else if (params.imageText) {
      sourceType = 'image';
      sourceContent = params.imageText.substring(0, 2000); // Limit to 2000 chars
    }

    const userPrompt = `Generate a quiz about: ${sourceContent}

${SYSTEM_PROMPT}`;

    console.log('[HuggingFace] Calling API for', sourceType, '...');

    // Call HuggingFace Inference API
    const response = await fetch(HUGGINGFACE_API_URL, {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: userPrompt,
        parameters: {
          max_length: 2048,
          temperature: 0.7,
        },
        options: {
          wait_for_model: true,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[HuggingFace] API Error:', error);
      throw new Error(`HuggingFace API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('[HuggingFace] Raw response:', data);

    // HuggingFace returns an array with generated_text
    let generatedText = '';
    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      throw new Error('Unexpected HuggingFace response format');
    }

    // Extract JSON from response (it might be wrapped in markdown or text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in HuggingFace response');
    }

    const quizData: QuizResponse = JSON.parse(jsonMatch[0]);

    if (!quizData.success) {
      throw new Error('Quiz generation failed');
    }

    console.log('[HuggingFace] Quiz generated successfully');
    return quizData;
  } catch (error) {
    console.error('[HuggingFace] Error:', error);
    throw new Error(
      `Failed to generate quiz with HuggingFace: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validateApiKey = (): boolean => {
  return !!HUGGINGFACE_API_KEY;
};
