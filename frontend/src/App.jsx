import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SyncStatus from './pages/SyncStatus';
import VitalsStatus from './pages/VitalsStatus';
import Summary from './pages/Summary';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

// Global error handler for authentication issues
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.response?.status === 401) {
    // Clear storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  }
});

function RequireAuth({ children, token }) {
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [token, setToken] = useState(() => {
    // Check both localStorage and sessionStorage for token
    const persistentToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    return persistentToken || sessionToken || null;
  });

  useEffect(() => {
    // Handle page refresh and tab changes
    const handleStorageChange = () => {
      const persistentToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');
      setToken(persistentToken || sessionToken || null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Clear both storages on logout
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    setToken(null);
    // Force redirect to login page
    window.location.href = '/login';
  };

  return (
    <Router>
      {token ? (
        <div className="min-h-screen bg-gray-50">
          <Navbar setToken={handleLogout} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Summary />} />
              <Route path="/sync-status" element={<SyncStatus />} />
              <Route path="/vitals" element={<VitalsStatus />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
