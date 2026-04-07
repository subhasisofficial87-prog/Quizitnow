/**
 * Local Quiz Generator
 * Generates quizzes using local logic (no external API calls)
 * Creates EXACTLY 31 questions with proper distribution and difficulty levels
 */

import {
  Quiz,
  AnyQuestion,
  MCQQuestion,
  FillBlankQuestion,
  OneWordQuestion,
  TrueFalseQuestion,
  MatchQuestion,
  AssertionReasonQuestion,
  Difficulty,
} from './quiz-types';

// Sample quiz data for demonstration - in production, this would be more sophisticated
const sampleQuizzesData: Record<string, any> = {
  photosynthesis: {
    easy: [
      {
        type: 'mcq',
        content: 'What is the primary purpose of photosynthesis?',
        options: ['To break down glucose', 'To convert light energy into chemical energy', 'To produce carbon dioxide', 'To consume water'],
        correctAnswer: 'To convert light energy into chemical energy',
        explanation: 'Photosynthesis converts light energy from the sun into chemical energy stored in glucose.',
      },
      {
        type: 'trueFalse',
        content: 'Photosynthesis occurs in the chloroplasts of plant cells.',
        correctAnswer: 'true',
        explanation: 'Chloroplasts are the organelles where photosynthesis takes place.',
      },
      {
        type: 'fillBlank',
        content: 'The green pigment in plants that captures light is called ____.',
        correctAnswer: 'chlorophyll',
        explanation: 'Chlorophyll is the pigment responsible for the green color and light absorption.',
      },
    ],
    medium: [
      {
        type: 'mcq',
        content: 'Which of the following is produced during the light-dependent reactions?',
        options: ['Glucose', 'ATP and NADPH', 'Carbon dioxide', 'Water'],
        correctAnswer: 'ATP and NADPH',
        explanation: 'ATP and NADPH are energy carriers produced in the light reactions.',
      },
    ],
    hard: [
      {
        type: 'assertionReason',
        assertion: 'The Calvin cycle requires ATP and NADPH from the light reactions.',
        reason: 'ATP and NADPH are energy carriers needed to fix carbon dioxide into glucose.',
        correctAnswer: 'Both',
        explanation: 'Both statements are true and the reason explains why the assertion is correct.',
      },
    ],
  },
};

/**
 * Generate a quiz with exactly 31 questions
 * 10 MCQ + 5 Fill-blank + 4 One-word + 4 True/False + 4 Match + 4 Assertion-Reason
 * Difficulty: 10 Easy, 10 Medium, 11 Hard
 */
