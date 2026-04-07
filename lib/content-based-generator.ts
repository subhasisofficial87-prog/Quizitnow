/**
 * Content-Based Quiz Generator
 * Generates meaningful questions from extracted text (PDF/Image)
 * Creates valid options and questions based on actual content
 */

import { Quiz, Difficulty, AnyQuestion } from './quiz-types';

interface ContentAnalysis {
  sentences: string[];
  paragraphs: string[];
  keyTerms: string[];
  definitions: Map<string, string>;
  concepts: string[];
}

/**
 * Analyze extracted text to identify key concepts and definitions
 */
function analyzeContent(text: string): ContentAnalysis {
  // Split into sentences and paragraphs
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  // Extract potential key terms (capitalized words, technical terms)
  const keyTerms = new Set<string>();
  const termRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  text.match(termRegex)?.forEach((term) => {
    if (term.length > 3 && !['The', 'This', 'That', 'These'].includes(term)) {
      keyTerms.add(term);
    }
  });

  // Extract definitions (text after "is", "means", "refers to", etc.)
  const definitions = new Map<string, string>();
  const definitionRegex = /(\b\w+\b)\s+(?:is|means|refers to|denotes|represents|defines)\s+([^.!?]+[.!?])/gi;
  let match;
  while ((match = definitionRegex.exec(text)) !== null) {
    definitions.set(match[1], match[2].trim());
  }

  // Identify concepts (sentences that explain something)
  const concepts = sentences.slice(0, 15).map((s) => s.trim());

  return {
    sentences,
    paragraphs,
    keyTerms: Array.from(keyTerms),
    definitions,
    concepts,
  };
}

/**
 * Generate MCQ question from content
 */
function generateContentMCQ(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.sentences.length < 2) {
    return null;
  }

  // Select a sentence as the basis
  const sentenceIdx = Math.floor(Math.random() * Math.min(analysis.sentences.length, 10));
  const sentence = analysis.sentences[sentenceIdx];

  // Extract key phrase from sentence
  const words = sentence.split(/\s+/);
  const keyPhrases = analysis.keyTerms.slice(0, 5);

  if (keyPhrases.length < 2) {
    return null;
  }

  // Create question from sentence
  const selectedPhrase = keyPhrases[0];
  const question = `Based on the text, what is the main point about ${selectedPhrase}?`;

  // Create options from content
  const correctOption = sentence
    .substring(0, Math.min(100, sentence.length))
    .replace(/^[^:]*:\s*/, '');

  // Generate wrong options from other concepts
  const wrongOptions = [
    analysis.concepts[Math.floor(Math.random() * analysis.concepts.length)]
      ?.substring(0, 80)
      .trim() || 'An unrelated concept',
    analysis.sentences[Math.floor(Math.random() * analysis.sentences.length)]
      ?.substring(0, 80)
      .trim() || 'A different statement',
    `A misconception about ${selectedPhrase}`,
  ].filter((opt) => opt && opt.length > 5);

  const allOptions = [correctOption, ...wrongOptions].slice(0, 4);
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

  return {
    id,
    type: 'mcq',
    difficulty,
    content: question,
    options: shuffledOptions,
    correctAnswer: correctOption,
    explanation: `This answer is directly supported by the extracted content. ${selectedPhrase} is discussed as: ${correctOption.substring(0, 150)}...`,
  };
}

/**
 * Generate fill-in-blank question from definitions
 */
function generateContentFillBlank(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.definitions.size === 0 && analysis.keyTerms.length === 0) {
    return null;
  }

  // Use a definition if available
  if (analysis.definitions.size > 0) {
    const defArray = Array.from(analysis.definitions.entries());
    const [term, definition] = defArray[Math.floor(Math.random() * defArray.length)];

    return {
      id,
      type: 'fillBlank',
      difficulty,
      content: `According to the text, "${definition.substring(0, 80)}..." refers to ______.`,
      correctAnswer: term,
      explanation: `The term "${term}" is explicitly defined in the content as: ${definition.substring(0, 150)}`,
    };
  }

  // Otherwise use key terms
  const keyTerm = analysis.keyTerms[Math.floor(Math.random() * analysis.keyTerms.length)];
  const relatedSentence = analysis.sentences.find((s) => s.includes(keyTerm)) || analysis.sentences[0];

  return {
    id,
    type: 'fillBlank',
    difficulty,
    content: `The text describes a concept known as ______, which is discussed as: ${relatedSentence.substring(0, 100)}...`,
    correctAnswer: keyTerm,
    explanation: `"${keyTerm}" is a key concept mentioned in the extracted content.`,
  };
}

/**
 * Generate true/false question from content
 */
function generateContentTrueFalse(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.sentences.length === 0) {
    return null;
  }

  const isTrue = Math.random() > 0.4;
  const sentence = analysis.sentences[Math.floor(Math.random() * analysis.sentences.length)];
  const keyTerm = analysis.keyTerms[0] || 'this concept';

  if (isTrue) {
    // True statement from actual content
    return {
      id,
      type: 'trueFalse',
      difficulty,
      content: `According to the text: "${sentence.substring(0, 120)}..."`,
      correctAnswer: 'true',
      explanation: `This statement is directly supported by the extracted content.`,
    };
  } else {
    // False statement (opposite or contradiction)
    const contradictory = `The text states that ${keyTerm} is NOT as simple as commonly understood.`;
    return {
      id,
      type: 'trueFalse',
      difficulty,
      content: `${contradictory}`,
      correctAnswer: 'false',
      explanation: `This contradicts the information provided in the extracted content.`,
    };
  }
}

/**
 * Generate one-word answer question from content
 */
