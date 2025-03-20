import React from 'react';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="card flex flex-col items-center text-center p-6">
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}