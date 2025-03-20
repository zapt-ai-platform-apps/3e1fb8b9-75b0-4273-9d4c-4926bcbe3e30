import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Spinner, useToast } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Set workerSrc for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFPreview({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
    toast({
      title: 'Error loading PDF',
      description: 'There was a problem loading the PDF file.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-100 rounded-lg p-4 w-full flex justify-center min-h-[500px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </div>
        )}
        
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="pdf-document"
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={450}
          />
        </Document>
      </div>
      
      {numPages && (
        <div className="flex items-center justify-between w-full mt-4">
          <Button 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
            leftIcon={<FiChevronLeft />}
            colorScheme="gray"
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            Previous
          </Button>
          
          <p className="text-sm text-gray-700">
            Page {pageNumber} of {numPages}
          </p>
          
          <Button 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
            rightIcon={<FiChevronRight />}
            colorScheme="gray"
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}