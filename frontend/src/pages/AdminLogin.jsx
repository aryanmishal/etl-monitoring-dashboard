import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAccess = e => {
    e.preventDefault();
    if (code === 'admin1234') {
      // Store admin access in session storage
      sessionStorage.setItem('adminAccess', 'true');
      navigate('/admin');
    } else {
      setError('Incorrect access code.');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-login-bg relative">
      {/* ETL Monitoring Dashboard Logo and Title - Top Left Corner */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-white text-3xl font-bold tracking-wide leading-none">
              ETL Monitoring
            </span>
            <span className="text-white text-xl font-semibold tracking-wide leading-none opacity-90">
              Admin Access
            </span>
          </div>
        </div>
      </div>
      
      {/* Login Card - Centered */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="login-card dark-theme-card">
          <h1 className="dark-card-title">Admin Access</h1>
          <form onSubmit={handleAccess} className="login-form">
            <div className="form-field">
              <label className="form-label dark-label">Enter Admin Access Code:</label>
              <input
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="custom-input dark-input"
                placeholder="Access Code"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 mb-4 text-xl dark-error">{error}</div>
            )}
            <button type="submit" className="custom-button dark-button">
              Enter
            </button>
          </form>
        </div>
      </div>
      
      {/* Back to Login Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleBackToLogin}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl shadow-lg font-semibold transition-all duration-200 hover:bg-gray-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
} 