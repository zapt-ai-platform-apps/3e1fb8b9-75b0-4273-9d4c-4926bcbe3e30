import React from 'react';
import { Box, Heading, Text, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, CircularProgress, CircularProgressLabel } from '@chakra-ui/react';

export default function ResultsSummary({ score, total, percentage }) {
  const getColorScheme = () => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "yellow";
    return "red";
  };

  const getMessage = () => {
    if (percentage >= 80) return "Excellent job! You have a strong understanding of the material.";
    if (percentage >= 60) return "Good work! You understand most of the material.";
    if (percentage >= 40) return "You're making progress, but review the topics you missed.";
    return "You should spend more time studying this material.";
  };

  return (
    <Box className="card">
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Quiz Results Summary
      </Heading>
      
      <Box display="flex" justifyContent="center" alignItems="center" mb={8}>
        <CircularProgress 
          value={percentage} 
          size="180px" 
          thickness="10px"
          color={`${getColorScheme()}.500`}
        >
          <CircularProgressLabel fontSize="2xl" fontWeight="bold">
            {percentage}%
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
      
      <StatGroup mb={6}>
        <Stat textAlign="center">
          <StatLabel fontSize="md">Score</StatLabel>
          <StatNumber>{score} / {total}</StatNumber>
          <StatHelpText>
            {((score / total) * 100).toFixed(1)}%
          </StatHelpText>
        </Stat>
        
        <Stat textAlign="center">
          <StatLabel fontSize="md">Questions</StatLabel>
          <StatNumber>{total}</StatNumber>
          <StatHelpText>
            {score} correct
          </StatHelpText>
        </Stat>
        
        <Stat textAlign="center">
          <StatLabel fontSize="md">Incorrect</StatLabel>
          <StatNumber>{total - score}</StatNumber>
          <StatHelpText>
            {(((total - score) / total) * 100).toFixed(1)}%
          </StatHelpText>
        </Stat>
      </StatGroup>
      
      <Box textAlign="center" p={4} bg={`${getColorScheme()}.50`} borderRadius="md">
        <Text fontSize="lg">{getMessage()}</Text>
      </Box>
    </Box>
  );
}