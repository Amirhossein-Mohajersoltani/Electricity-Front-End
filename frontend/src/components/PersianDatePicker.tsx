import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface PersianDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1403);
  const [selectedMonth, setSelectedMonth] = useState(7); // آبان
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateClick = (day: number) => {
    const persianDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    console.log('📅 PersianDatePicker: Date selected:', persianDate);
    onChange(persianDate);
    setShowCalendar(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = monthDays[selectedMonth - 1];
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = value === `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      
      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`w-8 h-8 text-sm rounded flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-blue-100 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleMonthChange('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
            <div key={day} className="w-8 h-8 text-xs font-bold flex items-center justify-center text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Today Button */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              const persianToday = `1403-08-24`; // مثال برای امروز
              onChange(persianToday);
              setShowCalendar(false);
            }}
            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            امروز
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right bg-gray-50 cursor-pointer"
        placeholder={placeholder}
        readOnly
      />
      <Calendar 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" 
        onClick={() => setShowCalendar(!showCalendar)}
      />
      {showCalendar && renderCalendar()}
    </div>
  );
};

export default PersianDatePicker; 