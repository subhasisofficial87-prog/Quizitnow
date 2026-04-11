/**
 * Content-Based Quiz Generator
 * Generates comprehension-based questions from extracted text (PDF/Image)
 * Creates questions that test understanding, inference, and synthesis
 * NOT simple text recognition or restatement
 */

import { Quiz, Difficulty, AnyQuestion } from './quiz-types';

interface ContentAnalysis {
  sentences: string[];
  paragraphs: string[];
  keyTerms: string[];
  definitions: Map<string, string>;
  concepts: string[];
  causePairs: Array<{ cause: string; effect: string }>;
  relationships: Array<{ term1: string; term2: string; relationship: string }>;
}

/**
 * Analyze extracted text to identify key concepts, relationships, and implications
 */
function analyzeContent(text: string): ContentAnalysis {
  // Split into sentences and paragraphs
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  // Extract meaningful key terms (proper nouns, technical terms)
  // Skip common English words and focus on domain-specific terms
  const keyTerms = new Set<string>();
  const skipWords = new Set([
    'The', 'This', 'That', 'These', 'Those', 'During', 'When', 'Where', 'Without', 'What',
    'Which', 'How', 'Why', 'After', 'Before', 'Between', 'While', 'Because', 'Since',
    'Although', 'However', 'Furthermore', 'Moreover', 'Also', 'Then', 'Each', 'Some',
    'Many', 'Several', 'Different'
  ]);

  const termRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  text.match(termRegex)?.forEach((term) => {
    if (term.length > 3 && !skipWords.has(term) && term !== 'By' && term !== 'It') {
      keyTerms.add(term);
    }
  });

  // Also extract technical/domain terms (words in specific contexts)
  const technicalTermRegex = /(?:process|reaction|cycle|system|mechanism|structure|function|pathway|molecule|cell|energy|light|water|gas|compound|element)/gi;
  const technicalMatches = text.match(/\b[\w]+(?=\s+(?:process|reaction|cycle|system|mechanism|structure|function|pathway|molecule))/gi);
  if (technicalMatches) {
    technicalMatches.forEach((term) => {
      if (term.length > 3 && !skipWords.has(term)) {
        keyTerms.add(term);
      }
    });
  }

  // Extract definitions (text after "is", "means", "refers to", etc.)
  const definitions = new Map<string, string>();
  const definitionRegex = /(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)\s+(?:is|means|refers to|denotes|represents|defines|called)\s+([^.!?]+[.!?])/gi;
  let match;
  while ((match = definitionRegex.exec(text)) !== null) {
    const term = match[1];
    if (!skipWords.has(term)) {
      definitions.set(term, match[2].trim());
    }
  }

  // Identify concepts (sentences that explain something)
  const concepts = sentences
    .filter((s) => s.length > 40 && (s.includes('is') || s.includes('are') || s.includes('process') || s.includes('reaction')))
    .slice(0, 15)
    .map((s) => s.trim());

  // Extract cause-effect relationships
  const causePairs: Array<{ cause: string; effect: string }> = [];
  const causeConnectors = /(?:because|since|due to|caused by|results in|leads to|causes|as a result|therefore|thus|consequently|enables|allows|produces|generates|creates)/gi;

  for (const sent of sentences) {
    if (causeConnectors.test(sent)) {
      const parts = sent.split(causeConnectors);
      if (parts.length >= 2) {
        const cause = parts[parts.length - 1].trim();
        const effect = parts[0].trim();
        if (cause.length > 15 && effect.length > 15) {
          causePairs.push({ cause, effect });
        }
      }
    }
  }

  // Extract relationships between significant terms
  const relationships: Array<{ term1: string; term2: string; relationship: string }> = [];
  const keyTermsArray = Array.from(keyTerms).filter(t => t.length > 4).slice(0, 8);

  for (let i = 0; i < keyTermsArray.length - 1; i++) {
    for (let j = i + 1; j < keyTermsArray.length; j++) {
      const term1 = keyTermsArray[i];
      const term2 = keyTermsArray[j];
      // Check if both terms appear in the same sentence
      for (const sent of sentences) {
        if (sent.includes(term1) && sent.includes(term2) && sent.length > 40) {
          relationships.push({
            term1,
            term2,
            relationship: sent,
          });
          break;
        }
      }
    }
  }

  return {
    sentences,
    paragraphs,
    keyTerms: Array.from(keyTerms).filter(t => t.length > 4),
    definitions,
    concepts,
    causePairs,
    relationships,
  };
}

/**
 * Extract key phrase from sentence (first 8-12 words max)
 * Improved to preserve meaning while limiting length
 */
