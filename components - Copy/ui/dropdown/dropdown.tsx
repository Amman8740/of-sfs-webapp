'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/helpers';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
  required = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const selectedLabels = value.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 text-left border border-gray-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:border-transparent",
          "bg-white transition-colors text-gray-900",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={isOpen ? { 
          borderColor: '#0091FF', 
          boxShadow: '0 0 0 2px rgba(0, 145, 255, 0.2)' 
        } : {}}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "block truncate",
            selectedLabels.length === 0 ? "text-gray-500" : "text-gray-900"
          )}>
            {selectedLabels.length === 0 
              ? placeholder 
              : selectedLabels.length === 1 
                ? selectedLabels[0]
                : `${selectedLabels.length} selected`
            }
          </span>
          <svg
            className={cn(
              "w-5 h-5 text-gray-500 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 px-3 py-2 cursor-pointer transition-colors"
              style={{
                backgroundColor: value.includes(option.value) ? '#F5FAFF' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!value.includes(option.value)) {
                  e.currentTarget.style.backgroundColor = '#F5FAFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!value.includes(option.value)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleOptionClick(option.value)}
                className="w-4 h-4 border-2 border-gray-300 rounded focus:outline-none focus:ring-0"
                style={value.includes(option.value) ? { 
                  accentColor: '#0091FF' 
                } : {}}
              />
              <span className="text-gray-900 text-sm">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
