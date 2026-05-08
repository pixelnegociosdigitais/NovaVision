import React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Eye, 
  ShieldCheck, 
  ChevronRight,
  Globe,
  Mail,
  Smartphone,
  CreditCard,
  Settings,
  LogOut,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const ProfileSection = ({ title, description, children }: any) => (
  <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
    <div>
      <h3 className="font-display font-bold text-white text-lg mb-1">{title}</h3>
      <p className="text-slate-500 font-sans text-sm">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SettingItem = ({ icon: Icon, label, value, action, color = "text-slate-400" }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={cn("p-2.5 rounded-xl bg-white/5", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
    {action ? action : <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-brand-blue transition-all" />}
  </div>
);

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex justify-between items-start">
        <div className="flex gap-8 items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-brand-blue/10 border-2 border-white/10 flex items-center justify-center font-display font-bold text-brand-blue text-4xl shadow-2xl relative overflow-hidden">
               RA
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white w-8 h-8" />
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-brand-blue rounded-xl shadow-lg border-4 border-brand-black">
               <ShieldCheck className="text-white w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-display font-bold tracking-tight text-white">Ricardo Antunes</h1>
              <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-display font-bold px-3 py-1 rounded-full uppercase tracking-widest">Super Admin</span>
            </div>
            <p className="text-slate-400 font-sans font-medium flex items-center gap-3">
               <Mail className="w-4 h-4" /> ricardo@nexus.ai
               <span className="w-1 h-1 bg-slate-700 rounded-full" />
               ID: #990AS2
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-red-400 font-display font-bold text-sm border border-red-400/10 hover:bg-red-400/10 transition-all">
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProfileSection 
          title="Segurança" 
          description="Controle o acesso e a proteção dos seus dados corporativos."
        >
          <SettingItem 
            icon={Lock} 
            label="Senha" 
            value="Atualizada há 3 meses" 
            color="text-brand-purple"
          />
          <SettingItem 
            icon={Smartphone} 
            label="Autenticação em 2 Etapas" 
            value="Ativado (Via App)" 
            color="text-emerald-400"
            action={<div className="w-10 h-5 bg-emerald-400 rounded-full relative p-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full ml-auto" /></div>}
          />
          <SettingItem 
            icon={Eye} 
            label="Sessões Ativas" 
            value="3 dispositivos conectados" 
            color="text-brand-cyan"
          />
        </ProfileSection>

        <ProfileSection 
          title="Preferências de Sistema" 
          description="Personalize como você interage com a plataforma Nexus."
        >
          <SettingItem 
            icon={Bell} 
            label="Notificações" 
            value="Alertas críticos e QSA" 
            color="text-amber-400"
          />
          <SettingItem 
            icon={Globe} 
            label="Idioma e Região" 
            value="Português (Brasil)" 
            color="text-brand-blue"
          />
          <SettingItem 
            icon={Settings} 
            label="HUD Layout" 
            value="Modo Escuro / Expandido" 
            color="text-slate-400"
          />
        </ProfileSection>

        <ProfileSection 
          title="Faturamento e Plano" 
          description="Informações sobre o seu pacote Enterprise."
        >
          <SettingItem 
            icon={CreditCard} 
            label="Método de Pagamento" 
            value="Mastercard final 4402" 
            color="text-brand-blue"
          />
           <div className="p-6 bg-gradient-to-br from-brand-blue to-brand-purple rounded-3xl text-white space-y-4">
              <div className="flex justify-between items-start">
                 <h4 className="font-display font-bold text-lg">Nexus Enterprise</h4>
                 <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">Mensal</span>
              </div>
              <p className="text-sm opacity-80 font-medium">Acesso ilimitado a QSA, Malha Societária e Geolocalização Industrial.</p>
              <div className="flex justify-between items-center pt-4">
                 <p className="text-2xl font-display font-bold">R$ 1.250<span className="text-sm opacity-60 font-sans font-medium">/mês</span></p>
                 <button className="bg-white text-brand-blue px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl">Upgrade</button>
              </div>
           </div>
        </ProfileSection>

        <ProfileSection 
          title="Logs de Atividade" 
          description="Histórico das suas últimas ações na plataforma."
        >
          <div className="space-y-4">
             {[
               { action: 'Exportação CSV', target: 'Lista São Paulo', time: 'Hoje, 14:20' },
               { action: 'Alteração de Senha', target: 'Conta Principal', time: 'Há 3 dias' },
               { action: 'Acesso Administrativo', target: 'Dashboard Global', time: 'Há 5 dias' },
             ].map((log, i) => (
               <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                     <p className="text-white font-semibold">{log.action}</p>
                     <p className="text-slate-500 text-xs font-medium">{log.target}</p>
                  </div>
                  <span className="text-xs text-slate-600 font-mono">{log.time}</span>
               </div>
             ))}
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}
