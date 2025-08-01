// src/router.tsx
import { createBrowserRouter } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import FeederAnalysis from "./pages/FeederAnalysis"
import TariffShare from "./pages/TariffShare"
import EnergyComparison from "./pages/EnergyComparison"
import ConsumptionLimitation from "./pages/ConsumptionLimitation"
import CsvUpload from "./pages/CsvUpload"
import UserManagement from "./pages/UserManagement"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import ProtectedRoute from "./components/auth/ProtectedRoute"

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "feeder-analysis",
        element: <FeederAnalysis />,
      },
      {
        path: "energy-comparison",
        element: <EnergyComparison />,
      },
      {
        path: "tariff-share",
        element: <TariffShare />,
      },
      {
        path: "consumption-limitation",
        element: <ConsumptionLimitation />,
      },
      {
        path: "csv-upload",
        element: <CsvUpload />,
      },
      {
        path: "user-management",
        element: <UserManagement />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
])

export default router
