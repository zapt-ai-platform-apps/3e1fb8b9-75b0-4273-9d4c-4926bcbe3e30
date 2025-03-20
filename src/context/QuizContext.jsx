import React, { createContext, useState, useContext } from 'react';
import * as Sentry from '@sentry/browser';
import { usePDF } from './PDFContext';

const QuizContext = createContext();

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

export function QuizProvider({ children }) {
  const { pdfText, codeSnippets, embeddings } = usePDF();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [error, setError] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const generateQuestions = async (count = 5, difficulty = difficultyLevel) => {
    if (!pdfText || pdfText.trim() === '') {
      setError('No PDF content available to generate questions');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Generating questions based on PDF content');
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeddings,
          codeSnippets,
          count,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      console.log('Questions generated:', data.questions.length);
      
      setQuestions(data.questions);
      setUserAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizFinished(false);
      
      return data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      Sentry.captureException(error);
      setError(error.message);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAnswer = async (questionIndex, answer) => {
    if (questionIndex < 0 || questionIndex >= questions.length) {
      setError('Invalid question index');
      return;
    }

    setIsChecking(true);
    setError(null);
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[questionIndex] = answer;
    setUserAnswers(newUserAnswers);

    try {
      console.log(`Checking answer for question ${questionIndex + 1}`);
      const question = questions[questionIndex];
      
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          userAnswer: answer,
          embeddings,
          pdfText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check answer');
      }

      const data = await response.json();
      console.log('Answer check result:', data);
      
      setFeedback({
        isCorrect: data.isCorrect,
        explanation: data.explanation,
        percentCorrect: data.percentCorrect,
      });

      if (data.isCorrect) {
        setScore(prevScore => prevScore + 1);
      }

      return data;
    } catch (error) {
      console.error('Error checking answer:', error);
      Sentry.captureException(error);
      setError(error.message);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setFeedback(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setFeedback(null);
    setScore(0);
    setIsGenerating(false);
    setIsChecking(false);
    setError(null);
    setQuizFinished(false);
  };

  const value = {
    questions,
    currentQuestionIndex,
    userAnswers,
    feedback,
    score,
    difficultyLevel,
    isGenerating,
    isChecking,
    error,
    quizFinished,
    generateQuestions,
    checkAnswer,
    nextQuestion,
    resetQuiz,
    setDifficultyLevel,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}