/**
 * Gemini API Integration
 * Handles all communication with Google's Gemini 2.0 Flash model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * System prompt for Gemini to generate high-quality, structured quizzes
 * Enforces exactly 31 questions with specific distribution
 */
const SYSTEM_PROMPT = `You are an expert quiz generator. Your task is to create a comprehensive, well-structured quiz with EXACTLY 31 questions divided into 6 different question types.

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
      // 9 more easy questions here
    ],
    "medium": [
      // 10 medium questions here
    ],
    "hard": [
      // 11 hard questions here
    ]
  },
  "stats": {
    "totalQuestions": 31,
    "byType": {
      "mcq": 10,
      "fill_blank": 5,
      "one_word": 4,
      "true_false": 4,
      "match": 4,
      "assertion_reason": 4
    },
    "byDifficulty": {
      "easy": 10,
      "medium": 10,
      "hard": 11
    }
  }
}

QUESTION TYPE SPECIFICATIONS:

1. MCQ (Multiple Choice - 10 total):
{
  "type": "mcq",
  "content": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correctAnswer": "Paris",
  "explanation": "Paris is the capital and largest city of France."
}

2. Fill-in-the-Blank (5 total):
{
  "type": "fill_blank",
  "content": "The process of ____ converts light energy into chemical energy.",
  "correctAnswer": "photosynthesis",
  "explanation": "Photosynthesis is the process by which plants use sunlight to convert into energy."
}

3. One-Word Answer (4 total):
{
  "type": "one_word",
  "content": "What is the smallest prime number?",
  "correctAnswer": "2",
  "explanation": "2 is the smallest and only even prime number."
}

4. True/False (4 total):
{
  "type": "true_false",
  "content": "The Earth is flat.",
  "correctAnswer": false,
  "explanation": "The Earth is an oblate spheroid, not flat."
}

5. Match the Following (4 total):
{
  "type": "match",
  "content": "Match the organelles with their functions:",
  "pairs": [
    {"left": "Mitochondria", "right": "Energy production"},
    {"left": "Nucleus", "right": "DNA storage"},
    {"left": "Chloroplast", "right": "Photosynthesis"},
    {"left": "Ribosome", "right": "Protein synthesis"}
  ],
  "correctAnswer": {
    "Mitochondria": "Energy production",
    "Nucleus": "DNA storage",
    "Chloroplast": "Photosynthesis",
    "Ribosome": "Protein synthesis"
  },
  "explanation": "These organelles have specific functions in cellular operations."
}

6. Assertion & Reason (4 total):
{
  "type": "assertion_reason",
  "difficulty": "hard",
  "content": "Assertion: Water boils at 100°C. Reason: At this temperature, the vapor pressure equals atmospheric pressure.",
  "assertion": "Water boils at 100°C",
  "reason": "At this temperature, the vapor pressure equals atmospheric pressure",
  "correctAnswer": "both",
  "explanation": "Both the assertion and reason are correct, and the reason explains the assertion."
}

DIFFICULTY GUIDELINES:
- Easy: Fundamental concepts, direct recall, basic definitions
- Medium: Understanding concepts, simple application, interpretation
- Hard: Analysis, synthesis, application to complex scenarios, critical thinking

IMPORTANT RULES:
✓ Return ONLY JSON, NO other text
✓ NO markdown code blocks (no \`\`\`json \`\`\`)
✓ NO explanations before or after JSON
✓ Validate JSON is properly formatted
✓ Ensure exactly 31 questions
✓ Each question must have explanation
✓ Mix question types evenly across difficulties
✓ Make questions educational and accurate
✓ Avoid trick questions, be clear and fair`;

/**
 * Generate a quiz from a topic using Gemini API
 */
export async function generateQuizWithGemini(topic: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured. Set GEMINI_API_KEY in .env.local',
      };
    }

    if (!topic || !topic.trim()) {
      return {
        success: false,
        error: 'Topic cannot be empty',
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const userPrompt = `Create a comprehensive quiz based on the following topic/content:

TOPIC: ${topic}

Remember:
- Generate EXACTLY 31 questions (10 MCQ + 5 fill-blank + 4 one-word + 4 T/F + 4 match + 4 assertion-reason)
- Difficulty split: 10 easy, 10 medium, 11 hard
- Return ONLY valid JSON, no markdown or extra text
- Each question needs a correct answer and explanation`;

    console.log('[Gemini] Generating quiz from topic:', topic.substring(0, 50) + '...');

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: SYSTEM_PROMPT,
    });

    const response = await result.response;
    const responseText = response.text();

    console.log('[Gemini] Received response, parsing...');

    // Clean up response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError);
      console.error('[Gemini] Response text:', cleanedText.substring(0, 200));
      return {
        success: false,
        error: 'Failed to parse quiz from AI response. Invalid JSON format.',
      };
    }

    // Validate response structure
    if (!parsedResponse.success || !parsedResponse.questions) {
      return {
        success: false,
        error: 'Invalid quiz structure received from AI',
      };
    }

    // Validate question count
    const easyCount = parsedResponse.questions.easy?.length || 0;
    const mediumCount = parsedResponse.questions.medium?.length || 0;
    const hardCount = parsedResponse.questions.hard?.length || 0;
    const totalCount = easyCount + mediumCount + hardCount;

    if (totalCount !== 31) {
      console.warn(
        `[Gemini] Warning: Generated ${totalCount} questions instead of 31`
      );
    }

    console.log(
      '[Gemini] Quiz generated successfully:',
      `Easy=${easyCount}, Medium=${mediumCount}, Hard=${hardCount}, Total=${totalCount}`
    );

    return {
      success: true,
      data: parsedResponse,
    };
  } catch (error) {
    console.error('[Gemini] Error generating quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific API errors
    if (errorMessage.includes('API key')) {
      return {
        success: false,
        error: 'Invalid Gemini API key. Check your configuration.',
      };
    }

    if (errorMessage.includes('quota')) {
      return {
        success: false,
        error: 'API quota exceeded. Please try again later.',
      };
    }

    return {
      success: false,
      error: `Failed to generate quiz: ${errorMessage}`,
    };
  }
}

/**
 * Validate quiz structure
 */
export function validateQuizStructure(quiz: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!quiz.questions) {
    errors.push('Quiz must have questions');
    return { valid: false, errors };
  }

  const easyCount = quiz.questions.easy?.length || 0;
  const mediumCount = quiz.questions.medium?.length || 0;
  const hardCount = quiz.questions.hard?.length || 0;
  const totalCount = easyCount + mediumCount + hardCount;

  if (totalCount !== 31) {
    errors.push(
      `Expected 31 total questions, got ${totalCount} (Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount})`
    );
  }

  return { valid: errors.length === 0, errors };
}
