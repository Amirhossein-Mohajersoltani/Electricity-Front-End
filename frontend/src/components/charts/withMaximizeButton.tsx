import React from 'react';
import { Maximize2 } from 'lucide-react';

interface WithMaximizeButtonProps {
  onMaximize?: () => void;
}

export function withMaximizeButton<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithMaximizeButtonComponent(props: T & WithMaximizeButtonProps) {
    const { onMaximize, ...restProps } = props;
    
    return (
      <div className="relative group">
        {onMaximize && (
          <button
            onClick={onMaximize}
            className="absolute top-2 right-2 z-10 p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 border border-gray-200"
            title="بزرگنمایی چارت"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        )}
        <WrappedComponent {...(restProps as T)} />
      </div>
    );
  };
} 