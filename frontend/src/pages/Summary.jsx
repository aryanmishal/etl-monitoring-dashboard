import { useState, useEffect } from "react";
import api from "../api";
import CustomDatePicker from "../components/CustomDatePicker";
import { getTodayDate, formatDateForDisplay } from "../utils/dateUtils";

// Function to get week dates for a given date (Monday as first day)
const getWeekDates = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00');
  const startOfWeek = new Date(date);
  // Adjust for Monday as first day: Sunday = 0, Monday = 1, etc.
  const dayOfWeek = date.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday becomes 6 days back, Monday becomes 0 days back
  startOfWeek.setDate(date.getDate() - daysToSubtract);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    const yearStr = weekDate.getFullYear();
    const monthStr = String(weekDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(weekDate.getDate()).padStart(2, '0');
    weekDates.push(`${yearStr}-${monthStr}-${dayStr}`);
  }
  return weekDates;
};

export default function Summary() {
  const [date, setDate] = useState(() => getTodayDate());
  const [viewType, setViewType] = useState("daily"); // daily, weekly, monthly
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const response = await api.get('/api/user-settings');
      setUserSettings(response.data);
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Error loading user settings:', error);
      // Continue with default behavior if settings can't be loaded
      setSettingsLoaded(true);
    }
  };

  const fetchSummary = async (selectedDate) => {
    setLoading(true);
    try {
      let endpoint = "/api/summary";
      if (viewType === "weekly") {
        endpoint = "/api/summary/weekly";
      } else if (viewType === "monthly") {
        endpoint = "/api/summary/monthly";
      }
      
      // No pagination: do not send page or page_size
      const res = await api.get(endpoint, { 
        params: { date: selectedDate } 
      });

      let summaryData = res.data;

      // Apply user settings if available and custom input is selected
      if (settingsLoaded && userSettings && userSettings.user_count_logic === 'custom_input' && userSettings.custom_user_count) {
        const customCount = parseInt(userSettings.custom_user_count);
        if (!isNaN(customCount) && customCount > 0) {
          summaryData.total_users = customCount;
          console.log(`Applied custom user count: ${customCount}`);
        }
      }

      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching summary", err);
      setSummary(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (date && settingsLoaded) {
      fetchSummary(date);
    }
  }, [date, viewType, userSettings, settingsLoaded]);

  // Reset date when view type changes
  useEffect(() => {
    if (viewType === "monthly") {
      // Always set to first day of the current month (today's month)
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const yearStr = firstDayOfMonth.getFullYear();
      const monthStr = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(firstDayOfMonth.getDate()).padStart(2, '0');
      setDate(`${yearStr}-${monthStr}-${dayStr}`);
    } else if (viewType === "weekly" || viewType === "daily") {
      // Always set to today for weekly or daily
      setDate(getTodayDate());
    }
  }, [viewType]);

  const getDateDisplay = () => {
    if (viewType === "daily") {
      return formatDateForDisplay(summary?.date || date);
    } else {
      // For weekly and monthly, format the date range
      if (summary?.date_range) {
        const [startDate, endDate] = summary.date_range.split(' to ');
        const formattedStart = formatDateForDisplay(startDate);
        const formattedEnd = formatDateForDisplay(endDate);
        return `${formattedStart} to ${formattedEnd}`;
      }
      return formatDateForDisplay(date);
    }
  };

  // Calculate highlight dates based on current date and view type
  const getHighlightDates = () => {
    if (viewType === "weekly") {
      // For weekly view, calculate week dates immediately
      return getWeekDates(date);
    } else if (viewType === "monthly") {
      // For monthly view, use the date list from summary if available
      return summary?.date_list || [];
    } else {
      // For daily view, no highlighting needed
      return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="date-selector flex items-center gap-4 justify-center">
        <label className="font-semibold mr-1">
          {viewType === "monthly" ? "Select Month: " : 
           viewType === "weekly" ? "Select Week: " : "Select Date: "}
        </label>
        <CustomDatePicker
          value={date}
          onChange={(e) => { setDate(e.target.value); }}
          label={viewType === "monthly" ? "Select Month" : "Select Date"}
                          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
          highlightDates={getHighlightDates()}
          viewMode={viewType === "monthly" ? "month" : viewType === "weekly" ? "week" : "day"}
        />
        
        <label className="font-semibold ml-4 mr-0">View Type: </label>
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
          <label className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            viewType === "daily" 
              ? "bg-gray-200 text-gray-800 shadow-sm border border-gray-300" 
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="viewType"
              value="daily"
              checked={viewType === "daily"}
              onChange={(e) => { setViewType(e.target.value); }}
              className="sr-only"
            />
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Daily
          </label>
          <label className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            viewType === "weekly" 
              ? "bg-gray-200 text-gray-800 shadow-sm border border-gray-300" 
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="viewType"
              value="weekly"
              checked={viewType === "weekly"}
              onChange={(e) => { setViewType(e.target.value); }}
              className="sr-only"
            />
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Weekly
          </label>
          <label className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            viewType === "monthly" 
              ? "bg-gray-200 text-gray-800 shadow-sm border border-gray-300" 
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="viewType"
              value="monthly"
              checked={viewType === "monthly"}
              onChange={(e) => { setViewType(e.target.value); }}
              className="sr-only"
            />
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Monthly
          </label>
        </div>
      </div>

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : !date ? (
        <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {viewType === "daily" ? "Please select a date" : 
             viewType === "weekly" ? "Please select a week" : 
             "Please select a month"}
          </h3>
          <p className="text-gray-600">
            {viewType === "daily" ? "Choose a specific date to view the daily report." : 
             viewType === "weekly" ? "Choose a week to view the weekly report." : 
             "Choose a month to view the monthly report."}
          </p>
        </div>
      ) : summary ? (
        <>
        <div className="summary-card mt-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              Summary Report
            </h2>
            <p className="text-gray-100 text-sm mt-1">
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View - {getDateDisplay()}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key Metrics Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Key Metrics
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Total Raw Records</span>
                    <span className="text-2xl font-bold text-gray-800">{summary.total_raw}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Total Bronze Records</span>
                    <span className={`text-2xl font-bold ${summary.total_bronze === summary.total_raw ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.total_bronze}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Silver Records</span>
                    <span className={`text-2xl font-bold ${summary.total_bronze === summary.total_raw && summary.total_silver === summary.total_bronze * 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.total_silver}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingestion Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Ingestion Status
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Total Users</span>
                    <span className="text-2xl font-bold text-gray-800">{summary.total_users}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Successful Ingestions</span>
                    <span className="text-2xl font-bold text-green-600">{summary.successful_ingestions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Missing Ingestions</span>
                    <span className="text-2xl font-bold text-red-600">{summary.total_users - (summary.successful_ingestions || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Pipeline Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pipeline Status
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Raw to Bronze</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      summary.raw_to_bronze_status === 'Success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {summary.raw_to_bronze_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Bronze to Silver</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      summary.bronze_to_silver_status === 'Success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {summary.bronze_to_silver_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      ) : (
        <p className="text-red-500 mt-4">Failed to load summary data.</p>
      )}
    </div>
  );
}
