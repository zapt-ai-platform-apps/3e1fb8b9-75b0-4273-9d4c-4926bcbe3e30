import * as Sentry from '@sentry/node';
import { OpenAI } from 'openai';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.VITE_PUBLIC_APP_ID
    }
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log('Answer checking request received');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, userAnswer, embeddings, pdfText } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    if (userAnswer === undefined || userAnswer === null) {
      return res.status(400).json({ error: 'User answer is required' });
    }

    // Get relevant context for answer checking
    const context = getRelevantContext(embeddings, question, userAnswer);
    
    // Check the answer
    const result = await checkAnswer(question, userAnswer, context, pdfText);
    console.log('Answer checked, result:', result.isCorrect ? 'correct' : 'incorrect');

    // Return the result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error checking answer:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to check answer: ' + error.message });
  }
}

// Get relevant context for answer checking
function getRelevantContext(embeddings, question, userAnswer) {
  // If we have source chunk in the question, use that
  if (question.sourceChunk) {
    return question.sourceChunk;
  }
  
  // Otherwise, use a simple approach to find relevant content
  // (In a real system, this would use vector search)
  if (embeddings && embeddings.length > 0) {
    // Simple keyword matching for now
    const combinedText = `${question.questionText} ${question.questionDescription || ''} ${userAnswer}`;
    const keywords = extractKeywords(combinedText);
    
    // Find chunks that contain the most keywords
    const matchedChunks = embeddings.map(e => {
      const score = keywords.reduce((count, keyword) => 
        e.text.toLowerCase().includes(keyword.toLowerCase()) ? count + 1 : count, 0);
      return { text: e.text, score };
    }).sort((a, b) => b.score - a.score);
    
    if (matchedChunks.length > 0 && matchedChunks[0].score > 0) {
      return matchedChunks[0].text;
    }
  }
  
  // If no good match, return empty string
  return '';
}

// Extract potential keywords from text
function extractKeywords(text) {
  const words = text.split(/\W+/).filter(word => 
    word.length > 3 && !['this', 'that', 'with', 'from', 'then', 'than', 'what'].includes(word.toLowerCase())
  );
  
  // Count word frequency
  const wordCounts = words.reduce((counts, word) => {
    const lowercaseWord = word.toLowerCase();
    counts[lowercaseWord] = (counts[lowercaseWord] || 0) + 1;
    return counts;
  }, {});
  
  // Get top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// Check the user's answer
async function checkAnswer(question, userAnswer, context, pdfText) {
  // For multiple choice, we can check directly
  if (question.type === 'multiple_choice' && question.correctAnswer) {
    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    
    return {
      isCorrect,
      percentCorrect: isCorrect ? 1.0 : 0.0,
      explanation: await generateFeedback(question, userAnswer, isCorrect, context, pdfText)
    };
  }
  
  // For other question types, use the LLM to evaluate
  try {
    // Provide context for the LLM to better evaluate the answer
    const prompt = `
Question: ${question.questionText}
${question.questionDescription ? `Description: ${question.questionDescription}` : ''}
${question.codeSnippet ? `Code: \`\`\`\n${question.codeSnippet}\n\`\`\`` : ''}
Expected Answer: ${question.correctAnswer || "Not provided directly"}
User's Answer: ${userAnswer}

Relevant Context from the Programming Tutorial:
${context || pdfText.slice(0, 500) + '...'}

Evaluate the user's answer based on the context from the programming tutorial.

Determine:
1. Is the answer correct? (true/false)
2. How correct is it as a percentage? (0.0 to 1.0)
3. Provide a detailed explanation of why the answer is correct or incorrect
4. Include specific references to the course material when possible

Format response as a JSON object with these fields:
- isCorrect: boolean
- percentCorrect: number (0.0 to 1.0)
- explanation: string
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert programming educator evaluating a student answer to a programming question. Your feedback should be accurate, helpful, and educational.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error using LLM to check answer:', error);
    
    // Fallback to simple matching for text-based answers
    const isCorrect = question.correctAnswer && 
      userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase());
    
    return {
      isCorrect,
      percentCorrect: isCorrect ? 1.0 : 0.0,
      explanation: `The correct answer is: ${question.correctAnswer || "Not available"}`
    };
  }
}

// Generate feedback for the user's answer
async function generateFeedback(question, userAnswer, isCorrect, context, pdfText) {
  try {
    const prompt = `
Question: ${question.questionText}
${question.questionDescription ? `Description: ${question.questionDescription}` : ''}
${question.codeSnippet ? `Code: \`\`\`\n${question.codeSnippet}\n\`\`\`` : ''}
User's Answer: ${userAnswer}
Correct Answer: ${question.correctAnswer || "Not provided directly"}
Is Correct: ${isCorrect}

Relevant Context from the Programming Tutorial:
${context || pdfText.slice(0, 500) + '...'}

Generate helpful feedback for the user's answer. The feedback should:
1. Be encouraging and educational
2. Explain why the answer is correct or incorrect
3. Provide additional context or information to deepen understanding
4. For incorrect answers, explain the correct answer
5. Include code examples where appropriate

Keep your feedback concise (3-5 sentences) but informative.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert programming educator providing feedback on a student answer. Your feedback should be accurate, helpful, and educational.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // Fallback to simple feedback
    return isCorrect
      ? "Correct! Well done."
      : `Incorrect. The correct answer is: ${question.correctAnswer || "Not available"}`;
  }
}