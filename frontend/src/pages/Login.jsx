import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const errorTimeoutRef = useRef(null);

  // On mount, load error from sessionStorage if present
  useEffect(() => {
    const storedError = sessionStorage.getItem("login_error");
    if (storedError) setError(storedError);
  }, []);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setError("");
        sessionStorage.removeItem("login_error");
      }, 5000);
    }
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { username, password });
      const token = res.data.access_token;
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
      }
      setToken(token);
      sessionStorage.removeItem("login_error");
      setError("");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed";
      setError(msg);
      sessionStorage.setItem("login_error", msg);
    }
  };

  // Clear error on input change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) {
      setError("");
      sessionStorage.removeItem("login_error");
    }
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError("");
      sessionStorage.removeItem("login_error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-login-bg relative">
      {/* Error notification at top right */}
      {error && (
        <div
          className="fixed top-6 right-6 z-50 bg-red-100 border border-red-400 text-red-800 px-6 py-3 rounded-lg shadow-lg text-lg flex items-center gap-2 animate-fade-in"
          style={{ minWidth: 240 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 1018.364 5.636z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </div>
      )}
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
              Login Portal
            </span>
          </div>
        </div>
      </div>
      {/* Login Card - Centered */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="login-card dark-theme-card">
          <h1 className="dark-card-title">Login</h1>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label htmlFor="email" className="form-label dark-label">Email ID</label>
              <input
                type="email"
                id="email"
                value={username}
                onChange={handleUsernameChange}
                className="custom-input dark-input"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password" className="form-label dark-label">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="custom-input dark-input"
                required
              />
            </div>
            {/* Remove error message from inside the login card */}
            <div className="remember-me mb-4">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm dark-label">Remember me</label>
            </div>
            <button
              type="submit"
              className="custom-button dark-button"
              data-testid="user-login-btn"
            >
              Login
            </button>
            <Link to="/forgot-password" className="forgot-password text-sm capitalize dark-link">
              Forgot password?
            </Link>
          </form>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <button
          style={{ backgroundColor: '#374151' }}
          className="text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 hover:bg-[#4B5563] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#374151]"
          onClick={() => window.location.href = '/admin-login'}
        >
          Admin Login
        </button>
      </div>
    </div>
  );
}
