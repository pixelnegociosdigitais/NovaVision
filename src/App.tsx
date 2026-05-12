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
import Plans from './pages/Plans';
import FocusSettings from './pages/FocusSettings';
import SyncMonitor from './pages/SyncMonitor';
import { PreferenceProvider } from './contexts/PreferenceContext';
import type { Empresa } from './lib/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('focus');
  const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null);

  const handleSelectCompany = (company: Empresa) => {
    setSelectedCompany(company);
    setCurrentPage('details');
  };

  const handleBackFromDetails = () => {
    setCurrentPage('companies');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onSelectCompany={handleSelectCompany} />;
      case 'companies': return <Companies onSelectCompany={handleSelectCompany} />;
      case 'alerts':    return <Alerts />;
      case 'reports':   return <Reports />;
      case 'map':       return <EconomicMap />;
      case 'team':      return <Team />;
      case 'admin':     return <Admin />;
      case 'profile':   return <Profile />;
      case 'focus':     return <FocusSettings />;
      case 'plans':     return <Plans />;
      case 'details':   return <CompanyDetails empresa={selectedCompany} onBack={handleBackFromDetails} />;
      case 'test-mei':  return <TestMei />;
      case 'import':    return <ImportCenter />;
      case 'monitor':   return <SyncMonitor />;
      default:          return <Dashboard onSelectCompany={handleSelectCompany} />;
    }
  };

  if (currentPage === 'login') {
    return <Login onLogin={() => setCurrentPage('focus')} />;
  }

  return (
    <PreferenceProvider>
      <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </DashboardLayout>
    </PreferenceProvider>
  );
}
