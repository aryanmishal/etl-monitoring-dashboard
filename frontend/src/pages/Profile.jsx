import { useEffect, useState, useRef } from 'react';
import { getProfile } from '../api';
import api from '../api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nickname: '', full_name: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const errorTimeoutRef = useRef(null);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
    }
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [error]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ nickname: data.nickname || '', full_name: data.full_name || '' });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-hide password success message after 3 seconds
  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => {
        setPasswordSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  const handleEdit = () => {
    setEditMode(true);
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({ nickname: profile.nickname || '', full_name: profile.full_name || '' });
    setSuccess(null);
    setError(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await api.put('/api/auth/profile', {
        nickname: form.nickname,
        full_name: form.full_name
      });
      setProfile(res.data);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await api.put('/api/auth/profile/password', { password });
      setPassword('');
      setShowPassword(false);
      setPasswordSuccess('Password updated successfully!');
    } catch (err) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.detail === 'New password cannot be the same as the current password'
      ) {
        setPasswordError('New password cannot be the same as your current password.');
      } else {
        setPasswordError('Failed to update password.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <span className="ml-3 text-gray-600 font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }

  const avatarLetter = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-4xl mx-auto px-4">
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
      {/* Header */}
      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">User Profile</h1>
      </div>

      {/* Profile Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {avatarLetter}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          {!editMode ? (
            <button
              className="btn btn-active"
              onClick={handleEdit}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn btn-active"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="p-3">
          {success && <div className="mb-3 text-green-600 font-medium">{success}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Nickname */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nickname</label>
                {!editMode ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.nickname || <span className="text-gray-400 italic">Not set</span>}
                  </p>
                ) : (
                  <input
                    type="text"
                    name="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    className="custom-input mt-1"
                    placeholder="Enter nickname"
                  />
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                {!editMode ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.full_name || <span className="text-gray-400 italic">Not set</span>}
                  </p>
                ) : (
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="custom-input mt-1"
                    placeholder="Enter full name"
                  />
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                <p className="text-lg font-semibold text-gray-900">{profile.username}</p>
              </div>
            </div>

            {/* Password Change */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Password</label>
                <p className="text-lg font-semibold text-gray-900">••••••••</p>
                {!showPassword ? (
                  <div>
                    <button
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() => { setShowPassword(true); setPasswordError(null); setPasswordSuccess(null); }}
                    >
                      Change Password
                    </button>
                    {passwordSuccess && <div className="text-green-600 font-medium mt-2">{passwordSuccess}</div>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="custom-input"
                      placeholder="Enter new password"
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn btn-active"
                        onClick={handlePasswordSave}
                        disabled={passwordSaving || !password}
                      >
                        {passwordSaving ? 'Saving...' : 'Save Password'}
                      </button>
                      <button
                        className="btn"
                        onClick={() => { setShowPassword(false); setPassword(''); setPasswordError(null); setPasswordSuccess(null); }}
                        disabled={passwordSaving}
                      >
                        Cancel
                      </button>
                    </div>
                    {passwordError && <div className="text-red-600 font-medium">{passwordError}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 