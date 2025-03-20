import React, { useState } from 'react';
import { Button, RadioGroup, Radio, Stack, Textarea, Box, Heading } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';

export default function QuestionCard({ question, onSubmit, isSubmitting, disabled, userAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [textAnswer, setTextAnswer] = useState(userAnswer || '');

  const isMultipleChoice = question.type === 'multiple_choice';
  const isTextBased = question.type === 'short_answer' || question.type === 'fill_in_blank';
  const isCodeQuestion = question.type === 'code_analysis';

  const handleSubmit = () => {
    const answer = isMultipleChoice ? selectedAnswer : textAnswer;
    onSubmit(answer);
  };

  const handleTextChange = (e) => {
    setTextAnswer(e.target.value);
  };

  const handleRadioChange = (value) => {
    setSelectedAnswer(value);
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Split text on code markers
    const parts = text.split(/(`{3}[\s\S]*?`{3}|`[\s\S]*?`)/g);
    
    return parts.map((part, index) => {
      // Check if this part is code
      if (part.startsWith('```') && part.endsWith('```')) {
        // Multi-line code block
        const code = part.slice(3, -3).trim();
        return (
          <pre key={index} className="bg-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto my-2">
            {code}
          </pre>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // Inline code
        const code = part.slice(1, -1);
        return (
          <code key={index} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
            {code}
          </code>
        );
      } else {
        // Regular text, render paragraphs
        return part.split('\n\n').map((paragraph, pIndex) => (
          <p key={`${index}-${pIndex}`} className="mb-2">{paragraph}</p>
        ));
      }
    });
  };

  return (
    <div className="card">
      <Heading as="h2" size="md" mb={4}>
        {question.questionNumber || 'Question'} {question.questionText && ': ' + question.questionText}
      </Heading>
      
      <Box my={4}>
        {renderFormattedText(question.questionDescription)}
      </Box>
      
      {isCodeQuestion && question.codeSnippet && (
        <Box mb={6}>
          <pre className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
            {question.codeSnippet}
          </pre>
        </Box>
      )}
      
      <Box mt={6}>
        {isMultipleChoice && (
          <RadioGroup value={selectedAnswer} onChange={handleRadioChange} isDisabled={disabled}>
            <Stack spacing={3}>
              {question.options.map((option, index) => (
                <Radio key={index} value={option} colorScheme="indigo">
                  {option}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
        
        {isTextBased && (
          <Textarea
            value={textAnswer}
            onChange={handleTextChange}
            placeholder="Enter your answer here..."
            size="md"
            isDisabled={disabled}
            className="box-border"
          />
        )}
        
        {isCodeQuestion && (
          <Textarea
            value={textAnswer}
            onChange={handleTextChange}
            placeholder="Write your code or explanation here..."
            size="lg"
            height="200px"
            fontFamily="mono"
            isDisabled={disabled}
            className="box-border"
          />
        )}
      </Box>
      
      {!disabled && (
        <Box mt={6} textAlign="center">
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={<FiCheck />}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Checking..."
            isDisabled={isMultipleChoice ? !selectedAnswer : !textAnswer.trim()}
            className="cursor-pointer"
          >
            Submit Answer
          </Button>
        </Box>
      )}
    </div>
  );
}