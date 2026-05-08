import React from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Database, 
  Activity, 
  Zap, 
  Lock, 
  Key, 
  Server,
  Cloud,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Admin() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Painel de Controle Nexus</h1>
          <p className="text-slate-400 font-sans">Gestão de infraestrutura, acessos e auditoria global</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Settings className="w-4 h-4" /> System Config
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Lock className="w-4 h-4" /> Security Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-6">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-brand-blue/10 rounded-2xl">
                 <Server className="w-6 h-6 text-brand-blue" />
              </div>
              <Activity className="w-4 h-4 text-emerald-400" />
           </div>
           <div>
              <h3 className="text-slate-400 text-xs font-display font-bold uppercase tracking-widest mb-1">Status Sincronização</h3>
              <p className="text-2xl font-display font-bold text-white">99.98% Health</p>
              <div className="mt-4 flex gap-1 h-2">
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                   <div key={i} className="flex-1 bg-emerald-400/20 rounded-full">
                      <div className="w-full h-full bg-emerald-400 rounded-full" />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-brand-purple/10 rounded-2xl">
                 <Database className="w-6 h-6 text-brand-purple" />
              </div>
              <Cloud className="w-4 h-4 text-brand-purple" />
           </div>
           <div>
              <h3 className="text-slate-400 text-xs font-display font-bold uppercase tracking-widest mb-1">Indexação de Dados</h3>
              <p className="text-2xl font-display font-bold text-white">4.2M Registros</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Latência média: 24ms</p>
           </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-brand-cyan/10 rounded-2xl">
                 <Key className="w-6 h-6 text-brand-cyan" />
              </div>
              <span className="bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">Enterprise</span>
           </div>
           <div>
              <h3 className="text-slate-400 text-xs font-display font-bold uppercase tracking-widest mb-1">Chaves de API Ativas</h3>
              <p className="text-2xl font-display font-bold text-white">12 / 15 Ativas</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Renovação em 12 dias</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <h3 className="font-display font-bold text-white">Gestão de Operadores</h3>
               <button className="text-xs text-brand-blue font-bold hover:underline">Ver todos</button>
            </div>
            <div className="p-6 space-y-4">
               {[
                 { name: 'Ricardo Antunes', role: 'Super Admin', status: 'Online' },
                 { name: 'Beatriz Costa', role: 'Analista de Dados', status: 'Online' },
                 { name: 'Marcos Silva', role: 'Auditor Externo', status: 'Offline' },
               ].map((user, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-display font-bold text-slate-400">
                          {user.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-display font-bold">{user.role}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={cn(
                         "text-[10px] font-bold uppercase tracking-widest",
                         user.status === 'Online' ? "text-emerald-400" : "text-slate-600"
                       )}>{user.status}</span>
                       <button className="p-2 text-slate-600 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                 </div>
               ))}
               <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-slate-500 font-display font-semibold hover:border-brand-blue hover:text-brand-blue transition-all">
                  Convidar Novo Operador
               </button>
            </div>
         </div>

         <div className="glass-panel p-8 rounded-3xl space-y-8">
            <h3 className="font-display font-bold text-white">Logs de Segurança</h3>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
               {[
                 { action: 'Acesso Administrativo', user: 'Ricardo Antunes', time: '14:22', ip: '189.122.4.10' },
                 { action: 'Exportação Massiva', user: 'Beatriz Costa', time: '13:05', ip: '187.12.90.222' },
                 { action: 'Falha de Login', user: 'Sistema (Bot Detect)', time: '12:44', ip: 'Unknown' },
                 { action: 'Webhook Criado', user: 'Marcos Silva', time: '10:15', ip: '189.122.4.11' },
               ].map((log, i) => (
                 <div key={i} className="relative pl-10 group">
                    <div className={cn(
                      "absolute left-[9px] top-2 w-[5px] h-[5px] rounded-full",
                      log.action.includes('Falha') ? "bg-red-400 shadow-[0_0_10px_#f43f5e]" : "bg-brand-blue"
                    )} />
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-sm font-semibold text-slate-200">{log.action}</p>
                          <p className="text-xs text-slate-500 font-medium">Por: <span className="text-slate-400">{log.user}</span> • IP: {log.ip}</p>
                       </div>
                       <span className="text-[10px] font-mono text-slate-600">{log.time}</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-brand-blue font-display font-bold text-sm hover:underline">
               Explorar Audit Log Completo <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
