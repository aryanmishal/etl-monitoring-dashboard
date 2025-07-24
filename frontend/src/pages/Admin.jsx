import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserTable({ users, onEdit, onDelete }) {
  return (
    <table className="table-container">
      <thead>
        <tr>
          <th>Username</th>
          <th>Full Name</th>
          <th>Nickname</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.full_name}</td>
            <td>{user.nickname}</td>
            <td className="text-center">
              <div className="flex gap-2 justify-center">
                <button
                  className="btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                  title="Edit"
                  onClick={() => onEdit(user)}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" /></svg>
                  Edit
                </button>
                <button
                  className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                  title="Delete"
                  onClick={() => onDelete(user)}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UserForm({ onSubmit, onCancel, initial, apiError, setApiError }) {
  const [username, setUsername] = useState(initial?.username || '');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(initial?.nickname || '');
  const [fullName, setFullName] = useState(initial?.full_name || '');
  const [emailError, setEmailError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !fullName || !nickname || (!initial && !password)) {
      setFieldError('All fields are required.');
      return;
    }
    if (!validateEmail(username)) {
      setEmailError('Please enter a valid email address.');
      setFieldError('');
      return;
    }
    setEmailError('');
    setFieldError('');
    setApiError && setApiError('');
    onSubmit({ username, password, nickname, full_name: fullName });
  };

  return (
    <form
      className="bg-gray-50 p-6 rounded-lg border mb-4"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col w-full">
          <label className="mb-1 text-xs font-semibold text-gray-700" htmlFor="username">Username (Email)</label>
          <input
            className="custom-input dark-input"
            id="username"
            type="email"
            placeholder="Email Address"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            autoComplete="username"
          />
          {emailError && <span className="text-xs text-red-600 mt-1">{emailError}</span>}
        </div>
        {!initial && (
          <div className="flex flex-col w-full">
            <label className="mb-1 text-xs font-semibold text-gray-700" htmlFor="password">Password</label>
            <input className="custom-input dark-input" id="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="new-password" required />
          </div>
        )}
        <div className="flex flex-col w-full">
          <label className="mb-1 text-xs font-semibold text-gray-700" htmlFor="fullname">Full Name</label>
          <input className="custom-input dark-input" id="fullname" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div className="flex flex-col w-full">
          <label className="mb-1 text-xs font-semibold text-gray-700" htmlFor="nickname">Nickname</label>
          <input className="custom-input dark-input" id="nickname" placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} required />
        </div>
      </div>
      {(apiError || fieldError) && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2 font-medium">
          {apiError || fieldError}
        </div>
      )}
      <div className="flex gap-3 justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-10 py-2 px-3 border border-gray-300 rounded text-sm font-medium box-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center">
          {initial ? 'Update' : 'Add'} User
        </button>
        <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-10 py-2 px-3 border border-gray-300 rounded text-sm font-medium box-border transition-all duration-200 focus:outline-none flex items-center justify-center" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Check for admin access on component mount
  useEffect(() => {
    const adminAccess = sessionStorage.getItem('adminAccess');
    if (!adminAccess) {
      navigate('/admin-login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
      else setApiError(data.error || 'Failed to fetch users');
    } catch (e) {
      setApiError('Failed to fetch users');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditUser(null);
    setShowForm(true);
  };
  
  const handleEdit = user => {
    setEditUser(user);
    setShowForm(true);
  };
  
  const handleDelete = async id => {
    setApiError('');
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchUsers();
      setSuccessMessage('User deleted successfully!');
    } else {
      setApiError(data.error || 'Failed to delete user');
    }
    setLoading(false);
    setPendingDelete(null);
  };

  const handleFormSubmit = async user => {
    setApiError('');
    setLoading(true);
    let res, data;
    if (editUser) {
      res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      data = await res.json();
    } else {
      res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      data = await res.json();
    }
    if (data.success) {
      setShowForm(false);
      setEditUser(null);
      fetchUsers();
      setSuccessMessage(editUser ? 'User updated successfully!' : 'User added successfully!');
    } else {
      let errMsg = data.error || 'Failed to save user';
      if (errMsg && (errMsg.toLowerCase().includes('duplicate entry') || errMsg.toLowerCase().includes('users.username'))) {
        errMsg = 'A user with this email already exists.';
      }
      setApiError(errMsg);
    }
    setLoading(false);
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('adminAccess');
    navigate('/login');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAccess');
    navigate('/admin-login');
  };

  // Filter users by search
  const filteredUsers = users.filter(user => {
    const q = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(q) ||
      (user.full_name && user.full_name.toLowerCase().includes(q)) ||
      (user.nickname && user.nickname.toLowerCase().includes(q))
    );
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // Reset to first page when search changes
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar with Navbar Styling */}
      <nav style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '2rem 0', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        position: 'relative' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 2rem', 
          position: 'relative',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          {/* Left side - Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.25rem'
            }}>
              <span style={{
                color: '#ffffff',
                fontSize: '1.375rem',
                fontWeight: '700',
                letterSpacing: '0.025em',
                lineHeight: '1'
              }}>
                ETL Monitoring
              </span>
              <span style={{
                color: '#fbbf24',
                fontSize: '1rem',
                fontWeight: '600',
                letterSpacing: '0.025em',
                lineHeight: '1',
                opacity: '0.95'
              }}>
                Admin Panel
              </span>
            </div>
          </div>

          {/* Right side - Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleLogout} 
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '0.6rem 1.5rem',
                borderRadius: '0.6rem',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#b91c1c';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Logout
            </button>
            <button 
              onClick={handleBackToLogin} 
              style={{
                backgroundColor: '#374151',
                color: '#ffffff',
                padding: '0.6rem 1.7rem',
                borderRadius: '0.6rem',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#374151';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Bar */}
        <div className="date-selector flex items-center gap-4 mb-6 justify-between">
          <div className="flex items-center gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white h-11 py-2.5 px-3 border border-gray-300 rounded text-sm font-medium box-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              style={{ minWidth: '110px' }}
              onClick={handleAdd}
            >
              Add New User
            </button>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="border pr-8 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm"
                style={{ minWidth: '180px', paddingLeft: '2.75rem' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  tabIndex={-1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center min-h-[40px]">
            {successMessage && (
              <span className="bg-green-50 text-green-800 border border-green-200 rounded px-4 py-2 text-sm font-medium shadow-sm animate-fade-in">
                {successMessage}
              </span>
            )}
            {apiError && !showForm && (
              <span className="bg-red-50 text-red-800 border border-red-200 rounded px-4 py-2 text-sm font-medium shadow-sm animate-fade-in ml-2">
                {apiError}
              </span>
            )}
            {loading && <span className="text-gray-500 ml-4">Loading...</span>}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <UserTable users={paginatedUsers} onEdit={handleEdit} onDelete={user => setPendingDelete(user)} />
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-col items-center gap-6 mt-8">
          {/* Page Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Page {page} of {totalPages}</span>
            <span className="text-gray-400">•</span>
            <span>{filteredUsers.length} total records</span>
          </div>
          {/* Pagination Buttons - Only show if more than 1 page */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 font-medium text-sm ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                }`}
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 7;
                  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  // Add first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setPage(1)}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                      );
                    }
                  }
                  // Add visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          page === i
                            ? 'bg-gray-700 text-white border-gray-700 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  // Add last page and ellipsis if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setPage(totalPages)}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
              {/* Next Button */}
              <button
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 font-medium text-sm ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                }`}
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-16 max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-3xl font-extrabold focus:outline-none w-12 h-12 flex items-center justify-center"
                onClick={() => { setShowForm(false); setEditUser(null); setApiError(''); }}
                title="Close"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4 text-gray-800">{editUser ? 'Edit User' : 'Add User'}</h2>
              <UserForm
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowForm(false); setEditUser(null); setApiError(''); }}
                initial={editUser}
                apiError={apiError}
                setApiError={setApiError}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Confirm Delete</h2>
              <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-semibold">{pendingDelete.username}</span>?</p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                  onClick={() => setPendingDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
                  onClick={() => handleDelete(pendingDelete.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 