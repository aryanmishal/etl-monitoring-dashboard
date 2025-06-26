import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/login", { username, password });
      const token = res.data.access_token;
      
      if (rememberMe) {
        // Store in localStorage for persistent storage
        localStorage.setItem("token", token);
        localStorage.setItem("rememberMe", "true");
      } else {
        // Store in sessionStorage for temporary storage (cleared when browser closes)
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
      }
      
      setToken(token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-[#f6d365] to-[#fda085]">
      <div className="login-card">
        <h1>Welcome Back</h1>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-field">
            <label htmlFor="email" className="form-label">Email ID</label>
            <input
              type="email"
              id="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="custom-input"
              required
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="custom-input"
              required
            />
          </div>
          
          <div className="remember-me mb-4">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" className="text-sm">Remember me</label>
          </div>
          
          {error && (
            <div className="text-red-500 mb-4 text-xl">{error}</div>
          )}
          
          <button
            type="submit"
            className="custom-button"
          >
            Login
          </button>
          
          <a href="#" className="forgot-password text-sm">
            Forgot password?
          </a>
        </form>
        
        <div className="registration-link">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#f6d365] font-semibold no-underline hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
