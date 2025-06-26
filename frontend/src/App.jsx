import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SyncStatus from './pages/SyncStatus';
import VitalsStatus from './pages/VitalsStatus';
import Summary from './pages/Summary';
import Login from './pages/Login';
import Register from './pages/Register';

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
  };

  return (
    <Router>
      {token ? (
        <div className="min-h-screen bg-gray-50">
          <Navbar setToken={handleLogout} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<SyncStatus />} />
              <Route path="/vitals" element={<VitalsStatus />} />
              <Route path="/summary" element={<Summary />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
