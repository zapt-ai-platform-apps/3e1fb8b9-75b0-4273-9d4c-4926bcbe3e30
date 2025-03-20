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
  console.log('Question generation request received');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { embeddings, codeSnippets, count = 5, difficulty = 'medium' } = req.body;
    
    if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
      return res.status(400).json({ error: 'Valid embeddings are required' });
    }

    // Create questions based on the PDF content
    const questions = await generateQuestionsFromContent(embeddings, codeSnippets, count, difficulty);
    console.log(`Generated ${questions.length} questions`);

    // Return the generated questions
    return res.status(200).json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
}

// Generate questions based on the PDF content
async function generateQuestionsFromContent(embeddings, codeSnippets, count, difficulty) {
  // Create a variety of question types
  const questionTypes = [
    'multiple_choice',
    'short_answer',
    'fill_in_blank'
  ];
  
  // If we have code snippets, add code analysis questions
  if (codeSnippets && codeSnippets.length > 0) {
    questionTypes.push('code_analysis');
  }
  
  const questions = [];
  
  // Generate a mix of question types
  for (let i = 0; i < count; i++) {
    // Select a random question type, with higher probability for multiple choice
    const randomType = Math.random() < 0.5 
      ? 'multiple_choice' 
      : questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    // Get content to base the question on
    const contentChunk = selectRelevantContent(embeddings, questions);
    
    // For code analysis questions, use code snippets
    let codeSnippet = null;
    if (randomType === 'code_analysis' && codeSnippets && codeSnippets.length > 0) {
      codeSnippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    }
    
    // Generate the question
    const question = await createQuestion(
      randomType, 
      contentChunk, 
      difficulty, 
      codeSnippet,
      i + 1
    );
    
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
}

// Select content chunk to use for question generation
function selectRelevantContent(embeddings, existingQuestions) {
  // Simple random selection (could be improved with more sophisticated content selection)
  // Avoid using the same content for all questions
  const usedChunks = new Set(existingQuestions.map(q => q.sourceChunk).filter(Boolean));
  
  const availableChunks = embeddings.filter(e => !usedChunks.has(e.text));
  
  if (availableChunks.length === 0) {
    // If all chunks have been used, select a random one
    return embeddings[Math.floor(Math.random() * embeddings.length)].text;
  }
  
  // Select a random chunk from available ones
  const selectedChunk = availableChunks[Math.floor(Math.random() * availableChunks.length)];
  return selectedChunk.text;
}

// Create a question based on the content and type
async function createQuestion(type, contentChunk, difficulty, codeSnippet, questionNumber) {
  const difficultyLevels = {
    easy: "beginner-friendly questions focusing on basic concepts and recognition",
    medium: "intermediate-level questions requiring understanding and application",
    hard: "advanced questions requiring analysis, synthesis and deep understanding"
  };
  
  const difficultyDescription = difficultyLevels[difficulty] || difficultyLevels.medium;
  
  try {
    // Create a prompt for the LLM to generate the question
    let prompt = "";
    
    if (type === 'code_analysis' && codeSnippet) {
      prompt = `Create a ${difficulty} difficulty programming question about the following code:
\`\`\`
${codeSnippet}
\`\`\`

For context, this is from a programming tutorial that also includes this information:
${contentChunk.slice(0, 500)}...

Create a question that tests the reader's understanding of this code. ${difficultyDescription}.

The question should include:
1. A clear question asking about the code's functionality, purpose, or potential issues
2. The expected correct answer
3. For multiple choice questions, include 4 options with one correct answer

Format the response as a JSON object with these fields:
- type: "${type}"
- questionNumber: ${questionNumber}
- questionText: A concise question title
- questionDescription: Detailed description of what you're asking
- codeSnippet: The code snippet to analyze
- correctAnswer: The correct answer
- options: Array of 4 possible answers (only for multiple choice)`;
    } else {
      prompt = `Based on this content from a programming tutorial:
${contentChunk.slice(0, 800)}...

Create a ${type} question that tests understanding of the material. ${difficultyDescription}.

Question types:
- multiple_choice: Include 4 options with 1 correct answer
- short_answer: Should have a specific expected answer
- fill_in_blank: Should have a specific word or phrase to be filled in

Format the response as a JSON object with these fields:
- type: "${type}"
- questionNumber: ${questionNumber}
- questionText: A concise question title
- questionDescription: Detailed description of what you're asking
- correctAnswer: The correct answer
- options: Array of 4 possible answers (only for multiple choice)
- sourceChunk: "${contentChunk.slice(0, 100).replace(/\n/g, ' ')}..."`;
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator specializing in programming tutorials. Your task is to create high-quality questions based on programming tutorial content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });
    
    const questionData = JSON.parse(response.choices[0].message.content);
    
    // Add the source content and type if not present
    if (!questionData.type) {
      questionData.type = type;
    }
    
    return questionData;
  } catch (error) {
    console.error('Error creating question:', error);
    return null;
  }
}