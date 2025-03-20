import React from 'react';
import { Box, Heading, Text, Badge } from '@chakra-ui/react';

export default function QuestionReview({ question, userAnswer, index }) {
  const isMultipleChoice = question.type === 'multiple_choice';
  
  // For multiple choice we can determine correctness directly
  const isCorrect = isMultipleChoice 
    ? userAnswer === question.correctAnswer
    : null; // For text-based answers, we don't know directly
    
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Split text on code markers
    const parts = text.split(/(`{3}[\s\S]*?`{3}|`[\s\S]*?`)/g);
    
    return parts.map((part, idx) => {
      // Check if this part is code
      if (part.startsWith('```') && part.endsWith('```')) {
        // Multi-line code block
        const code = part.slice(3, -3).trim();
        return (
          <pre key={idx} className="bg-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto my-2">
            {code}
          </pre>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // Inline code
        const code = part.slice(1, -1);
        return (
          <code key={idx} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
            {code}
          </code>
        );
      } else {
        // Regular text, render paragraphs
        return part.split('\n\n').map((paragraph, pIndex) => (
          <p key={`${idx}-${pIndex}`} className="mb-2">{paragraph}</p>
        ));
      }
    });
  };

  return (
    <Box mb={6} pb={6} borderBottom="1px" borderColor="gray.200">
      <Box display="flex" alignItems="center" mb={2}>
        <Badge colorScheme={isCorrect === null ? 'gray' : isCorrect ? 'green' : 'red'} fontSize="sm" mr={2}>
          Q{index + 1}
        </Badge>
        <Heading as="h3" size="sm">
          {question.questionText}
        </Heading>
      </Box>
      
      {question.questionDescription && (
        <Box mt={2} fontSize="sm">
          {renderFormattedText(question.questionDescription)}
        </Box>
      )}
      
      {question.codeSnippet && (
        <Box my={3}>
          <pre className="bg-gray-100 p-3 rounded-md font-mono text-xs overflow-x-auto">
            {question.codeSnippet}
          </pre>
        </Box>
      )}
      
      <Box mt={4}>
        <Text fontWeight="medium" fontSize="sm" mb={1}>Your Answer:</Text>
        <Box p={2} bg="gray.50" borderRadius="md">
          {isMultipleChoice ? (
            <Text>{userAnswer || 'No answer provided'}</Text>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm">{userAnswer || 'No answer provided'}</pre>
          )}
        </Box>
      </Box>
      
      {isMultipleChoice && (
        <Box mt={3}>
          <Text fontWeight="medium" fontSize="sm" mb={1}>Correct Answer:</Text>
          <Box p={2} bg="green.50" borderRadius="md">
            <Text>{question.correctAnswer}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}