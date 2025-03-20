import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { usePDF } from '@/context/PDFContext';
import ResultsSummary from '@/components/results/ResultsSummary';
import QuestionReview from '@/components/results/QuestionReview';
import { Button, Alert, AlertIcon } from '@chakra-ui/react';

export default function ResultsPage() {
  const { questions, userAnswers, score, resetQuiz } = useQuiz();
  const { resetPdf } = usePDF();
  const navigate = useNavigate();

  if (questions.length === 0 || userAnswers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto card text-center">
        <Alert status="warning" className="mb-4">
          <AlertIcon />
          No quiz results available. Please take a quiz first.
        </Alert>
        <Button colorScheme="blue" onClick={() => navigate('/')}>
          Go to Home Page
        </Button>
      </div>
    );
  }

  const percentage = Math.round((score / questions.length) * 100);

  const handleRetakeQuiz = () => {
    navigate('/pdf-viewer');
  };

  const handleStartNew = () => {
    resetQuiz();
    resetPdf();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="page-title">Quiz Results</h1>
      
      <ResultsSummary 
        score={score} 
        total={questions.length} 
        percentage={percentage} 
      />
      
      <div className="card mt-8 mb-6">
        <h2 className="section-title">Question Review</h2>
        {questions.map((question, index) => (
          <QuestionReview
            key={index}
            question={question}
            userAnswer={userAnswers[index]}
            index={index}
          />
        ))}
      </div>
      
      <div className="flex justify-center gap-4 mb-12">
        <Button
          colorScheme="blue"
          onClick={handleRetakeQuiz}
          className="cursor-pointer"
        >
          Generate New Quiz
        </Button>
        <Button
          variant="outline"
          onClick={handleStartNew}
          className="cursor-pointer"
        >
          Upload New PDF
        </Button>
      </div>
    </div>
  );
}