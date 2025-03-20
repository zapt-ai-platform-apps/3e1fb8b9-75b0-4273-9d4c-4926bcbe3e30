import React from 'react';

export default function ZaptBadge() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a 
        href="https://www.zapt.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full bg-white px-3 py-1.5 shadow-lg border border-gray-100 transition-transform hover:scale-105"
      >
        <span className="text-gray-700 text-xs font-medium">Made on ZAPT</span>
      </a>
    </div>
  );
}