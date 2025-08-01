// src/components/layout/Header.tsx
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  children?: ReactNode
}

const TariffIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.6667 11.9997C17.6667 11.3183 17.9393 10.7006 18.3813 10.2497H11.6667C10.7002 10.2497 9.91675 9.4662 9.91675 8.4997V0.50293C4.7856 0.63548 0.666748 4.83659 0.666748 9.9997C0.666748 15.0787 4.65247 19.2268 9.66675 19.4868V17.9997C9.66675 16.619 10.786 15.4997 12.1667 15.4997C12.7295 15.4997 13.2489 15.6857 13.6667 15.9995V14.9997C13.6667 13.619 14.786 12.4997 16.1667 12.4997C16.7295 12.4997 17.2489 12.6857 17.6667 12.9995V11.9997ZM11.4167 0.58121V8.4997C11.4167 8.6378 11.5286 8.7497 11.6667 8.7497H19.5852C19.027 4.5028 15.6636 1.1394 11.4167 0.58121ZM20.1667 10.5C19.3383 10.5 18.6667 11.1716 18.6667 12V20C18.6667 20.8284 19.3383 21.5 20.1667 21.5C20.9951 21.5 21.6667 20.8284 21.6667 20V12C21.6667 11.1716 20.9951 10.5 20.1667 10.5ZM12.1667 16.5C11.3383 16.5 10.6667 17.1716 10.6667 18V20C10.6667 20.8284 11.3383 21.5 12.1667 21.5C12.9951 21.5 13.6667 20.8284 13.6667 20V18C13.6667 17.1716 12.9951 16.5 12.1667 16.5ZM14.6667 15C14.6667 14.1716 15.3383 13.5 16.1667 13.5C16.9951 13.5 17.6667 14.1716 17.6667 15V20C17.6667 20.8284 16.9951 21.5 16.1667 21.5C15.3383 21.5 14.6667 20.8284 14.6667 20V15Z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
)

const EnergyIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.0918 3.33052C8.2692 2.83254 8.74067 2.5 9.26931 2.5H15.7229C16.5761 2.5 17.1785 3.33587 16.9087 4.14528L15.4572 8.5H19.4159C20.5201 8.5 21.082 9.82682 20.3137 10.6198L9.25275 22.036C8.19901 23.1236 6.3808 22.1422 6.7117 20.6645L7.98093 14.9964L6.41248 14.9904C5.20573 14.9858 4.3657 13.7899 4.77067 12.6532L8.0918 3.33052Z" fill="currentColor"/>
  </svg>
)

const FeederIcon = () => (
  <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.34484 1.66667H16.4998C16.7208 1.66667 16.9328 1.75446 17.0891 1.91074C17.2454 2.06702 17.3332 2.27899 17.3332 2.5V14.1667C17.3332 14.3877 17.2454 14.5996 17.0891 14.7559C16.9328 14.9122 16.7208 15 16.4998 15H1.49984C1.27882 15 1.06686 14.9122 0.910582 14.7559C0.754301 14.5996 0.666504 14.3877 0.666504 14.1667V0.833333C0.666504 0.61232 0.754301 0.400358 0.910582 0.244078C1.06686 0.0877973 1.27882 0 1.49984 0H7.67817L9.34484 1.66667ZM8.1665 5V11.6667H9.83317V5H8.1665ZM11.4998 7.5V11.6667H13.1665V7.5H11.4998ZM4.83317 9.16667V11.6667H6.49984V9.16667H4.83317Z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
)

const DashboardIcon = () => (
  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.333252 8.33333H6.99992V0H0.333252V8.33333ZM0.333252 15H6.99992V10H0.333252V15ZM8.66658 15H15.3333V6.66667H8.66658V15ZM8.66658 0V5H15.3333V0H8.66658Z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
)

export default function Header({ children }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { userEmail, logout } = useAuth()
  
  const navItems = [
    { path: '/tariff', label: 'سهم تعرفه‌ها', icon: <TariffIcon /> },
    { path: '/comparison', label: 'مقایسه انرژی', icon: <EnergyIcon /> },
    { path: '/feeder', label: 'تحلیل فیدر', icon: <FeederIcon /> },
    { path: '/dashboard', label: 'داشبورد', icon: <DashboardIcon /> }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
          <nav className="flex justify-between items-center">
            {/* User Info and Logout */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <span className="text-sm text-gray-600">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                خروج
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-8 rtl:space-x-reverse">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-lg flex items-center">
                    {typeof item.icon === 'string' ? item.icon : item.icon}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {children}
      </div>
    </div>
  )
}
