import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATIC_CODE = '123456';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirectTimeout, setRedirectTimeout] = useState(null);

  useEffect(() => {
    if (step === 4) {
      const timeout = setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      setRedirectTimeout(timeout);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Check backend for email existence
  const checkEmailExists = async (email) => {
    try {
      const res = await api.post('/api/auth/check-user', { username: email, password: 'dummy' });
      return res.data.exists;
    } catch (err) {
      return false;
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    // Check if email exists (simulate)
    const exists = await checkEmailExists(email);
    if (exists) {
      setStep(2);
    } else {
      setError('Invalid email. No user found with this email.');
      setStep(1); // Stay on step 1 if email is invalid
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (code !== STATIC_CODE) {
      setError('Invalid verification code.');
      return;
    }
    setStep(3);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.post('/api/auth/reset-password', { username: email, new_password: newPassword });
      setSuccess('Password reset successful! You can now log in with your new password.');
      setStep(4);
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.detail === 'New password cannot be the same as the current password.') {
        setError('New password cannot be the same as the current password.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-login-bg">
      <div className="login-card dark-theme-card">
        <h1 className="dark-card-title">Forgot Password</h1>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email" className="form-label dark-label">Enter Your Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input dark-input"
                required
              />
            </div>
            {error && <div className="text-red-500 mb-4 text-xl dark-error">{error}</div>}
            <button type="submit" className="custom-button dark-button w-full h-12 capitalize">Next</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="code" className="form-label dark-label">Enter Verification Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="custom-input dark-input"
                required
              />
              <div className="text-xs mt-2 dark-label">(Use code: <span className="font-bold">{STATIC_CODE}</span>)</div>
            </div>
            {error && <div className="text-red-500 mb-4 text-xl dark-error">{error}</div>}
            <button type="submit" className="custom-button dark-button w-full h-12 capitalize">Verify</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="newPassword" className="form-label dark-label">Enter New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="custom-input dark-input"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label dark-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="custom-input dark-input"
                required
              />
            </div>
            {error && <div className="text-red-500 mb-4 text-xl dark-error">{error}</div>}
            <button type="submit" className="custom-button dark-button w-full h-12 capitalize">Reset Password</button>
          </form>
        )}
        {step === 4 && (
          <>
            {success && <div className="text-green-600 text-xl capitalize mb-4 dark-success">{success}</div>}
            <div className="text-gray-400 text-sm mt-2 capitalize">Redirecting To Login Page In 3 Seconds...</div>
          </>
        )}
        <div className="mt-4 text-center">
          <Link to="/login" className="forgot-password text-sm capitalize dark-link">
            Back To Login
          </Link>
        </div>
      </div>
    </div>
  );
} 