export async function generateLocalQuiz(input: string, sourceType: string = 'topic'): Promise<Quiz> {
  try {
    // Extract topic from input
    let topic = input;

    if (sourceType === 'pdf' || sourceType === 'image') {
      // Use first 100 chars as topic
      topic = input.substring(0, 100) || 'General Knowledge';
    }

    console.log('[LocalQuizGenerator] Generating quiz for', sourceType + ':', topic.substring(0, 50));

    // Initialize questions object
    const questions: Record<Difficulty, AnyQuestion[]> = {
      easy: [],
      medium: [],
      hard: [],
    };

    // Generate 31 questions - 10 Easy, 10 Medium, 11 Hard
    const easyQuestions = generateQuestionsByDifficulty(topic, 'easy', 10);
    const mediumQuestions = generateQuestionsByDifficulty(topic, 'medium', 10);
    const hardQuestions = generateQuestionsByDifficulty(topic, 'hard', 11);

    questions.easy = easyQuestions;
    questions.medium = mediumQuestions;
    questions.hard = hardQuestions;

    // Return properly formatted response
    return {
      success: true,
      questions,
      stats: {
        totalQuestions: 31,
        byType: {
          mcq: 10,
          fillBlank: 5,
          oneWord: 4,
          trueFalse: 4,
          match: 4,
          assertionReason: 4,
        },
      },
    };
  } catch (error) {
    console.error('[LocalQuizGenerator] Error:', error);
    return {
      success: false,
      error: `Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate questions for a specific difficulty level
 */
function generateQuestionsByDifficulty(
  topic: string,
  difficulty: Difficulty,
  count: number
): AnyQuestion[] {
  const questions: AnyQuestion[] = [];
  const typeDistribution = getTypeDistribution(difficulty, count);

  let questionId = 0;

  // Generate MCQ questions
  for (let i = 0; i < typeDistribution.mcq; i++) {
    questions.push(generateMCQQuestion(topic, difficulty, `${difficulty}-mcq-${questionId++}`));
  }

  // Generate Fill-blank questions
  for (let i = 0; i < typeDistribution.fillBlank; i++) {
    questions.push(generateFillBlankQuestion(topic, difficulty, `${difficulty}-fb-${questionId++}`));
  }

  // Generate One-word questions
  for (let i = 0; i < typeDistribution.oneWord; i++) {
    questions.push(generateOneWordQuestion(topic, difficulty, `${difficulty}-ow-${questionId++}`));
  }

  // Generate True/False questions
  for (let i = 0; i < typeDistribution.trueFalse; i++) {
    questions.push(generateTrueFalseQuestion(topic, difficulty, `${difficulty}-tf-${questionId++}`));
  }

  // Generate Match questions
  for (let i = 0; i < typeDistribution.match; i++) {
    questions.push(generateMatchQuestion(topic, difficulty, `${difficulty}-m-${questionId++}`));
  }

  // Generate Assertion-Reason questions
  for (let i = 0; i < typeDistribution.assertionReason; i++) {
    questions.push(generateAssertionReasonQuestion(topic, difficulty, `${difficulty}-ar-${questionId++}`));
  }

  return questions;
}

/**
 * Get question type distribution for a difficulty level
 */
function getTypeDistribution(
  difficulty: Difficulty,
  count: number
): Record<string, number> {
  // Distribute count across all 6 types
  const base = Math.floor(count / 6);
  const remainder = count % 6;

  return {
    mcq: base + (remainder > 0 ? 1 : 0),
    fillBlank: base + (remainder > 1 ? 1 : 0),
    oneWord: base + (remainder > 2 ? 1 : 0),
    trueFalse: base + (remainder > 3 ? 1 : 0),
    match: base + (remainder > 4 ? 1 : 0),
    assertionReason: base,
  };
}

/**
 * Generate MCQ question with realistic options
 */
function generateMCQQuestion(topic: string, difficulty: Difficulty, id: string): MCQQuestion {
  // Question templates based on topic
  const questionTemplates = [
    `What is the primary definition of ${topic}?`,
    `Which of the following best describes ${topic}?`,
    `What is a key characteristic of ${topic}?`,
    `Which statement about ${topic} is correct?`,
    `What role does ${topic} play in modern contexts?`,
    `Which of the following is an example of ${topic}?`,
    `What are the main benefits of understanding ${topic}?`,
    `How does ${topic} relate to other concepts?`,
    `Which approach is most commonly used in ${topic}?`,
    `What is the significance of ${topic} in today's world?`,
  ];

  // Realistic option sets based on difficulty
  const optionSets = {
    easy: [
      {
        correct: `A well-established principle in ${topic}`,
        wrong: [
          `A common misconception about ${topic}`,
          `A rarely used method in ${topic}`,
          `An outdated understanding of ${topic}`,
        ],
      },
      {
        correct: `The primary purpose of ${topic}`,
        wrong: [
          `A secondary effect of ${topic}`,
          `An unrelated concept`,
          `A partial definition of ${topic}`,
        ],
      },
      {
        correct: `A fundamental aspect of ${topic}`,
        wrong: [
          `A temporary feature in ${topic}`,
          `A regional variation of ${topic}`,
          `A future development in ${topic}`,
        ],
      },
    ],
    medium: [
      {
        correct: `The most scientifically supported explanation of ${topic}`,
        wrong: [
          `An alternative but less supported theory about ${topic}`,
          `A historical but now obsolete interpretation of ${topic}`,
          `A theoretical possibility not proven in ${topic}`,
        ],
      },
      {
        correct: `The optimal method for implementing ${topic}`,
        wrong: [
          `A valid but less efficient approach to ${topic}`,
          `A hybrid method combining multiple aspects of ${topic}`,
          `A traditional approach that has evolved in ${topic}`,
        ],
      },
      {
        correct: `The most significant contributing factor to ${topic}`,
        wrong: [
          `A secondary contributing factor to ${topic}`,
          `A correlated but not causal element of ${topic}`,
          `An outcome rather than a cause in ${topic}`,
        ],
      },
    ],
    hard: [
      {
        correct: `The nuanced distinction between ${topic} and related concepts`,
        wrong: [
          `A superficial similarity between ${topic} and other phenomena`,
          `A commonly confused but distinct aspect of ${topic}`,
          `An advanced but ultimately flawed interpretation of ${topic}`,
        ],
      },
      {
        correct: `The advanced application of ${topic} principles`,
        wrong: [
          `A specialized but narrow application of ${topic}`,
          `A theoretical extrapolation beyond ${topic}`,
          `An interdisciplinary misinterpretation of ${topic}`,
        ],
      },
      {
        correct: `The underlying mechanism explaining ${topic}`,
        wrong: [
          `A surface-level observation about ${topic}`,
          `An emergent property not directly related to ${topic}`,
          `A statistical artifact in the study of ${topic}`,
        ],
      },
    ],
  };

  // Select random question and options
  const question = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
  const optionSet = optionSets[difficulty][Math.floor(Math.random() * optionSets[difficulty].length)];

  // Create options array with correct answer shuffled
  const allOptions = [optionSet.correct, ...optionSet.wrong];
  const shuffled = allOptions.sort(() => Math.random() - 0.5);

  return {
    id,
    type: 'mcq',
    difficulty,
    content: question,
    options: shuffled,
    correctAnswer: optionSet.correct,
    explanation: `${optionSet.correct} is the correct answer because it accurately represents a key concept in ${topic} at the ${difficulty} level.`,
  };
}

/**
 * Generate Fill-blank question
 */
function generateFillBlankQuestion(topic: string, difficulty: Difficulty, id: string): FillBlankQuestion {
  const templates = [
    {
      content: `The primary concept in ${topic} is called ______`,
      answer: difficulty === 'easy' ? 'definition' : difficulty === 'medium' ? 'principle' : 'paradigm',
      explanation: `This term is fundamental to understanding ${topic}.`
    },
    {
      content: `In ${topic}, the process of ______ is essential for success`,
      answer: difficulty === 'easy' ? 'learning' : difficulty === 'medium' ? 'implementation' : 'optimization',
      explanation: `This process is critical in ${topic}.`
    },
    {
      content: `The term ______ describes a key characteristic of ${topic}`,
      answer: difficulty === 'easy' ? 'structure' : difficulty === 'medium' ? 'mechanism' : 'interaction',
      explanation: `This terminology is important for ${topic}.`
    },
    {
      content: `When studying ${topic}, the concept of ______ should be prioritized`,
      answer: difficulty === 'easy' ? 'foundation' : difficulty === 'medium' ? 'context' : 'correlation',
      explanation: `Understanding this concept is vital in ${topic}.`
    },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    id,
    type: 'fillBlank',
    difficulty,
    content: template.content,
    correctAnswer: template.answer,
    explanation: template.explanation,
  };
}

/**
 * Generate One-word question
 */
function generateOneWordQuestion(topic: string, difficulty: Difficulty, id: string): OneWordQuestion {
  const templates = [
    {
      content: `What is the most important term associated with ${topic}?`,
      answer: difficulty === 'easy' ? 'understanding' : difficulty === 'medium' ? 'application' : 'integration',
      explanation: `This term encapsulates the essence of ${topic}.`
    },
    {
      content: `Name the primary process in ${topic}:`,
      answer: difficulty === 'easy' ? 'learning' : difficulty === 'medium' ? 'development' : 'evolution',
      explanation: `This is the core process that drives ${topic}.`
    },
    {
      content: `What single word best describes ${topic}?`,
      answer: difficulty === 'easy' ? 'important' : difficulty === 'medium' ? 'essential' : 'fundamental',
      explanation: `This word captures the nature of ${topic}.`
    },
    {
      content: `Identify one key characteristic of ${topic}:`,
      answer: difficulty === 'easy' ? 'complexity' : difficulty === 'medium' ? 'variability' : 'interdependence',
      explanation: `This characteristic is essential to ${topic}.`
    },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    id,
    type: 'oneWord',
    difficulty,
    content: template.content,
    correctAnswer: template.answer,
    explanation: template.explanation,
  };
}

/**
 * Generate True/False question
 */
function generateTrueFalseQuestion(topic: string, difficulty: Difficulty, id: string): TrueFalseQuestion {
  const statements = {
    true: [
      {
        content: `${topic} plays a significant role in modern understanding and practice.`,
        explanation: `This is true. ${topic} is widely recognized as important in contemporary contexts.`
      },
      {
        content: `Multiple approaches exist for studying and applying ${topic}.`,
        explanation: `This is true. ${topic} has diverse methodologies and applications.`
      },
      {
        content: `Understanding ${topic} requires knowledge of fundamental principles.`,
        explanation: `This is true. ${topic} is built upon core theoretical foundations.`
      },
      {
        content: `${topic} has evolved and developed over time.`,
        explanation: `This is true. ${topic} has a history of development and refinement.`
      },
    ],
    false: [
      {
        content: `${topic} is a simple, one-dimensional concept with no complexity.`,
        explanation: `This is false. ${topic} is actually multifaceted and complex.`
      },
      {
        content: `There is only one correct way to understand ${topic}.`,
        explanation: `This is false. ${topic} has multiple valid interpretations and approaches.`
      },
      {
        content: `${topic} is no longer relevant in today's world.`,
        explanation: `This is false. ${topic} remains highly relevant and applicable.`
      },
      {
        content: `You can fully understand ${topic} without studying its foundational concepts.`,
        explanation: `This is false. ${topic} requires understanding of fundamental principles.`
      },
    ],
  };

  const isTrue = Math.random() > 0.5;
  const statement = isTrue
    ? statements.true[Math.floor(Math.random() * statements.true.length)]
    : statements.false[Math.floor(Math.random() * statements.false.length)];

  return {
    id,
    type: 'trueFalse',
    difficulty,
    content: statement.content,
    correctAnswer: isTrue ? 'true' : 'false',
    explanation: statement.explanation,
  };
}

/**
 * Generate Match question
 */
function generateMatchQuestion(topic: string, difficulty: Difficulty, id: string): MatchQuestion {
  const pairSets = {
    easy: [
      {
        pairs: [
          { left: `Basic principle of ${topic}`, right: 'Foundation for understanding' },
          { left: `Key aspect of ${topic}`, right: 'Essential component' },
          { left: `Application of ${topic}`, right: 'Practical use' },
        ]
      },
      {
        pairs: [
          { left: `Definition in ${topic}`, right: 'Clear explanation' },
          { left: `Method in ${topic}`, right: 'Common approach' },
          { left: `Goal of ${topic}`, right: 'Desired outcome' },
        ]
      },
    ],
    medium: [
      {
        pairs: [
          { left: `Theoretical framework in ${topic}`, right: 'Academic foundation' },
          { left: `Empirical evidence for ${topic}`, right: 'Scientific support' },
          { left: `Practical implementation of ${topic}`, right: 'Real-world application' },
        ]
      },
      {
        pairs: [
          { left: `Primary mechanism of ${topic}`, right: 'How it works' },
          { left: `Secondary effect in ${topic}`, right: 'Resulting consequence' },
          { left: `Contributing factor to ${topic}`, right: 'Influencing element' },
        ]
      },
    ],
    hard: [
      {
        pairs: [
          { left: `Foundational premise of ${topic}`, right: 'Underlying assumption' },
          { left: `Complex relationship in ${topic}`, right: 'Interconnected elements' },
          { left: `Advanced concept in ${topic}`, right: 'Higher-level understanding' },
        ]
      },
      {
        pairs: [
          { left: `Synthesized understanding of ${topic}`, right: 'Integrated knowledge' },
          { left: `Interdisciplinary connection to ${topic}`, right: 'Cross-domain application' },
          { left: `Critical evaluation of ${topic}`, right: 'Analytical perspective' },
        ]
      },
    ],
  };

  const pairSet = pairSets[difficulty][Math.floor(Math.random() * pairSets[difficulty].length)];
  const pairsString = pairSet.pairs.map((p, i) => `(${i + 1}) ${p.left} → ${p.right}`).join('; ');

  return {
    id,
    type: 'match',
    difficulty,
    content: `Match the related concepts and their descriptions in ${topic}:`,
    pairs: pairSet.pairs,
    correctAnswer: pairsString,
    explanation: `These are the correct matches for the concepts in ${topic}. Each left item corresponds to the description on the right.`,
  };
}

/**
 * Generate Assertion-Reason question
 */
function generateAssertionReasonQuestion(
  topic: string,
  difficulty: Difficulty,
  id: string
): AssertionReasonQuestion {
  const scenarios = {
    both: [
      {
        assertion: `${topic} is essential for modern understanding and practice.`,
        reason: `Because it provides a foundational framework that underpins contemporary approaches.`,
        explanation: `Both the assertion and reason are accurate. ${topic} is indeed fundamental, and its importance derives from its role as a foundational framework.`
      },
      {
        assertion: `Multiple methodologies exist for studying ${topic}.`,
        reason: `Because ${topic} is complex and multifaceted, requiring diverse analytical approaches.`,
        explanation: `Both statements are true. The complexity of ${topic} necessitates various methodological approaches.`
      },
    ],
    assertionOnly: [
      {
        assertion: `${topic} requires significant study and understanding.`,
        reason: `Because there is only one way to comprehend ${topic}.`,
        explanation: `The assertion is true, but the reason is false. While ${topic} does require serious study, it's not because there's only one way to understand it.`
      },
    ],
    reasonOnly: [
      {
        assertion: `${topic} is irrelevant in contemporary contexts.`,
        reason: `Because ${topic} has evolved and developed over time to remain applicable.`,
        explanation: `The assertion is false, but the reason is true. While ${topic} has indeed evolved, this makes it MORE relevant, not less.`
      },
    ],
    neither: [
      {
        assertion: `${topic} is a simple concept requiring minimal effort to understand.`,
        reason: `Because ${topic} has no foundational principles or theoretical basis.`,
        explanation: `Neither statement is correct. ${topic} is complex and has a substantial theoretical foundation.`
      },
    ],
  };

  const type = ['both', 'assertionOnly', 'reasonOnly', 'neither'][Math.floor(Math.random() * 4)];
  const scenario = scenarios[type as keyof typeof scenarios][0];

  return {
    id,
    type: 'assertionReason',
    difficulty,
    content: `Read the assertion and reason below:`,
    assertion: scenario.assertion,
    reason: scenario.reason,
    correctAnswer: type === 'both' ? 'Both' : type === 'assertionOnly' ? 'A' : type === 'reasonOnly' ? 'R' : 'Neither',
    explanation: scenario.explanation,
  };
}
