import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from './button';

interface ShamsiCalendarProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

interface DateInfo {
  year: number;
  month: number;
  day: number;
}

const ShamsiCalendar: React.FC<ShamsiCalendarProps> = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<DateInfo>(() => {
    if (value) {
      const parts = value.split('/');
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      };
    }
    const now = new Date();
    return {
      year: now.getFullYear() - 621, // Approximate conversion
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  });

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  const getDaysInMonth = (year: number, month: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return isLeapYear(year) ? 30 : 29;
  };

  const isLeapYear = (year: number): boolean => {
    const cycle = year % 128;
    return [1, 5, 9, 13, 17, 22, 26, 30, 34, 38, 43, 47, 51, 55, 59, 64, 68, 72, 76, 80, 85, 89, 93, 97, 101, 106, 110, 114, 118, 122].includes(cycle);
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    // Simplified calculation - in production, use a proper Persian calendar library
    return ((year * 365 + Math.floor(year / 4) + getDaysInMonth(year, month)) % 7);
  };

  const formatDate = (year: number, month: number, day: number): string => {
    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
  };

  const handleDateSelect = (day: number) => {
    const formattedDate = formatDate(currentDate.year, currentDate.month, day);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const nextMonth = () => {
    if (currentDate.month === 12) {
      setCurrentDate({ ...currentDate, year: currentDate.year + 1, month: 1 });
    } else {
      setCurrentDate({ ...currentDate, month: currentDate.month + 1 });
    }
  };

  const prevMonth = () => {
    if (currentDate.month === 1) {
      setCurrentDate({ ...currentDate, year: currentDate.year - 1, month: 12 });
    } else {
      setCurrentDate({ ...currentDate, month: currentDate.month - 1 });
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate.year, currentDate.month);
    const firstDay = getFirstDayOfMonth(currentDate.year, currentDate.month);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value === formatDate(currentDate.year, currentDate.month, day);
      const isToday = day === new Date().getDate() && 
                     currentDate.month === new Date().getMonth() + 1 && 
                     currentDate.year === new Date().getFullYear() - 621;

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`h-8 w-8 text-sm rounded-lg hover:bg-blue-50 transition-colors ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isToday 
                ? 'bg-blue-100 text-blue-600 font-medium'
                : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {day.toLocaleString('fa-IR')}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`} dir="rtl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={nextMonth}
              className="p-1 h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {persianMonths[currentDate.month - 1]} {currentDate.year.toLocaleString('fa-IR')}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={prevMonth}
              className="p-1 h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {persianDays.map((day) => (
              <div key={day} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Quick selections */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  const today = new Date();
                  const shamsiToday = formatDate(
                    today.getFullYear() - 621,
                    today.getMonth() + 1,
                    today.getDate()
                  );
                  onChange(shamsiToday);
                  setIsOpen(false);
                }}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                امروز
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close calendar when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export { ShamsiCalendar }; 