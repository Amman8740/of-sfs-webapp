"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@/components/ui/icons';
import { CalendarEventContextMenu } from './calendar-event-context-menu';
import { CreatorDetailsModal } from './creator-details-modal';
import { MediaDetailsModal } from './media-details-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface ScheduledSFS {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  partner_creator: string;
  status?: string;
  model: {
    name: string;
    username: string;
  };
  promo_links?: {
    promo_name: string;
    url: string;
  };
}

interface CalendarViewProps {
  events?: CalendarEvent[];
}

export const CalendarView: React.FC<CalendarViewProps> = () => {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const currentDay = today.toISOString().split('T')[0];
    return { month, year, currentDay, weekOffset: 0 };
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'Week' | 'Month' | 'Year'>('Week');

  const timeSlots = [
    '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'
  ];

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1 + (currentWeek.weekOffset * 7)); // Get Monday of current week with offset

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const fetchScheduledSFS = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scheduled-sfs');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const calendarEvents: CalendarEvent[] = result.data.map((sfs: ScheduledSFS) => {
            // Convert scheduled_time to display format
            const timeStr = sfs.scheduled_time || '12:00';
            const [hours, minutes] = timeStr.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
            const startTime = `${displayHour} ${period}`;
            
            // Calculate end time (assume 30 minutes duration)
            const endHour = hours;
            const endMinute = (minutes + 30) % 60;
            const endHourAdjusted = endMinute < minutes ? endHour + 1 : endHour;
            const endPeriod = endHourAdjusted >= 12 ? 'PM' : 'AM';
            const endDisplayHour = endHourAdjusted > 12 ? endHourAdjusted - 12 : endHourAdjusted === 0 ? 12 : endHourAdjusted;
            const endTime = endMinute === 0 ? `${endDisplayHour} ${endPeriod}` : `${endDisplayHour}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;

            // Assign color based on status
            let eventColor = 'light-blue';
            if (sfs.status) {
              const status = sfs.status.toLowerCase();
              if (status === 'approved' || status === 'done') {
                eventColor = 'light-green';
              } else if (status === 'rejected' || status === 'cancelled' || status === 'flagged') {
                eventColor = 'light-red';
              } else if (status === 'pending') {
                eventColor = 'light-gray';
              }
            }

            return {
              id: sfs.id,
              title: `SFS with ${sfs.partner_creator || sfs.model?.username || 'Unknown'}`,
              date: sfs.scheduled_date,
              startTime,
              endTime,
              color: eventColor
            };
          });
          setEvents(calendarEvents);
        }
      } else {
        console.error('Failed to fetch scheduled SFS');
      }
    } catch (error) {
      console.error('Error fetching scheduled SFS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledSFS();
  }, []);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    eventData?: any;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentEventData, setCurrentEventData] = useState<any>(null);

  const handlePrevious = () => {
    if (viewType === 'Week') {
      setCurrentWeek(prev => {
        const newOffset = prev.weekOffset - 1;
        const monday = new Date();
        monday.setDate(monday.getDate() - monday.getDay() + 1 + (newOffset * 7));
        const month = monday.toLocaleString('default', { month: 'long' });
        const year = monday.getFullYear();
        return { ...prev, weekOffset: newOffset, month, year };
      });
    } else if (viewType === 'Month') {
      // Handle previous month
      setCurrentWeek(prev => {
        const currentDate = new Date(prev.year, new Date(`${prev.month} 1`).getMonth() - 1, 1);
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        return { ...prev, month, year };
      });
    } else if (viewType === 'Year') {
      // Handle previous year
      setCurrentWeek(prev => ({ ...prev, year: prev.year - 1 }));
    }
  };

  const handleNext = () => {
    if (viewType === 'Week') {
      setCurrentWeek(prev => {
        const newOffset = prev.weekOffset + 1;
        const monday = new Date();
        monday.setDate(monday.getDate() - monday.getDay() + 1 + (newOffset * 7));
        const month = monday.toLocaleString('default', { month: 'long' });
        const year = monday.getFullYear();
        return { ...prev, weekOffset: newOffset, month, year };
      });
    } else if (viewType === 'Month') {
      // Handle next month
      setCurrentWeek(prev => {
        const currentDate = new Date(prev.year, new Date(`${prev.month} 1`).getMonth() + 1, 1);
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        return { ...prev, month, year };
      });
    } else if (viewType === 'Year') {
      // Handle next year
      setCurrentWeek(prev => ({ ...prev, year: prev.year + 1 }));
    }
  };

  const handleEventClick = (event: React.MouseEvent, eventData: CalendarEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const eventDataForMenu = {
      id: eventData.id,
      title: eventData.title,
      time: `${eventData.startTime} - ${eventData.endTime}`,
      creator: '@user123', // Mock data
      mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face',
    };
    
    setCurrentEventData(eventDataForMenu);
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      eventData: eventDataForMenu,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      eventData: undefined,
    });
  };

  const handleCreatorDetails = () => {
    setShowCreatorModal(true);
  };

  const handleMediaDetails = () => {
    setShowMediaModal(true);
  };

  const getEventColor = (color: string) => {
    switch (color) {
      case 'light-green':
        return 'bg-green-50 text-green-700 border-l-4 border-green-300';
      case 'light-blue':
        return 'bg-blue-50 text-blue-700 border-l-4 border-blue-300';
      case 'light-gray':
        return 'bg-gray-50 text-gray-700 border-l-4 border-gray-300';
      case 'light-red':
        return 'bg-red-50 text-red-700 border-l-4 border-red-300';
      default:
        return 'bg-gray-50 text-gray-700 border-l-4 border-gray-300';
    }
  };

  const getTimeSlotPosition = (time: string) => {
    const timeMap: { [key: string]: number } = {
      '6 AM': 0, '7 AM': 1, '8 AM': 2, '9 AM': 3, '10 AM': 4, '11 AM': 5, '12 PM': 6,
      '1 PM': 7, '2 PM': 8, '3 PM': 9, '4 PM': 10, '5 PM': 11, '6 PM': 12, '7 PM': 13, '8 PM': 14, '9 PM': 15, '10 PM': 16
    };
    return timeMap[time] || 0;
  };

  // Get all days in the current month
  const getMonthDates = () => {
    const monthIndex = new Date(`${currentWeek.month} 1, ${currentWeek.year}`).getMonth();
    const year = currentWeek.year;
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Get all months in the current year
  const getYearMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentWeek.year, i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      months.push({ name: monthName, index: i, date: monthDate });
    }
    return months;
  };

  // Get event count for a specific month
  const getMonthEventCount = (monthIndex: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === currentWeek.year;
    }).length;
  };

  const getDayOfWeek = (date: string) => {
    const dateObj = new Date(date);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[dateObj.getDay()];
  };

  const isCurrentDay = (date: string) => {
    return date === currentWeek.currentDay;
  };

  const getEventsForDay = (date: string) => {
    return events.filter(event => event.date === date);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-900">
            {viewType === 'Year' ? currentWeek.year : `${currentWeek.month} ${currentWeek.year}`}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center px-3 py-1 space-x-2 bg-white border rounded-md border-app-blue hover:bg-gray-50">
                <span className="text-sm font-medium text-app-blue">{viewType}</span>
                <ChevronDownIcon className="w-4 h-4 text-app-blue" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem 
                onClick={() => setViewType('Week')}
                className={`hover:bg-blue-50 ${viewType === 'Week' ? 'bg-blue-100 text-blue-700' : ''}`}
              >
                Week
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setViewType('Month')}
                className={`hover:bg-blue-50 ${viewType === 'Month' ? 'bg-blue-100 text-blue-700' : ''}`}
              >
                Month
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setViewType('Year')}
                className={`hover:bg-blue-50 ${viewType === 'Year' ? 'bg-blue-100 text-blue-700' : ''}`}
              >
                Year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-6 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-sm font-semibold text-gray-700">Status Legend:</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 border-2 border-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border-2 border-gray-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 border-2 border-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300 border-2 border-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden bg-white border border-gray-200 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading calendar...</div>
          </div>
        ) : viewType === 'Week' ? (
          <div className="h-full overflow-auto">
          {/* Calendar Grid */}
          <div className="grid grid-cols-8 min-w-[1000px]">
          {/* Time Column */}
          <div className="bg-white border-r border-gray-200">
            {/* Time Zone Header */}
            <div className="flex items-center h-16 px-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">EST GMT-5</span>
            </div>
            {timeSlots.map((time, index) => (
              <div key={time} className="relative flex items-center h-16 px-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">{time}</span>
                {/* Half-hour lines */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100"></div>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDates.map((date) => (
            <div key={date} className="border-r border-gray-200 last:border-r-0">
              {/* Day Header */}
              <div className={`h-16 border-b border-gray-200 flex items-center justify-center ${
                isCurrentDay(date) ? 'bg-blue-100' : 'bg-white'
              }`}>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500">{getDayOfWeek(date)}</div>
                  <div className={`text-sm font-medium ${
                    isCurrentDay(date) ? 'text-app-blue' : 'text-gray-900'
                  }`}>
                    {date.split('-')[2]}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {timeSlots.map((time, timeIndex) => {
                const dayEvents = getEventsForDay(date);
                const eventAtTime = dayEvents.find(event => {
                  // Compare the start time with the slot time
                  return event.startTime === time;
                });
                
                return (
                  <div key={`${date}-${time}`} className="relative h-16 border-b border-gray-200">
                    {/* Half-hour lines */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100"></div>
                    {eventAtTime && (
                      <div 
                        className={`absolute inset-1 rounded-l-md px-3 py-2 text-xs font-medium ${getEventColor(eventAtTime.color)} flex flex-col justify-center min-w-0 cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={(e) => handleEventClick(e, eventAtTime)}
                      >
                        <div className="font-semibold leading-tight break-words">{eventAtTime.title}</div>
                        <div className="text-xs leading-tight break-words opacity-90">{eventAtTime.startTime} - {eventAtTime.endTime}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          </div>
        </div>
        ) : viewType === 'Month' ? (
          <div className="h-full overflow-auto">
            <div className="grid min-w-full grid-cols-7">
              {/* Day Headers */}
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="p-3 font-semibold text-center text-gray-700 border-b border-r border-gray-200 bg-gray-50">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {getMonthDates().map((date) => {
                const dayEvents = getEventsForDay(date);
                const dateObj = new Date(date);
                const isCurrentMonth = dateObj.getMonth() === new Date(`${currentWeek.month} 1, ${currentWeek.year}`).getMonth();
                
                return (
                  <div 
                    key={date} 
                    className={`border-r border-b border-gray-200 p-2 min-h-24 ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${date === currentWeek.currentDay ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-semibold mb-2 ${
                      date === currentWeek.currentDay ? 'text-app-blue' : isCurrentMonth ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {dateObj.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <button
                          key={event.id}
                          onClick={(e) => handleEventClick(e, event)}
                          className={`w-full text-xs px-2 py-1 rounded text-left truncate ${getEventColor(event.color)} hover:opacity-80 transition-opacity`}
                          title={event.title}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="px-2 text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full p-6 overflow-auto">
            <div className="grid grid-cols-3 gap-6">
              {getYearMonths().map((monthData) => {
                const eventCount = getMonthEventCount(monthData.index);
                const monthFirstDay = new Date(currentWeek.year, monthData.index, 1);
                const monthLastDay = new Date(currentWeek.year, monthData.index + 1, 0);
                const startDate = new Date(monthFirstDay);
                startDate.setDate(startDate.getDate() - monthFirstDay.getDay());
                
                const monthDates = [];
                let currentDate = new Date(startDate);
                while (currentDate <= monthLastDay || currentDate.getDay() !== 0) {
                  monthDates.push(currentDate.toISOString().split('T')[0]);
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                return (
                  <div key={monthData.index} className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                    {/* Month Header */}
                    <div className="p-4 text-white bg-app-blue">
                      <h3 className="text-lg font-semibold">{monthData.name} {currentWeek.year}</h3>
                      <p className="text-sm opacity-90">{eventCount} event{eventCount !== 1 ? 's' : ''}</p>
                    </div>
                    
                    {/* Mini Calendar */}
                    <div className="p-3">
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {/* Day headers */}
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                          <div key={day} className="py-1 text-xs font-semibold text-gray-600">
                            {day}
                          </div>
                        ))}
                        
                        {/* Days */}
                        {monthDates.map(date => {
                          const dateObj = new Date(date);
                          const isCurrentMonth = dateObj.getMonth() === monthData.index;
                          const dayEvents = getEventsForDay(date);
                          
                          return (
                            <button
                              key={date}
                              onClick={() => {
                                if (isCurrentMonth && dayEvents.length > 0) {
                                  handleEventClick({} as React.MouseEvent, dayEvents[0]);
                                }
                              }}
                              className={`text-xs py-2 rounded relative ${
                                isCurrentMonth 
                                  ? 'bg-gray-50 text-gray-900 hover:bg-gray-100' 
                                  : 'text-gray-400'
                              } ${date === currentWeek.currentDay ? 'ring-2 ring-app-blue' : ''}`}
                            >
                              {dateObj.getDate()}
                              {dayEvents.length > 0 && isCurrentMonth && (
                                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-app-blue rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <CalendarEventContextMenu
        key={contextMenu.eventData?.id || 'closed'}
        isOpen={contextMenu.isOpen}
        onClose={handleContextMenuClose}
        position={contextMenu.position}
        eventData={contextMenu.eventData}
        onCreatorDetails={handleCreatorDetails}
        onMediaDetails={handleMediaDetails}
      />

      {/* Creator Details Modal */}
      <CreatorDetailsModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        details={currentEventData ? {
          model: currentEventData.creator.replace('@', ''),
          promoName: 'July free trial blast',
          fans: 123456,
          matchCompatibility: 'Average' as const,
          rules: {
            maxSfsPerDay: 3,
            contentAllowed: ['Fully Explicit', 'Topless', 'SFW Only'] as Array<'Fully Explicit' | 'Topless' | 'SFW Only'>,
            pinContent: 'Accept All',
          },
        } : null}
      />

      {/* Media Details Modal */}
      <MediaDetailsModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        details={currentEventData ? {
          date: currentEventData.time,
          imageUrl: currentEventData.mediaUrl,
          category: ['Travel', 'Lifestyle'],
          hashtags: ['#travel', '#clouds'],
          caption: 'This is a test caption',
          notes: 'This is a test video',
        } : null}
      />
    </div>
  );
};
