import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} PDF Quiz Generator. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
              Made on ZAPT
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}