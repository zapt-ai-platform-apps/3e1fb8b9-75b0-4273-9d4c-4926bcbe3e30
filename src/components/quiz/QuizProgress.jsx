import React from 'react';
import { Box, Progress, Text, Flex } from '@chakra-ui/react';

export default function QuizProgress({ currentIndex, total, score }) {
  const progressPercent = ((currentIndex + 1) / total) * 100;
  const scorePercent = (score / (currentIndex + 1)) * 100;
  
  return (
    <Box mb={8}>
      <Flex justify="space-between" alignItems="center" mb={1}>
        <Text fontWeight="medium">
          Question {currentIndex + 1} of {total}
        </Text>
        <Text fontWeight="medium" color={scorePercent >= 70 ? "green.600" : "gray.600"}>
          Score: {score} / {currentIndex + 1} ({Math.round(scorePercent)}%)
        </Text>
      </Flex>
      
      <Progress
        value={progressPercent}
        size="sm"
        colorScheme="blue"
        borderRadius="full"
        bg="blue.100"
      />
    </Box>
  );
}