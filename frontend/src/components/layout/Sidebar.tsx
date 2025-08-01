import React, { useState, cloneElement } from 'react'

interface SidebarProps {
  children: React.ReactElement<any>
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleThemeToggle = (newDarkMode: boolean) => {
    setIsDarkMode(newDarkMode)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static
          top-0 right-0
          h-screen
          shadow-2xl lg:shadow-xl
          rounded-3xl
          transition-all duration-300 ease-in-out
          z-50 lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          w-[322px]
          max-h-screen
          flex flex-col
          justify-between
          overflow-hidden
          ${isDarkMode 
            ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black' 
            : 'bg-gradient-to-b from-gray-50 via-white to-gray-100'
          }
        `}
        style={{
          width: '322px',
          borderRadius: '24px',
          padding: '32px 24px',
          height: '100vh',
          maxHeight: '100vh'
        }}
      >
        {cloneElement(children, {
          isDarkMode,
          onThemeToggle: handleThemeToggle
        })}
      </div>
    </>
  )
}

export default Sidebar