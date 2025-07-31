import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-start justify-center pt-8">
      <div className="login-card dark-theme-card text-center p-8">
        <h1 className="dark-card-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>
        
        <div className="space-y-3">
          <Link to="/" className="custom-button dark-button w-full block text-center py-3 px-6 text-base font-medium">
            Go to Dashboard
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full text-center block py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 