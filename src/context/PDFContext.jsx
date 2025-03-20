import React, { createContext, useState, useContext } from 'react';
import * as Sentry from '@sentry/browser';

const PDFContext = createContext();

export function usePDF() {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
}

export function PDFProvider({ children }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const uploadPdf = async (selectedFile) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      console.log('Uploading PDF for processing:', selectedFile.name);
      
      // Upload the PDF for processing
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }

      setProgress(50);
      
      const data = await response.json();
      console.log('PDF processing complete:', data);
      
      setPdfText(data.text);
      setCodeSnippets(data.codeSnippets);
      setEmbeddings(data.embeddings);
      
      setProgress(100);
      setIsProcessing(false);
      return data;
    } catch (error) {
      console.error('Error processing PDF:', error);
      Sentry.captureException(error);
      setError(error.message);
      setIsProcessing(false);
      setProgress(0);
      throw error;
    }
  };

  const resetPdf = () => {
    setFile(null);
    setFileName('');
    setPdfText('');
    setCodeSnippets([]);
    setEmbeddings([]);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  };

  const value = {
    file,
    fileName,
    pdfText,
    codeSnippets,
    embeddings,
    isProcessing,
    progress,
    error,
    uploadPdf,
    resetPdf,
  };

  return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
}