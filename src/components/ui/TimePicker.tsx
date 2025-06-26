'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

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
    <div className={className}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};