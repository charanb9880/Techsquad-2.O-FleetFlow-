import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import TopNav from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Drivers from './pages/Drivers';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LiveMap from './pages/LiveMap';

function DashboardLayout() {
  return (
    <div className="app-layout">
      <TopNav />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
