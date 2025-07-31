import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید...",
  disabled = false,
  className = "",
  required = false
}) => {
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

  const handleToggleOption = (option: string) => {
    console.log('🔄 MultiSelect: Toggling option:', option);
    console.log('🔄 Current value:', value);
    
    if (value.includes(option)) {
      const newValue = value.filter(v => v !== option);
      console.log('🔄 MultiSelect: Removing option, new value:', newValue);
      onChange(newValue);
    } else {
      const newValue = [...value, option];
      console.log('🔄 MultiSelect: Adding option, new value:', newValue);
      onChange(newValue);
    }
  };

  const handleRemoveOption = (option: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter(v => v !== option));
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder;
    }
    if (value.length === 1) {
      return value[0];
    }
    return `${value.length} مورد انتخاب شده`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          text-right appearance-none bg-gray-50 text-sm lg:text-base transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
          ${required && value.length === 0 ? 'border-red-300' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={value.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {getDisplayText()}
          </span>
          <ChevronDown 
            className={`w-4 h-4 lg:w-5 lg:h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Selected Items Display */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {item}
              <button
                onClick={(e) => handleRemoveOption(item, e)}
                className="hover:bg-blue-200 rounded-full p-0.5"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Select All Option */}
          {options.length > 1 && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center justify-between border-b border-gray-100"
              >
                <span className="text-sm font-medium text-blue-600">
                  {value.length === options.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                </span>
                {value.length === options.length && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </>
          )}

          {/* Options */}
          {options.map((option) => {
            const isSelected = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleToggleOption(option)}
                className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center justify-between"
              >
                <span className={`text-sm ${isSelected ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                  {option}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            );
          })}

          {/* No options */}
          {options.length === 0 && (
            <div className="px-4 py-2 text-center text-gray-500 text-sm">
              گزینه‌ای موجود نیست
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect; 