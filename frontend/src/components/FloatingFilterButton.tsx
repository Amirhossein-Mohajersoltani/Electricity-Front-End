import React from 'react';
import { Button } from './ui/button';
import { Filter } from 'lucide-react';

interface FloatingFilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
  disabled?: boolean;
}

const FloatingFilterButton: React.FC<FloatingFilterButtonProps> = ({
  onClick,
  activeFiltersCount = 0,
  disabled = false
}) => {
  return (
    <div className="fixed bottom-6 left-6 z-40">
      <Button
        onClick={onClick}
        disabled={disabled}
        className="h-14 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 relative"
        size="lg"
      >
        <div className="flex flex-col items-center justify-center">
          <Filter className="h-5 w-5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {activeFiltersCount > 0 
          ? `${activeFiltersCount} فیلتر فعال - کلیک برای ویرایش`
          : 'اعمال فیلترهای پیشرفته'
        }
      </div>
    </div>
  );
};

export default FloatingFilterButton; 