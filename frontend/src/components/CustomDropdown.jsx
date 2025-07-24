import React, { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ value, onChange, options, placeholder = 'Select...', disabled = false, className = '', showFilterIcon = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  // Use a fixed width for data filter dropdowns, but allow w-full for settings
  const isFullWidth = className.includes('w-full');
  const fixedWidth = 180;
  const dropdownWidth = isFullWidth ? '100%' : `${fixedWidth}px`;
  const baseClass = `h-12 px-3 flex items-center border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div ref={dropdownRef} className={`relative ${className}`} tabIndex={-1} style={{ width: dropdownWidth }}>
      <button
        type="button"
        className={baseClass}
        style={{ width: dropdownWidth }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
          if (e.key === 'Escape') setIsOpen(false);
        }}
      >
        {showFilterIcon && (
          <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
          </svg>
        )}
        <span className={selectedOption ? '' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto" role="listbox" style={{ width: dropdownWidth }}>
          {options.map(opt => (
            <li
              key={opt.value}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${value === opt.value ? 'bg-gray-200 font-semibold' : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              role="option"
              aria-selected={value === opt.value}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { onChange(opt.value); setIsOpen(false); }
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 