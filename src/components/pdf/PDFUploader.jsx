import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile } from 'react-icons/fi';
import { Alert, AlertIcon, Spinner } from '@chakra-ui/react';

export default function PDFUploader({ onUpload, isLoading, error }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div className="card">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Spinner size="xl" color="indigo.500" thickness="4px" className="mb-4" />
            <p className="text-lg font-medium text-gray-700">Processing PDF...</p>
            <p className="text-gray-500 mt-2">This may take a moment depending on file size</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {isDragActive ? (
              <>
                <FiFile className="h-12 w-12 text-indigo-500 mb-4" />
                <p className="text-lg font-medium text-indigo-600">Drop the PDF here</p>
              </>
            ) : (
              <>
                <FiUpload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">Drag and drop a PDF file here, or click to select</p>
                <p className="text-gray-500 mt-2">Only PDF files are accepted</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
    </div>
  );
}