import React, { useState } from 'react'

interface SidebarContentProps {
  isDarkMode?: boolean
  onThemeToggle?: (isDarkMode: boolean) => void
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  isDarkMode: externalDarkMode, 
  onThemeToggle 
}) => {
  const [internalDarkMode, setInternalDarkMode] = useState(true)
  
  // Use external dark mode if provided, otherwise use internal state
  const isDarkMode = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode
    if (onThemeToggle) {
      onThemeToggle(newDarkMode)
    } else {
      setInternalDarkMode(newDarkMode)
    }
  }

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-800'
    }`}>
      {/* Logo Section */}
      <div className="text-center mb-4">
        <h1 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          سامانه تحلیل مصرف برق
        </h1>
        <div className={`w-full h-px opacity-50 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
      </div>

      {/* User Info */}
      <div className="text-right mb-4">
        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>منوی اصلی</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {/* Dashboard */}
        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-blue-50 hover:bg-blue-100'
        }`}>
          <svg className="w-3 h-3 transform transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">داشبورد</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
        </div>

        {/* Users */}
        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-700' 
            : 'hover:bg-gray-100'
        }`}>
          <svg className="w-3 h-3 transform transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">کاربران</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        </div>

        {/* Products */}
        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-700' 
            : 'hover:bg-gray-100'
        }`}>
          <svg className="w-3 h-3 transform transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">محصولات</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 18v-6h2v6H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Analytics */}
        <div className={`flex items-center justify-end p-3 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-700' 
            : 'hover:bg-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">آنالیزداده</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className={`border-t pt-4 mt-4 ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 text-right">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              محمد رحمانی
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              کاربر شماره ۳۰۰۱۲۸۱۳۰
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors mb-2 ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <div className={`w-8 h-5 rounded-full p-1 transition-colors ${
            isDarkMode ? 'bg-gray-600' : 'bg-blue-500'
          }`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
              isDarkMode ? 'transform translate-x-0' : 'transform translate-x-3'
            }`}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">تم روشن</span>
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414 0zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </div>
        </button>

        {/* Settings */}
        <button className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-700 text-gray-300' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}>
          <span className="text-sm">تنظیمات</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Logout */}
        <button className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-red-900 text-red-400' 
            : 'hover:bg-red-50 text-red-600'
        }`}>
          <span className="text-sm">خروج از سامانه</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export { SidebarContent }
export default SidebarContent