import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import PDFViewerPage from '@/pages/PDFViewerPage';
import QuizPage from '@/pages/QuizPage';
import ResultsPage from '@/pages/ResultsPage';
import { PDFProvider } from '@/context/PDFContext';
import { QuizProvider } from '@/context/QuizContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ZaptBadge from '@/components/shared/ZaptBadge';

export default function App() {
    return (
        <Router>
            <PDFProvider>
                <QuizProvider>
                    <div className="page-container">
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/pdf-viewer" element={<PDFViewerPage />} />
                                <Route path="/quiz" element={<QuizPage />} />
                                <Route path="/results" element={<ResultsPage />} />
                            </Routes>
                        </main>
                        <ZaptBadge />
                        <Footer />
                    </div>
                </QuizProvider>
            </PDFProvider>
        </Router>
    );
}