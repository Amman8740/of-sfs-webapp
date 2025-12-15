"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/helpers';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option labels
  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleOption(optionValue);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <div
        className={cn(
          "min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex flex-wrap items-center gap-1",
          "focus:outline-none focus:ring-2 focus:border-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 border-blue-500"
        )}
        style={{
          outlineColor: '#0091FF'
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedLabels.length > 0 ? (
          <>
            {selectedLabels.slice(0, 2).map((label, index) => {
              const optionValue = options.find(opt => opt.label === label)?.value;
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {label}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={(e) => handleRemoveTag(optionValue!, e)}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {selectedLabels.length > 2 && (
              <span className="text-sm text-gray-500">
                +{selectedLabels.length - 2} more
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}

        <div className="ml-auto">
          <svg
            className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center",
                      isSelected && "bg-blue-50"
                    )}
                    onClick={() => handleToggleOption(option.value)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by onClick
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No creators found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};