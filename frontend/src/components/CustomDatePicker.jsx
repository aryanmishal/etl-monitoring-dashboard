import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatDateForDisplay, formatDateForAPI } from '../utils/dateUtils';

const CustomDatePicker = ({ value, onChange, label, className, highlightDates = [], viewMode = 'day' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value + 'T12:00:00') : new Date());
  const [visualSelectedDate, setVisualSelectedDate] = useState(null); // NEW
  const [justSelectedInWeek, setJustSelectedInWeek] = useState(false);
  const [inputValue, setInputValue] = useState(formatDateForDisplay(value || ''));
  const pickerRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Week days and months arrays
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both the picker input and the dropdown
      const isOutsidePicker = pickerRef.current && !pickerRef.current.contains(event.target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      
      if (isOutsidePicker && isOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value + 'T12:00:00'));
      setInputValue(formatDateForDisplay(value));
      if (viewMode === 'week') {
        // For weekly view, also update currentDate
        setCurrentDate(new Date(value + 'T12:00:00'));
        // Do NOT update visualSelectedDate here, only update on user click
      } else {
        setCurrentDate(new Date(value + 'T12:00:00'));
        setVisualSelectedDate(null); // Reset for non-week views
      }
    } else {
      setInputValue('');
    }
  }, [value, viewMode]);



  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCalendarDays = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    
    // Adjust for Monday as first day (0 = Sunday, 1 = Monday, etc.)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    
    // Add previous month's days
    const prevMonthDays = getDaysInMonth(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      const prevMonth = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
      const prevYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
      const prevDayDate = new Date(prevYear, prevMonth, prevDay);
      const prevDateString = `${prevDayDate.getFullYear()}-${String(prevDayDate.getMonth() + 1).padStart(2, '0')}-${String(prevDayDate.getDate()).padStart(2, '0')}`;
      const isHighlighted = highlightDates.includes(prevDateString);
      
      days.push({
        day: prevDay,
        isCurrentMonth: false,
        isSelected: false,
        isHighlighted: isHighlighted
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
      const dateString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      const isHighlighted = highlightDates.includes(dateString);
      
      // Check if this day is selected by comparing the full date string
      const selectedDateString = selectedDate ? 
        `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 
        null;
      const isSelected = selectedDateString === dateString;
      

      
      days.push({
        day: i,
        isCurrentMonth: true,
        isSelected: isSelected,
        isHighlighted: isHighlighted
      });
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = date.getMonth() === 11 ? 0 : date.getMonth() + 1;
      const nextYear = date.getMonth() === 11 ? date.getFullYear() + 1 : date.getFullYear();
      const nextDayDate = new Date(nextYear, nextMonth, i);
      const nextDateString = `${nextDayDate.getFullYear()}-${String(nextDayDate.getMonth() + 1).padStart(2, '0')}-${String(nextDayDate.getDate()).padStart(2, '0')}`;
      const isHighlighted = highlightDates.includes(nextDateString);
      
      // Check if this day is selected by comparing the full date string
      const selectedDateString = selectedDate ? 
        `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 
        null;
      const isSelected = selectedDateString === nextDateString;
      
      days.push({
        day: i,
        isCurrentMonth: false,
        isSelected: isSelected,
        isHighlighted: isHighlighted
      });
    }
    
    return days;
  };

  // Get calendar days for the current date
  const calendarDays = getCalendarDays(currentDate);

  const handleDateSelect = (day, isCurrentMonth) => {
    // Allow selection of any day, including non-current month days
    if (isCurrentMonth || !isCurrentMonth) {
      let newDate;
      
      if (isCurrentMonth) {
        // Create date in local timezone to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        newDate = new Date(year, month, day, 12, 0, 0, 0);
      } else {
        // Handle non-current month days
        const dayIndex = calendarDays.findIndex(d => d.day === day && !d.isCurrentMonth);
        const firstDay = getFirstDayOfMonth(currentDate);
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        
        if (dayIndex < adjustedFirstDay) {
          // Previous month
          const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
          const prevYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
          newDate = new Date(prevYear, prevMonth, day, 12, 0, 0, 0);
        } else {
          // Next month
          const nextMonth = currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1;
          const nextYear = currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
          newDate = new Date(nextYear, nextMonth, day, 12, 0, 0, 0);
        }
      }
      
      // Always set the selected date to the actual clicked date for visual feedback
      setSelectedDate(newDate);
      
      if (viewMode === 'week') {
        setVisualSelectedDate(newDate); // NEW: track the clicked date for highlight
        setJustSelectedInWeek(true);
        handleWeekSelect(newDate);
        // Also update currentDate to show the month of the selected date for proper highlighting
        setCurrentDate(newDate);
        // Reset the flag after a short delay
        setTimeout(() => setJustSelectedInWeek(false), 100);
      } else {
        // For other views, update current date and send the clicked date
        setCurrentDate(newDate);
        setVisualSelectedDate(null); // Reset for non-week views
        // Format date as YYYY-MM-DD in local timezone
        const yearStr = newDate.getFullYear();
        const monthStr = String(newDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(newDate.getDate()).padStart(2, '0');
        const dateString = `${yearStr}-${monthStr}-${dayStr}`;
        
        setInputValue(formatDateForDisplay(dateString));
        onChange({ target: { value: dateString } });
        setIsOpen(false);
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    
    // Format date as YYYY-MM-DD in local timezone
    const yearStr = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const dayStr = String(today.getDate()).padStart(2, '0');
    const dateString = `${yearStr}-${monthStr}-${dayStr}`;
    
    setInputValue(formatDateForDisplay(dateString));
    onChange({ target: { value: dateString } });
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    setInputValue('');
    onChange({ target: { value: '' } });
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const goToNextMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const formatDate = (date) => {
    if (viewMode === 'month') {
      return date.getFullYear().toString();
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatDisplayValue = (dateValue) => {
    if (viewMode === 'month') {
      if (!dateValue) return '';
      // For month view, show the month range
      // Parse the dateValue to get the correct month and year
      const [year, month, day] = dateValue.split('-').map(Number);
      
      const startOfMonth = new Date(year, month - 1, 1); // month - 1 because JavaScript months are 0-indexed
      const endOfMonth = new Date(year, month, 0); // Last day of the month
      
      // Format dates directly without timezone conversion
      const startYear = startOfMonth.getFullYear();
      const startMonth = String(startOfMonth.getMonth() + 1).padStart(2, '0');
      const startDay = String(startOfMonth.getDate()).padStart(2, '0');
      const startDateStr = `${startYear}-${startMonth}-${startDay}`;
      
      const endYear = endOfMonth.getFullYear();
      const endMonth = String(endOfMonth.getMonth() + 1).padStart(2, '0');
      const endDay = String(endOfMonth.getDate()).padStart(2, '0');
      const endDateStr = `${endYear}-${endMonth}-${endDay}`;
      
      const startStr = formatDateForDisplay(startDateStr);
      const endStr = formatDateForDisplay(endDateStr);
      
      return `${startStr} - ${endStr}`;
    } else if (viewMode === 'week') {
      if (!dateValue) return '';
      // For week view, show the week range
      const date = new Date(dateValue + 'T12:00:00');
      const startOfWeek = new Date(date);
      // Adjust for Monday as first day: Sunday = 0, Monday = 1, etc.
      const dayOfWeek = date.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday becomes 6 days back, Monday becomes 0 days back
      startOfWeek.setDate(date.getDate() - daysToSubtract);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      
      const startStr = formatDateForDisplay(startOfWeek.toISOString().split('T')[0]);
      const endStr = formatDateForDisplay(endOfWeek.toISOString().split('T')[0]);
      return `${startStr} - ${endStr}`;
    }
    return formatDateForDisplay(dateValue);
  };



  const handleMonthSelect = (monthIndex) => {
    const year = currentDate.getFullYear();
    const newDate = new Date(year, monthIndex, 1);
    
    setCurrentDate(newDate);
    setSelectedDate(newDate);
    
    // Format date as YYYY-MM-DD (first day of the month)
    const yearStr = newDate.getFullYear();
    const monthStr = String(newDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(newDate.getDate()).padStart(2, '0');
    const dateString = `${yearStr}-${monthStr}-${dayStr}`;
    
    setInputValue(formatDateForDisplay(dateString));
    onChange({ target: { value: dateString } });
    setIsOpen(false);
  };

  const handleWeekSelect = (selectedDate) => {
    // Calculate the start of the week (Monday) for the selected date
    const date = new Date(selectedDate);
    const startOfWeek = new Date(date);
    // Adjust for Monday as first day: Sunday = 0, Monday = 1, etc.
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday becomes 6 days back, Monday becomes 0 days back
    startOfWeek.setDate(date.getDate() - daysToSubtract);
    
    // Format as YYYY-MM-DD
    const yearStr = startOfWeek.getFullYear();
    const monthStr = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const dayStr = String(startOfWeek.getDate()).padStart(2, '0');
    const dateString = `${yearStr}-${monthStr}-${dayStr}`;
    
    setInputValue(formatDateForDisplay(dateString));
    onChange({ target: { value: dateString } });
    setIsOpen(false);
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    let newValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric
    if (newValue.length > 8) newValue = newValue.slice(0, 8);
    let formatted = newValue;
    if (newValue.length > 4) {
      formatted = `${newValue.slice(0,2)}-${newValue.slice(2,4)}-${newValue.slice(4)}`;
    } else if (newValue.length > 2) {
      formatted = `${newValue.slice(0,2)}-${newValue.slice(2)}`;
    }
    setInputValue(formatted);
    // Only process if the input matches DD-MM-YYYY format
    if (formatted.length === 10 && /^\d{2}-\d{2}-\d{4}$/.test(formatted)) {
      try {
        const apiDate = formatDateForAPI(formatted);
        const date = new Date(apiDate + 'T12:00:00');
        // Validate that the date is valid
        if (!isNaN(date.getTime())) {
          onChange({ target: { value: apiDate } });
        }
      } catch (error) {
        // Invalid date format, ignore
      }
    }
  };

  // Handle input blur to validate and format
  const handleInputBlur = () => {
    if (inputValue && inputValue.length > 0) {
      try {
        // Try to parse the input value
        if (/^\d{2}-\d{2}-\d{4}$/.test(inputValue)) {
          const apiDate = formatDateForAPI(inputValue);
          const date = new Date(apiDate + 'T12:00:00');
          
          if (!isNaN(date.getTime())) {
            // Valid date, update the value
            onChange({ target: { value: apiDate } });
          } else {
            // Invalid date, reset to current value
            setInputValue(formatDateForDisplay(value || ''));
          }
        } else {
          // Invalid format, reset to current value
          setInputValue(formatDateForDisplay(value || ''));
        }
      } catch (error) {
        // Error parsing, reset to current value
        setInputValue(formatDateForDisplay(value || ''));
      }
    } else {
      // Empty input, clear the value
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div ref={pickerRef} className="relative" style={{ position: 'relative', zIndex: 1 }}>
      <div className="flex items-center">
        <input
          type="text"
          value={viewMode === 'day' ? inputValue : formatDisplayValue(value)}
          onChange={viewMode === 'day' ? handleInputChange : undefined}
          onBlur={viewMode === 'day' ? handleInputBlur : undefined}
          placeholder={viewMode === 'month' ? 'Select Month' : viewMode === 'week' ? 'Select Week' : 'DD-MM-YYYY'}
          className={className}
          readOnly={viewMode === 'week' || viewMode === 'month'}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
          style={{ 
            height: '40px', 
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-[280px] date-picker-dropdown" 
          style={{
            top: pickerRef.current ? pickerRef.current.getBoundingClientRect().bottom + 4 : 'auto',
            left: pickerRef.current ? pickerRef.current.getBoundingClientRect().left : 'auto',
            position: 'fixed',
            zIndex: 9999999,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
              title={viewMode === 'month' ? 'Previous Year' : 'Previous Month'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h3 className="font-semibold text-lg">{formatDate(currentDate)}</h3>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
              title={viewMode === 'month' ? 'Next Year' : 'Next Month'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {viewMode === 'month' ? (
            /* Month selection grid */
            <div className="grid grid-cols-3 gap-2 mb-4">
              {months.map((month, index) => {
                const isCurrentMonth = currentDate.getMonth() === index;
                const isSelectedMonth = selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === currentDate.getFullYear();
                return (
                  <button
                    key={index}
                    onClick={() => handleMonthSelect(index)}
                    className={`
                              p-3 text-xs rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 min-h-[40px] flex items-center justify-center
        ${isSelectedMonth ? 'bg-gray-500 text-white hover:bg-gray-600 shadow-md scale-105' : 'text-gray-900 hover:bg-gray-50'}
                      ${isCurrentMonth ? 'font-semibold' : ''}
                    `}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {/* Week days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 mb-4 relative">
                {/* Single gray box for entire week */}
                {viewMode === 'week' && (() => {
                  const highlightedIndices = calendarDays
                    .map((day, index) => day.isHighlighted ? index : -1)
                    .filter(index => index !== -1);
                  
                  if (highlightedIndices.length > 0) {
                    const minIndex = Math.min(...highlightedIndices);
                    const maxIndex = Math.max(...highlightedIndices);
                    const startRow = Math.floor(minIndex / 7);
                    const endRow = Math.floor(maxIndex / 7);
                    
                                         return (
                       <div 
                         className="absolute bg-gray-200 rounded"
                         style={{
                           left: '0',
                           right: '0',
                           top: `${startRow * (100/6)}%`,
                           bottom: `${(5 - endRow) * (100/6)}%`,
                           zIndex: 0
                         }}
                       />
                     );
                  }
                  return null;
                })()}
                
                {calendarDays.map((day, index) => {
                  // For weekly view, use visualSelectedDate for dark gray highlight
                  let isVisuallySelected = false;
                  if (viewMode === 'week' && visualSelectedDate) {
                    const visualDateString = `${visualSelectedDate.getFullYear()}-${String(visualSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(visualSelectedDate.getDate()).padStart(2, '0')}`;
                    const dayDateString = (() => {
                      if (day.isCurrentMonth) {
                        return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
                      } else {
                        // Figure out if this is prev or next month
                        const firstDay = getFirstDayOfMonth(currentDate);
                        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
                        const idx = index;
                        if (idx < adjustedFirstDay) {
                          // prev month
                          const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
                          const prevYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
                          return `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
                        } else {
                          // next month
                          const nextMonth = currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1;
                          const nextYear = currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
                          return `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
                        }
                      }
                    })();
                    isVisuallySelected = visualDateString === dayDateString;
                  } else {
                    isVisuallySelected = day.isSelected;
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day.day, day.isCurrentMonth)}
                      className={`
                        p-2 text-sm rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 relative z-10
                        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isVisuallySelected ? 'bg-gray-500 text-white hover:bg-gray-600 shadow-md scale-105' : ''}
                        ${viewMode === 'week' && day.isHighlighted && !isVisuallySelected ? 'text-gray-800' : ''}
                        ${viewMode !== 'week' && day.isHighlighted && !isVisuallySelected ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 shadow-sm font-medium text-green-800 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200' : ''}
                      `}
                    >
                      {day.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={handleToday}
              className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Today
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomDatePicker; 