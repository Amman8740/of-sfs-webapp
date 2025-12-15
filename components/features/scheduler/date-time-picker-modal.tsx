"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
  initialDate?: string;
  initialTime?: string;
  disabledDates?: string[];
}

interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { value: '09:30', label: '9:30 AM', available: true },
  { value: '10:00', label: '10:00 AM', available: true },
  { value: '10:30', label: '10:30 AM', available: true },
  { value: '11:00', label: '11:00 AM', available: true },
  { value: '11:30', label: '11:30 AM', available: true },
  { value: '12:00', label: '12:00 PM', available: true },
  { value: '12:30', label: '12:30 PM', available: true },
  { value: '13:00', label: '1:00 PM', available: true },
];

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialDate = new Date().toISOString().split('T')[0],
  initialTime =new Date().toTimeString().slice(0, 5),
  disabledDates = []
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [year, month, day] = (initialDate || new Date().toISOString().split('T')[0]).split('-');
    return new Date(parseInt(year), parseInt(month) - 1);
  });

  const formatDate = (date: string) => {
    // Parse date string in local timezone, not UTC
    const [year, month, day] = date.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleDone = () => {
    const formattedDate = formatDate(selectedDate);
    const formattedTime = formatTime(selectedTime);
    onSelect(formattedDate, formattedTime);
    onClose();
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      // Create date string in local time to avoid timezone issues
      const yearStr = currentDate.getFullYear();
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;
      
      const isSelected = dateString === selectedDate;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isDisabled = disabledDates.includes(currentDate.toDateString());
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isSelected,
        isToday,
        isDisabled,
        dateString
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-4">
        <div className="flex gap-3">
          {/* Calendar Section */}
          <div className="w-56">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousMonth}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-lg font-medium text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="py-1 text-xs font-medium text-center text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => !day.isDisabled && handleDateSelect(day.dateString)}
                  disabled={day.isDisabled}
                  className={`
                    w-7 h-7 text-xs rounded-md flex items-center justify-center
                    ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                    ${day.isSelected ? 'bg-blue-500 text-white' : ''}
                    ${day.isToday && !day.isSelected && !day.isDisabled ? 'bg-blue-100 text-blue-700' : ''}
                    ${day.isDisabled ? 'text-gray-300 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-100'}
                    ${!day.isCurrentMonth ? 'hover:bg-transparent' : ''}
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="w-36">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Available slots</h3>
            <div className="space-y-1 overflow-y-auto max-h-48">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => handleTimeSelect(slot.value)}
                  disabled={!slot.available}
                  className={`
                    w-full text-left px-2 py-1.5 text-xs rounded-md
                    ${selectedTime === slot.value 
                      ? 'bg-blue-500 text-white' 
                      : slot.available 
                        ? 'text-gray-900 hover:bg-gray-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="pt-3 mt-4 border-t border-gray-200">
          <Button
            type="button"
            color="gray"
            size="small"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            color="primary"
            size="small"
            variant="solid"
            onClick={handleDone}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