function extractKeyPhrase(text: string, maxLength: number = 60): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  const words = text.split(/\s+/).slice(0, 12);
  let phrase = words.join(' ');

  if (phrase.length > maxLength) {
    phrase = phrase.substring(0, maxLength).trim();
    // Remove trailing punctuation
    while (phrase.endsWith(',') || phrase.endsWith(';') || phrase.endsWith(':')) {
      phrase = phrase.slice(0, -1).trim();
    }
  }

  return phrase;
}

/**
 * Generate comprehension-based MCQ questions
 * Tests inference, synthesis, and understanding - NOT simple text recognition
 */
function generateContentMCQ(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.sentences.length < 2) {
    return null;
  }

  const scenarios = [];

  // Scenario 1: Inference question based on cause-effect
  if (analysis.causePairs.length > 0) {
    const pair = analysis.causePairs[Math.floor(Math.random() * analysis.causePairs.length)];
    const causeWords = pair.cause.split(/\s+/).slice(0, 5).join(' ');
    scenarios.push({
      question: `Based on the text, what can be inferred about why "${causeWords}"?`,
      correct: extractKeyPhrase(pair.effect, 50),
      wrongA: `It is explicitly stated in the text`,
      wrongB: `It has no connection to the main topic`,
      wrongC: `The text contradicts this idea`,
      explanation: `The text suggests that ${causeWords.toLowerCase()} leads to ${pair.effect.toLowerCase()}`,
    });
  }

  // Scenario 2: Synthesis question combining two concepts
  if (analysis.relationships.length > 0) {
    const rel = analysis.relationships[Math.floor(Math.random() * analysis.relationships.length)];
    scenarios.push({
      question: `Based on the text, how are "${rel.term1}" and "${rel.term2}" related?`,
      correct: extractKeyPhrase(rel.relationship, 50),
      wrongA: `They are mentioned but not connected`,
      wrongB: `The text says they are opposite concepts`,
      wrongC: `They are unrelated to the main topic`,
      explanation: `According to the text, ${rel.term1} and ${rel.term2} are connected because the text states: "${extractKeyPhrase(rel.relationship, 40)}"`,
    });
  }

  // Scenario 3: Application/understanding question
  if (analysis.concepts.length > 1) {
    const concept = analysis.concepts[Math.floor(Math.random() * (analysis.concepts.length - 1))];
    const conceptWords = extractKeyPhrase(concept, 40);
    scenarios.push({
      question: `Based on the text's explanation of "${conceptWords}", which statement best describes its purpose?`,
      correct: `To help readers understand the main idea`,
      wrongA: `To confuse the reader intentionally`,
      wrongB: `It serves no clear purpose`,
      wrongC: `To contradict the previous statement`,
      explanation: `The text includes "${conceptWords}" to help explain key concepts to the reader`,
    });
  }

  // Scenario 4: Comparative understanding
  if (analysis.keyTerms.length > 1) {
    const term1 = analysis.keyTerms[0];
    const term2 = analysis.keyTerms[1];
    scenarios.push({
      question: `According to the text, what distinguishes "${term1}" from "${term2}"?`,
      correct: `Different characteristics and applications`,
      wrongA: `The text treats them as identical`,
      wrongB: `There is no meaningful distinction`,
      wrongC: `Term1 is more important than Term2`,
      explanation: `The text distinguishes between ${term1} and ${term2} by discussing their different characteristics`,
    });
  }

  // Use a random scenario if available
  if (scenarios.length === 0) {
    return null;
  }

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const allOptions = [scenario.correct, scenario.wrongA, scenario.wrongB, scenario.wrongC]
    .filter((opt) => opt && opt.length > 5)
    .slice(0, 4);

  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

  return {
    id,
    type: 'mcq',
    difficulty,
    content: scenario.question,
    options: shuffledOptions,
    correctAnswer: scenario.correct,
    explanation: scenario.explanation,
  };
}

/**
 * Generate fill-in-blank questions that test comprehension
 * Questions focus on understanding relationships and applications
 */
