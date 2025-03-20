import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiFileText, FiHelpCircle, FiBarChart } from 'react-icons/fi';

export default function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <FiHome /> },
    { path: '/pdf-viewer', label: 'PDF Viewer', icon: <FiFileText /> },
    { path: '/quiz', label: 'Quiz', icon: <FiHelpCircle /> },
    { path: '/results', label: 'Results', icon: <FiBarChart /> },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=40&height=40" 
                alt="PDF Quiz Generator Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className="text-lg font-semibold text-gray-900">PDF Quiz Generator</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive(item.path)
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-200">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-2 py-3 text-xs font-medium
                ${isActive(item.path)
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}