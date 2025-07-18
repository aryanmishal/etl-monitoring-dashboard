import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Settings() {
  const [userCountLogic, setUserCountLogic] = useState('raw_files');
  const [customUserCount, setCustomUserCount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('light');

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user-settings');
      const settings = response.data;
      
      // Set the loaded settings with defaults if not present
      setUserCountLogic(settings.user_count_logic || 'raw_files');
      setCustomUserCount(settings.custom_user_count !== undefined && settings.custom_user_count !== null ? String(settings.custom_user_count) : '');
      setTheme(settings.theme || 'light');
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Error loading settings');
      // Use defaults if settings can't be loaded
      setUserCountLogic('raw_files');
      setCustomUserCount('');
      setTheme('light');
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = () => {
    if (userCountLogic === 'custom_input') {
      const count = parseInt(customUserCount);
      if (!customUserCount || isNaN(count) || count <= 0) {
        setMessage('Please enter a valid positive number for custom user count');
        return false;
      }
    }
    return true;
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Validate settings before saving
      if (!validateSettings()) {
        setSaving(false);
        return;
      }
      
      const settings = {
        user_count_logic: userCountLogic,
        custom_user_count: userCountLogic === 'custom_input' ? customUserCount : '',
        theme: theme
      };
      
      await api.post('/api/user-settings', settings);
      setMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Reset all settings to defaults
      setUserCountLogic('raw_files');
      setCustomUserCount('');
      setTheme('light');
      
      const defaultSettings = {
        user_count_logic: 'raw_files',
        custom_user_count: '',
        theme: 'light'
      };
      
      await api.post('/api/user-settings', defaultSettings);
      setMessage('Settings reset to defaults successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setMessage('Error resetting settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600 mb-6">Manage your preferences and account settings below.</p>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('Error') || message.includes('Please enter')
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message}
        </div>
      )}
      
      <div className="space-y-6">
        {/* User Count Logic Setting */}
        <div className="p-6 bg-gray-50 rounded-lg border">
          <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Count Logic</h3>
              <p className="text-sm text-gray-600">Choose how the app calculates the total number of users in the summary page</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculation Method
              </label>
              <select
                value={userCountLogic}
                onChange={(e) => setUserCountLogic(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="raw_files">Raw Files (Default)</option>
                <option value="custom_input">Custom Input</option>
              </select>
            </div>
            
            {userCountLogic === 'custom_input' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom User Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={customUserCount}
                  onChange={(e) => setCustomUserCount(e.target.value)}
                  placeholder="Enter total number of users"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This value will be used instead of calculating from raw files
                </p>
                {userCountLogic === 'custom_input' && (!customUserCount || parseInt(customUserCount) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    Please enter a valid positive number
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Theme Setting */}
        <div className="p-6 bg-gray-50 rounded-lg border">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Theme Customization</h3>
              <p className="text-sm text-gray-600">Choose your preferred theme for the app</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="light">Light Mode (Default)</option>
            </select>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={resetToDefaults}
            disabled={saving}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Resetting...' : 'Reset to Defaults'}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving || (userCountLogic === 'custom_input' && (!customUserCount || parseInt(customUserCount) <= 0))}
            className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
} 