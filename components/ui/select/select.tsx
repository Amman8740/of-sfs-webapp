import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  className,
  ...props
}) => {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-900",
        className
      )}
      style={{
        outlineColor: '#0091FF'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#0091FF';
        e.target.style.boxShadow = '0 0 0 2px rgba(0, 145, 255, 0.2)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#d1d5db';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