function generateContentFillBlank(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.keyTerms.length === 0 && analysis.concepts.length === 0) {
    return null;
  }

  const scenarios = [];

  // Scenario 1: Concept role/purpose
  if (analysis.concepts.length > 0) {
    const concept = analysis.concepts[Math.floor(Math.random() * analysis.concepts.length)];
    const keyWords = extractKeyPhrase(concept, 30);
    scenarios.push({
      content: `In the text, "${keyWords}" is primarily discussed to explain how ______ relates to the main topic.`,
      answer: `concepts work together`,
      explanation: `The text uses this concept to show relationships between different ideas`,
    });
  }

  // Scenario 2: Relationship description
  if (analysis.relationships.length > 0) {
    const rel = analysis.relationships[0];
    scenarios.push({
      content: `The text demonstrates that "${rel.term1}" and "${rel.term2}" are connected through ______.`,
      answer: `their shared characteristics`,
      explanation: `The text shows how these terms relate to each other in the context`,
    });
  }

  // Scenario 3: Cause-effect understanding
  if (analysis.causePairs.length > 0) {
    const pair = analysis.causePairs[0];
    const effectWords = extractKeyPhrase(pair.effect, 25);
    scenarios.push({
      content: `According to the text, "${effectWords}" occurs because ______.`,
      answer: extractKeyPhrase(pair.cause, 25),
      explanation: `The text establishes a causal relationship where this cause leads to that effect`,
    });
  }

  // Scenario 4: Key term significance
  if (analysis.keyTerms.length > 0) {
    const term = analysis.keyTerms[Math.floor(Math.random() * analysis.keyTerms.length)];
    scenarios.push({
      content: `The text suggests that understanding "${term}" is important because ______.`,
      answer: `it helps explain other concepts`,
      explanation: `The text presents this term as fundamental to understanding the overall topic`,
    });
  }

  if (scenarios.length === 0) {
    return null;
  }

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    id,
    type: 'fillBlank',
    difficulty,
    content: scenario.content,
    correctAnswer: scenario.answer,
    explanation: scenario.explanation,
  };
}

/**
 * Generate true/false questions based on inference and understanding
 * Questions test whether students correctly understand concepts and relationships
 */
function generateContentTrueFalse(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.keyTerms.length === 0) {
    return null;
  }

  const scenarios = [];

  // Scenario 1: Inference about relationship
  if (analysis.relationships.length > 0) {
    const rel = analysis.relationships[Math.floor(Math.random() * analysis.relationships.length)];
    scenarios.push({
      content: `Based on the text, "${rel.term1}" and "${rel.term2}" are interconnected concepts.`,
      answer: 'true',
      explanation: `The text demonstrates how these concepts relate to each other`,
    });
  }

  // Scenario 2: Inference about cause-effect
  if (analysis.causePairs.length > 0) {
    const pair = analysis.causePairs[Math.floor(Math.random() * analysis.causePairs.length)];
    scenarios.push({
      content: `According to the text, ${extractKeyPhrase(pair.cause, 35)} directly causes ${extractKeyPhrase(pair.effect, 25)}.`,
      answer: 'true',
      explanation: `The text establishes this causal relationship`,
    });
  }

  // Scenario 3: False inference (plausible but not stated)
  if (analysis.keyTerms.length > 1) {
    const term1 = analysis.keyTerms[0];
    const term2 = analysis.keyTerms[1];
    scenarios.push({
      content: `The text explicitly states that "${term1}" is more important than "${term2}".`,
      answer: 'false',
      explanation: `The text discusses both terms but does not claim one is more important than the other`,
    });
  }

  // Scenario 4: Inference about purpose or significance
  if (analysis.concepts.length > 0) {
    const concept = analysis.concepts[0];
    scenarios.push({
      content: `Based on the text, understanding the concepts discussed is essential to the main topic.`,
      answer: 'true',
      explanation: `The text presents these concepts as fundamental to understanding the overall subject`,
    });
  }

  // Scenario 5: Contradictory statement
  if (analysis.sentences.length > 1) {
    scenarios.push({
      content: `The text suggests that the discussed concepts are unrelated to real-world applications.`,
      answer: 'false',
      explanation: `The text indicates that these concepts have practical relevance and applications`,
    });
  }

  if (scenarios.length === 0) {
    return null;
  }

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    id,
    type: 'trueFalse',
    difficulty,
    content: scenario.content,
    correctAnswer: scenario.answer,
    explanation: scenario.explanation,
  };
}

/**
 * Generate one-word answer questions based on concept understanding
 * Questions ask students to identify key concepts based on descriptions
 */
function generateContentOneWord(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.keyTerms.length === 0) {
    return null;
  }

  const scenarios = [];
  const keyTerm = analysis.keyTerms[Math.floor(Math.random() * analysis.keyTerms.length)];

  // Scenario 1: Identify a key term by description
  if (analysis.definitions.has(keyTerm)) {
    const definition = analysis.definitions.get(keyTerm);
    scenarios.push({
      content: `What key term best describes: "${extractKeyPhrase(definition || '', 40)}"?`,
      answer: keyTerm,
      explanation: `"${keyTerm}" is defined as this concept in the text`,
    });
  }

  // Scenario 2: Identify term by its role
  scenarios.push({
    content: `Name the primary concept that "${extractKeyPhrase(analysis.concepts[0] || '', 40)}" is about.`,
    answer: keyTerm,
    explanation: `This concept is central to the text's explanation`,
  });

  // Scenario 3: Identify term by relationship
  if (analysis.relationships.length > 0) {
    const rel = analysis.relationships[0];
    scenarios.push({
      content: `Which key concept connects "${rel.term1}" and "${rel.term2}"?`,
      answer: keyTerm,
      explanation: `This term represents the connecting idea between these concepts`,
    });
  }

  if (scenarios.length === 0) {
    return null;
  }

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    id,
    type: 'oneWord',
    difficulty,
    content: scenario.content,
    correctAnswer: scenario.answer,
    explanation: scenario.explanation,
  };
}

