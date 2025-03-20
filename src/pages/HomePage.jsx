import React from 'react';
import { useNavigate } from 'react-router-dom';
import PDFUploader from '@/components/pdf/PDFUploader';
import { usePDF } from '@/context/PDFContext';
import FeatureCard from '@/components/shared/FeatureCard';
import { FiUpload, FiBook, FiHelpCircle, FiBarChart2 } from 'react-icons/fi';

export default function HomePage() {
  const { uploadPdf, isProcessing, error } = usePDF();
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    try {
      await uploadPdf(file);
      navigate('/pdf-viewer');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PDF Code Quiz Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload programming language PDFs and automatically generate interactive quizzes
          to test your knowledge.
        </p>
      </div>

      <div className="mb-16">
        <PDFUploader 
          onUpload={handleUpload} 
          isLoading={isProcessing} 
          error={error} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <FeatureCard 
          icon={<FiUpload className="h-8 w-8 text-indigo-600" />}
          title="Upload PDFs" 
          description="Upload your programming language learning PDFs to get started."
        />
        <FeatureCard 
          icon={<FiBook className="h-8 w-8 text-indigo-600" />}
          title="Content Analysis" 
          description="Our system analyzes text and code in your PDFs to create contextual questions."
        />
        <FeatureCard 
          icon={<FiHelpCircle className="h-8 w-8 text-indigo-600" />}
          title="Interactive Quizzes" 
          description="Answer questions based on the PDF content with immediate feedback."
        />
        <FeatureCard 
          icon={<FiBarChart2 className="h-8 w-8 text-indigo-600" />}
          title="Track Progress" 
          description="Monitor your performance and focus on areas that need improvement."
        />
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="rounded-full bg-white text-indigo-600 w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
            <h3 className="font-semibold text-lg mb-2">Upload PDF</h3>
            <p className="opacity-90">Upload any programming language learning PDF document.</p>
          </div>
          <div className="text-center">
            <div className="rounded-full bg-white text-indigo-600 w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
            <h3 className="font-semibold text-lg mb-2">Review Content</h3>
            <p className="opacity-90">The system extracts and analyzes the PDF content.</p>
          </div>
          <div className="text-center">
            <div className="rounded-full bg-white text-indigo-600 w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
            <h3 className="font-semibold text-lg mb-2">Take Quiz</h3>
            <p className="opacity-90">Answer generated questions and receive immediate feedback.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Supported Programming Languages</h2>
        <p className="mb-4 text-gray-600">
          Our system can process PDFs containing content about these programming languages and more:
        </p>
        <div className="flex flex-wrap gap-2">
          {['Python', 'JavaScript', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift'].map(lang => (
            <span key={lang} className="badge">{lang}</span>
          ))}
        </div>
      </div>
    </div>
  );
}