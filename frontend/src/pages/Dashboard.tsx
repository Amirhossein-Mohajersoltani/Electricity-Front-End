// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { useAuth } from '../context/AuthContext'

// Import separate dashboard components
import PublicDashboard from './PublicDashboard'
import PrivateDashboard from './PrivateDashboard'

const Dashboard = () => {
  const { companyType, loading, userEmail, isAuthenticated } = useAuth()

  console.log('[DASHBOARD] Dashboard render state:', {
    companyType,
    loading,
    userEmail,
    isAuthenticated
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">در حال بارگذاری داشبورد...</p>
        </div>
      </div>
    )
  }

  // Render appropriate dashboard based on company type
  if (companyType === 'private') {
    console.log('[DASHBOARD] Rendering PrivateDashboard');
    return <PrivateDashboard />
  } else {
    console.log('[DASHBOARD] Rendering PublicDashboard');
    return <PublicDashboard />
  }
}

export default Dashboard