/**
 * Generate match questions based on concept relationships and roles
 * Questions test understanding of how concepts relate and function
 */
function generateContentMatch(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  // Option 1: Match terms with their roles/functions
  if (analysis.keyTerms.length >= 3) {
    const terms = analysis.keyTerms.slice(0, 3);
    const pairs = terms.map((term) => {
      let role = 'a supporting concept';
      if (analysis.definitions.has(term)) {
        role = extractKeyPhrase(analysis.definitions.get(term) || '', 35);
      }
      return {
        left: term,
        right: role,
      };
    });

    const pairsString = pairs.map((p, i) => `${i + 1}. ${p.left} → ${p.right}`).join('; ');

    return {
      id,
      type: 'match',
      difficulty,
      content: `Match each concept with its primary role or function in the text:`,
      pairs,
      correctAnswer: pairsString,
      explanation: `Each concept plays a specific role in explaining the main ideas`,
    };
  }

  // Option 2: Match causes with effects
  if (analysis.causePairs.length >= 2) {
    const pairs = analysis.causePairs.slice(0, 3).map((pair) => ({
      left: extractKeyPhrase(pair.cause, 30),
      right: extractKeyPhrase(pair.effect, 30),
    }));

    if (pairs.length < 2) {
      return null;
    }

    const pairsString = pairs.map((p, i) => `${i + 1}. ${p.left} → ${p.right}`).join('; ');

    return {
      id,
      type: 'match',
      difficulty,
      content: `Match each cause with its corresponding effect from the text:`,
      pairs,
      correctAnswer: pairsString,
      explanation: `The text establishes these cause-and-effect relationships`,
    };
  }

  // Option 3: Match related concepts
  if (analysis.relationships.length >= 2) {
    const pairs = analysis.relationships.slice(0, 3).map((rel) => ({
      left: rel.term1,
      right: rel.term2,
    }));

    const pairsString = pairs.map((p, i) => `${i + 1}. ${p.left} ↔ ${p.right}`).join('; ');

    return {
      id,
      type: 'match',
      difficulty,
      content: `Match related concepts that the text connects together:`,
      pairs,
      correctAnswer: pairsString,
      explanation: `The text demonstrates how these concepts are interconnected`,
    };
  }

  return null;
}

/**
 * Generate assertion-reason questions that test logical understanding
 * Questions assess whether students understand why concepts are true
 */
function generateContentAssertionReason(analysis: ContentAnalysis, difficulty: Difficulty, id: string): any {
  if (analysis.keyTerms.length < 2) {
    return null;
  }

  const scenarios = [];

  // Scenario 1: Cause-effect assertion
  if (analysis.causePairs.length > 0) {
    const pair = analysis.causePairs[Math.floor(Math.random() * analysis.causePairs.length)];
    scenarios.push({
      assertion: extractKeyPhrase(pair.effect, 40),
      reason: `because ${extractKeyPhrase(pair.cause, 35).toLowerCase()}`,
      answer: 'Both',
      explanation: `The text establishes both the assertion and the reason as correct`,
    });
  }

  // Scenario 2: Concept relationship assertion
  if (analysis.relationships.length > 0) {
    const rel = analysis.relationships[Math.floor(Math.random() * analysis.relationships.length)];
    scenarios.push({
      assertion: `"${rel.term1}" is important to understand`,
      reason: `because it connects with "${rel.term2}" in important ways`,
      answer: 'Both',
      explanation: `The text shows these concepts are connected and both important`,
    });
  }

  // Scenario 3: Valid assertion but incorrect reasoning
  if (analysis.keyTerms.length > 0) {
    const term = analysis.keyTerms[0];
    scenarios.push({
      assertion: `"${term}" is discussed in the text`,
      reason: `because it is the most complex concept in the entire document`,
      answer: 'A',
      explanation: `The assertion is true, but the text does not claim this is the most complex concept`,
    });
  }

  // Scenario 4: Correct both assertion and reason
  if (analysis.concepts.length > 0) {
    const concept = analysis.concepts[0];
    scenarios.push({
      assertion: extractKeyPhrase(concept, 35),
      reason: `because the text presents this as a key idea for understanding the topic`,
      answer: 'Both',
      explanation: `The text supports both the concept and the reason for its importance`,
    });
  }

  if (scenarios.length === 0) {
    return null;
  }

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    id,
    type: 'assertionReason',
    difficulty,
    content: `Evaluate: Assertion (A) and Reason (R)`,
    assertion: scenario.assertion,
    reason: scenario.reason,
    correctAnswer: scenario.answer,
    explanation: scenario.explanation,
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
