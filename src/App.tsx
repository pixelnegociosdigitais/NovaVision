import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import EconomicMap from './pages/EconomicMap';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Login from './pages/Login';
import TestMei from './pages/TestMei';
import ImportCenter from './pages/ImportCenter';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Lock, 
  Mail, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    const handleSelectCompany = (company: any) => {
      setCurrentPage('details');
    };

    switch (currentPage) {
      case 'dashboard': return <Dashboard onSelectCompany={handleSelectCompany} />;
      case 'companies': return <Companies onSelectCompany={handleSelectCompany} />;
      case 'analytics': return <Dashboard onSelectCompany={handleSelectCompany} />; // Reuse for now
      case 'alerts': return <Alerts />;
      case 'reports': return <Reports />;
      case 'map': return <EconomicMap />;
      case 'team': return <Team />;
      case 'admin': return <Admin />;
      case 'profile': return <Profile />;
      case 'details': return <CompanyDetails />;
      case 'test-mei': return <TestMei />;
      case 'import': return <ImportCenter />;
      default: return <Dashboard onSelectCompany={handleSelectCompany} />;
    }
  };

  if (currentPage === 'login') {
    return <Login onLogin={() => setCurrentPage('dashboard')} />;
  }

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}
