import React from 'react';
import { Box, Icon, Text } from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export default function FeedbackCard({ feedback }) {
  const { isCorrect, explanation, percentCorrect } = feedback;
  
  const getIcon = () => {
    if (isCorrect) {
      return <Icon as={FiCheckCircle} w={8} h={8} color="green.500" />;
    } else if (percentCorrect > 0.5) {
      return <Icon as={FiAlertCircle} w={8} h={8} color="orange.500" />;
    } else {
      return <Icon as={FiXCircle} w={8} h={8} color="red.500" />;
    }
  };
  
  const getTitle = () => {
    if (isCorrect) {
      return "Correct!";
    } else if (percentCorrect > 0.5) {
      return "Partially Correct";
    } else {
      return "Incorrect";
    }
  };
  
  const getBgColor = () => {
    if (isCorrect) {
      return "green.50";
    } else if (percentCorrect > 0.5) {
      return "orange.50";
    } else {
      return "red.50";
    }
  };
  
  const getBorderColor = () => {
    if (isCorrect) {
      return "green.200";
    } else if (percentCorrect > 0.5) {
      return "orange.200";
    } else {
      return "red.200";
    }
  };

  const renderExplanation = () => {
    if (!explanation) return null;
    
    // Split explanation on code markers
    const parts = explanation.split(/(`{3}[\s\S]*?`{3}|`[\s\S]*?`)/g);
    
    return parts.map((part, index) => {
      // Check if this part is code
      if (part.startsWith('```') && part.endsWith('```')) {
        // Multi-line code block
        const code = part.slice(3, -3).trim();
        return (
          <pre key={index} className="bg-gray-700 text-white p-3 rounded-md font-mono text-sm overflow-x-auto my-2">
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
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      bg={getBgColor()}
      borderColor={getBorderColor()}
    >
      <Box display="flex" alignItems="center" mb={3}>
        {getIcon()}
        <Text fontWeight="bold" fontSize="lg" ml={2}>
          {getTitle()}
        </Text>
        {!isCorrect && percentCorrect !== undefined && (
          <Text ml={2} fontSize="sm" color="gray.600">
            ({Math.round(percentCorrect * 100)}% correct)
          </Text>
        )}
      </Box>
      
      <Box mt={2}>
        {renderExplanation()}
      </Box>
    </Box>
  );
}