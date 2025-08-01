// src/App.tsx
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import router from './router'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-white rtl" dir="rtl">
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            direction: 'rtl',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
    </div>
  )
}

export default App
