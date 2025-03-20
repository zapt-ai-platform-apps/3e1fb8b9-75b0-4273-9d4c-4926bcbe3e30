import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import QuestionCard from '@/components/quiz/QuestionCard';
import FeedbackCard from '@/components/quiz/FeedbackCard';
import QuizProgress from '@/components/quiz/QuizProgress';
import { Button, Alert, AlertIcon, Box } from '@chakra-ui/react';

export default function QuizPage() {
  const { 
    questions, 
    currentQuestionIndex, 
    userAnswers, 
    feedback, 
    score,
    isChecking, 
    error, 
    quizFinished,
    checkAnswer, 
    nextQuestion 
  } = useQuiz();
  const navigate = useNavigate();

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto card text-center">
        <Alert status="warning" className="mb-4">
          <AlertIcon />
          No questions have been generated. Please go back to generate questions.
        </Alert>
        <Button colorScheme="blue" onClick={() => navigate('/pdf-viewer')}>
          Back to PDF Viewer
        </Button>
      </div>
    );
  }

  if (quizFinished) {
    navigate('/results');
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const currentAnswerSubmitted = userAnswers[currentQuestionIndex] !== null;

  const handleSubmitAnswer = (answer) => {
    checkAnswer(currentQuestionIndex, answer);
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <QuizProgress 
        currentIndex={currentQuestionIndex} 
        total={totalQuestions} 
        score={score} 
      />
      
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <QuestionCard 
        question={currentQuestion} 
        onSubmit={handleSubmitAnswer}
        isSubmitting={isChecking}
        disabled={currentAnswerSubmitted}
        userAnswer={userAnswers[currentQuestionIndex]}
      />
      
      {feedback && (
        <Box mt={6}>
          <FeedbackCard feedback={feedback} />
          
          <div className="mt-6 text-center">
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={handleNextQuestion}
              className="cursor-pointer"
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
            </Button>
          </div>
        </Box>
      )}
    </div>
  );
}