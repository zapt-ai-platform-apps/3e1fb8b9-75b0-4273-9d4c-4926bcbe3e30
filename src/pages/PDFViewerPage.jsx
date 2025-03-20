import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePDF } from '@/context/PDFContext';
import { useQuiz } from '@/context/QuizContext';
import PDFPreview from '@/components/pdf/PDFPreview';
import CodeSnippetList from '@/components/pdf/CodeSnippetList';
import QuizSettingsForm from '@/components/quiz/QuizSettingsForm';
import { Button, Alert, AlertIcon, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';

export default function PDFViewerPage() {
  const { file, fileName, pdfText, codeSnippets, resetPdf } = usePDF();
  const { generateQuestions, isGenerating, error } = useQuiz();
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const navigate = useNavigate();

  const handleStartQuiz = async () => {
    try {
      await generateQuestions(questionCount, difficulty);
      navigate('/quiz');
    } catch (error) {
      console.error('Failed to generate questions:', error);
    }
  };

  const handleCancel = () => {
    resetPdf();
    navigate('/');
  };

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto card text-center">
        <Alert status="warning" className="mb-4">
          <AlertIcon />
          No PDF file has been uploaded. Please upload a PDF first.
        </Alert>
        <Button colorScheme="blue" onClick={() => navigate('/')}>
          Go to Upload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-title">PDF Analysis: {fileName}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 card">
          <h2 className="section-title">PDF Preview</h2>
          <PDFPreview file={file} />
        </div>
        
        <div className="card">
          <h2 className="section-title">Generate Quiz</h2>
          <QuizSettingsForm 
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
          
          <div className="mt-6 space-y-4">
            <Button 
              colorScheme="blue" 
              isLoading={isGenerating}
              loadingText="Generating Questions..." 
              onClick={handleStartQuiz}
              width="full"
              className="cursor-pointer"
            >
              Start Quiz
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCancel}
              width="full"
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
          
          {error && (
            <Alert status="error" mt={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
        </div>
      </div>
      
      <div className="card mb-8">
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>Extracted Text</Tab>
            <Tab>Code Snippets ({codeSnippets.length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <div className="bg-gray-50 p-4 rounded-md max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{pdfText}</pre>
              </div>
            </TabPanel>
            
            <TabPanel>
              <CodeSnippetList snippets={codeSnippets} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}