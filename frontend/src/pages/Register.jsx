import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(username)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await api.post("/register", { username, password });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-[#f6d365] to-[#fda085]">
      <div className="login-card">
        <h1>Create Account</h1>
        
        <form onSubmit={handleRegister} className="login-form">
          <div className="form-field">
            <label htmlFor="username" className="form-label">Email Address</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="custom-input"
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Please enter a valid email address"
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
          
          {error && (
            <div className="text-red-500 mb-8 text-2xl">{error}</div>
          )}
          
          {success && (
            <div className="text-green-600 mb-8 text-2xl">{success}</div>
          )}
          
          <button
            type="submit"
            className="custom-button"
          >
            Register
          </button>
        </form>
        
        <div className="registration-link">
          Already have an account?{" "}
          <Link to="/login" className="text-[#f6d365] font-semibold no-underline hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
} 