function generateContentOneWord(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.keyTerms.length === 0) {
    return null;
  }

  const keyTerm = analysis.keyTerms[Math.floor(Math.random() * analysis.keyTerms.length)];
  const relevantSentence = analysis.sentences.find((s) => s.includes(keyTerm)) || analysis.sentences[0];

  return {
    id,
    type: 'oneWord',
    difficulty,
    content: `What is the key term mentioned in this passage about "${relevantSentence.substring(0, 60)}..."?`,
    correctAnswer: keyTerm,
    explanation: `"${keyTerm}" is a significant term highlighted in the extracted content.`,
  };
}

/**
 * Generate match question from definitions
 */
function generateContentMatch(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  const defArray = Array.from(analysis.definitions.entries()).slice(0, 3);

  if (defArray.length < 2) {
    return null;
  }

  const pairs = defArray.map(([term, def]) => ({
    left: term,
    right: def.substring(0, 50) + (def.length > 50 ? '...' : ''),
  }));

  const pairsString = pairs.map((p, i) => `${i + 1}. ${p.left} → ${p.right}`).join('; ');

  return {
    id,
    type: 'match',
    difficulty,
    content: `Match the terms with their definitions from the text:`,
    pairs,
    correctAnswer: pairsString,
    explanation: `These are the correct matches based on the definitions provided in the extracted content.`,
  };
}

/**
 * Generate assertion-reason question from content
 */
function generateContentAssertionReason(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.concepts.length < 2) {
    return null;
  }

  const concept1 = analysis.concepts[0];
  const concept2 = analysis.concepts[1];

  const scenarios = [
    {
      assertion: `${concept1.substring(0, 80)}`,
      reason: `Because ${concept2.substring(0, 80)}`,
      answer: 'Both',
    },
    {
      assertion: `The text states that "${concept1.substring(0, 60)}"`,
      reason: `However, this statement is contradicted elsewhere`,
      answer: 'A',
    },
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    id,
    type: 'assertionReason',
    difficulty,
    content: `Read the following based on the extracted text:`,
    assertion: scenario.assertion,
    reason: scenario.reason,
    correctAnswer: scenario.answer,
    explanation: `This is supported by the content analysis: ${scenario.assertion.substring(0, 100)}`,
  };
}

/**
 * Generate quiz from extracted content
 */
export async function generateQuizFromContent(extractedText: string): Promise<Quiz> {
  try {
    console.log('[ContentGenerator] Analyzing extracted text...');

    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Extracted text is too short to generate meaningful questions');
    }

    // Analyze the content
    const analysis = analyzeContent(extractedText);

    if (analysis.keyTerms.length === 0 && analysis.definitions.size === 0) {
      throw new Error('Could not extract meaningful content. Please ensure the document contains readable text.');
    }

    console.log(`[ContentGenerator] Found ${analysis.keyTerms.length} key terms, ${analysis.definitions.size} definitions`);

    // Initialize questions by difficulty
    const questions: { easy: AnyQuestion[]; medium: AnyQuestion[]; hard: AnyQuestion[] } = {
      easy: [],
      medium: [],
      hard: [],
    };

    // Generate questions for each difficulty level
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    let questionId = 0;

    for (const difficulty of difficulties) {
      const key = difficulty as keyof typeof questions;
      const targetCount = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 10 : 11;

      // Generate MCQ (3-4 per difficulty)
      for (let i = 0; i < 3; i++) {
        const mcq = generateContentMCQ(analysis, difficulty, `${difficulty}-mcq-${questionId++}`);
        if (mcq) questions[key].push(mcq);
      }

      // Generate Fill-blank (1-2 per difficulty)
      for (let i = 0; i < 2; i++) {
        const fb = generateContentFillBlank(analysis, difficulty, `${difficulty}-fb-${questionId++}`);
        if (fb) questions[key].push(fb);
      }

      // Generate One-word (1 per difficulty)
      const ow = generateContentOneWord(analysis, difficulty, `${difficulty}-ow-${questionId++}`);
      if (ow) questions[key].push(ow);

      // Generate True/False (1-2 per difficulty)
      for (let i = 0; i < 2; i++) {
        const tf = generateContentTrueFalse(analysis, difficulty, `${difficulty}-tf-${questionId++}`);
        if (tf) questions[key].push(tf);
      }

      // Generate Match (1 per difficulty)
      const match = generateContentMatch(analysis, difficulty, `${difficulty}-m-${questionId++}`);
      if (match) questions[key].push(match);

      // Generate Assertion-Reason (1 per difficulty)
      const ar = generateContentAssertionReason(analysis, difficulty, `${difficulty}-ar-${questionId++}`);
      if (ar) questions[key].push(ar);

      // Trim to exact count if needed
      questions[key] = questions[key].slice(0, targetCount);
    }

    // Ensure we have exactly 31 questions
    const allQuestions = [...questions.easy, ...questions.medium, ...questions.hard];
    const totalQuestions = allQuestions.length;

    console.log(`[ContentGenerator] Generated ${totalQuestions} questions from content`);

    if (totalQuestions === 0) {
      throw new Error('Failed to generate questions from the extracted content');
    }

    return {
      success: true,
      questions,
      stats: {
        totalQuestions: Math.min(totalQuestions, 31),
        byType: {
          mcq: allQuestions.filter((q) => q.type === 'mcq').length,
          fillBlank: allQuestions.filter((q) => q.type === 'fillBlank').length,
          oneWord: allQuestions.filter((q) => q.type === 'oneWord').length,
          trueFalse: allQuestions.filter((q) => q.type === 'trueFalse').length,
          match: allQuestions.filter((q) => q.type === 'match').length,
          assertionReason: allQuestions.filter((q) => q.type === 'assertionReason').length,
        },
      },
    };
  } catch (error) {
    console.error('[ContentGenerator] Error:', error);
    return {
      success: false,
      error: `Failed to generate quiz from content: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
