import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Building2, 
  Bell, 
  FileText, 
  Map as MapIcon, 
  Users, 
  ShieldCheck, 
  CreditCard,
  LogOut,
  HelpCircle,
  Search,
  User,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  key?: string;
}

const SidebarItem = React.memo(({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
      active 
        ? "bg-brand-blue/10 text-brand-blue" 
        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-transform duration-300", active && "scale-110")} />
    <span className="font-display font-medium text-sm">{label}</span>
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-6 bg-brand-blue rounded-r-full"
      />
    )}
  </button>
));

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function DashboardLayout({ children, currentPage, setCurrentPage }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'companies', icon: Building2, label: 'Empresas' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'alerts', icon: Bell, label: 'Central de Alertas' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
    { id: 'map', icon: MapIcon, label: 'Mapa Econômico' },
    { id: 'team', icon: Users, label: 'Equipe' },
    { id: 'admin', icon: ShieldCheck, label: 'Administrativo' },
    { id: 'import', icon: Download, label: 'Importar Dados' },
  ];

  return (
    <div className="flex min-h-screen bg-brand-black text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 fixed h-screen bg-brand-black/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(86,141,255,0.4)]">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Nova Vision
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentPage === item.id}
              onClick={() => setCurrentPage(item.id)}
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-1">
          <SidebarItem icon={HelpCircle} label="Suporte" onClick={() => {}} />
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-display font-medium text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-brand-black/50 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Busca Inteligente (CNPJ, Razão Social...)"
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all font-sans"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_10px_rgba(86,141,255,0.8)]" />
            </button>
            
            <div className="h-8 w-px bg-white/5" />

            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCurrentPage('profile')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-display font-semibold text-slate-200 group-hover:text-brand-blue transition-colors">Alexandre Silva</p>
                <p className="text-xs text-slate-500">Plano Enterprise</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple p-[1px]">
                <div className="w-full h-full rounded-[11px] bg-brand-black flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 overflow-x-hidden">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="will-change-transform"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
