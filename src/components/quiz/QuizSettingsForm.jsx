import React from 'react';
import { FormControl, FormLabel, Select, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';

export default function QuizSettingsForm({ questionCount, setQuestionCount, difficulty, setDifficulty }) {
  const handleQuestionCountChange = (valueString) => {
    const value = parseInt(valueString);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      setQuestionCount(value);
    }
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  return (
    <div className="space-y-4">
      <FormControl>
        <FormLabel>Number of Questions</FormLabel>
        <NumberInput 
          value={questionCount} 
          onChange={handleQuestionCountChange}
          min={1} 
          max={20} 
          step={1}
        >
          <NumberInputField className="box-border" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      
      <FormControl>
        <FormLabel>Difficulty Level</FormLabel>
        <Select value={difficulty} onChange={handleDifficultyChange} className="box-border">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </FormControl>
    </div>
  );
}