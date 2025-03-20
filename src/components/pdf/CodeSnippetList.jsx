import React from 'react';

export default function CodeSnippetList({ snippets }) {
  if (!snippets || snippets.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        No code snippets were found in this PDF.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {snippets.map((snippet, index) => (
        <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <div className="font-mono text-sm text-gray-600">Code Snippet #{index + 1}</div>
            <div className="text-xs text-gray-500">~{snippet.length} characters</div>
          </div>
          <div className="bg-gray-50 p-4 overflow-x-auto">
            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">{snippet}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}