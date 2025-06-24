'use client';

import React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  options, 
  disabled = false,
  className = '' 
}) => {
  return (
    <div className={`time-picker ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="time-picker-select touch-optimized"
        style={{
          background: 'var(--input)',
          border: '2px solid var(--border)',
          color: 'var(--foreground)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          minWidth: '120px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(220, 68, 5, 0.1)';
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            style={{
              background: 'var(--surface)',
              color: 'var(--foreground)'
            }}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};