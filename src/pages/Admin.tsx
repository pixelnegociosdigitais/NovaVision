import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Settings, Users, Database, Activity, Zap, Lock,
  Key, Server, Cloud, ChevronRight, MoreVertical, Loader2,
  HardDrive, Globe, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    totalAlertas: 0,
    totalFavoritos: 0,
    dbHealth: 'Normal',
  });

  useEffect(() => {
    async function loadAdminStats() {
      setLoading(true);
      try {
        const [rEmp, rAlt, rFav] = await Promise.all([
          supabase.from('empresas').select('id', { count: 'exact', head: true }),
          supabase.from('alertas').select('id', { count: 'exact', head: true }),
          supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('is_favorite', true),
        ]);

        setStats({
          totalEmpresas: rEmp.count || 0,
          totalAlertas: rAlt.count || 0,
          totalFavoritos: rFav.count || 0,
          dbHealth: 'Excellent',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Painel Administrativo</h1>
          <p className="text-slate-400 font-sans">Monitoramento de infraestrutura, volumes de dados e auditoria do sistema</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Settings className="w-4 h-4" /> Configurações
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Lock className="w-4 h-4" /> Auditoria de Segurança
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* DB Card */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-brand-blue/10 rounded-2xl">
                 <Database className="w-6 h-6 text-brand-blue" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-400/10 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ativo</span>
              </div>
           </div>
           <div>
              <h3 className="text-slate-400 text-xs font-display font-bold uppercase tracking-widest mb-1">Volume do Banco</h3>
              {loading ? <div className="h-8 w-32 bg-white/5 rounded animate-pulse" /> : (
                <p className="text-3xl font-display font-bold text-white">{stats.totalEmpresas.toLocaleString('pt-BR')} <span className="text-sm font-sans font-medium text-slate-500">Registros</span></p>
              )}
              <div className="mt-4 flex gap-1 h-2">
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                   <div key={i} className="flex-1 bg-emerald-400/20 rounded-full">
                      <div className="w-full h-full bg-emerald-400 rounded-full" />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* System Health */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-brand-purple/10 rounded-2xl">
                 <Activity className="w-6 h-6 text-brand-purple" />
              </div>
              <Server className="w-4 h-4 text-brand-purple" />
           </div>
           <div>
              <h3 className="text-slate-400 text-xs font-display font-bold uppercase tracking-widest mb-1">Health & Latency</h3>
              <p className="text-3xl font-display font-bold text-white">12ms <span className="text-sm font-sans font-medium text-slate-500">Avg Response</span></p>
              <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-2">
                <Cloud className="w-3 h-3" /> Supabase Connection: Stable
              </p>
           </div>
        </div>

        {/* Assets & Usage */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5">
           <div className="flex justify-between items-center">
              <div className="p-3 bg-brand-cyan/10 rounded-2xl">
                 <Zap className="w-6 h-6 text-brand-cyan" />
              </div>
              <span className="bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">Pro Tier</span>
           </div>
           <div>
              <h3 className="text-slate-400 text-xs font-display font-bold uppercase tracking-widest mb-1">Monitoramento Ativo</h3>
              {loading ? <div className="h-8 w-32 bg-white/5 rounded animate-pulse" /> : (
                <p className="text-3xl font-display font-bold text-white">{stats.totalAlertas} <span className="text-sm font-sans font-medium text-slate-500">Alertas</span></p>
              )}
              <p className="text-xs text-slate-500 mt-2 font-medium">{stats.totalFavoritos} empresas favoritadas pelos usuários</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <h3 className="font-display font-bold text-white">Infraestrutura Cloud</h3>
               <button className="text-xs text-brand-blue font-bold hover:underline flex items-center gap-1">
                 Métricas Detalhadas <ChevronRight className="w-3 h-3" />
               </button>
            </div>
            <div className="p-8 space-y-6">
               {[
                 { label: 'Espaço em Disco', value: '2.4 GB', total: '10 GB', icon: HardDrive, color: 'brand-blue' },
                 { label: 'Transferência Mensal', value: '158 GB', total: '1 TB', icon: Globe, color: 'brand-purple' },
                 { label: 'Requisições API', value: '45.2k', total: '500k', icon: Zap, color: 'brand-cyan' },
               ].map((item) => (
                 <div key={item.label} className="space-y-3">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4", `text-${item.color}`)} />
                        <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                     </div>
                     <span className="text-xs text-slate-500 font-bold">{item.value} / {item.total}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(parseFloat(item.value) / parseFloat(item.total)) * 100}%` }}
                        className={cn("h-full rounded-full", `bg-${item.color}`)}
                      />
                   </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-white">Incidências e Logs</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> All Systems Go
              </div>
            </div>
            <div className="space-y-5">
               {[
                 { action: 'Importação Q3 Brasil.IO', status: 'Success', time: 'Há 12 min', color: 'text-emerald-400' },
                 { action: 'Back-up Diário Supabase', status: 'Completed', time: 'Hoje, 04:00', color: 'text-emerald-400' },
                 { action: 'Sync de Malha Societária', status: 'Warning', time: 'Ontem, 22:15', color: 'text-amber-400' },
                 { action: 'Indexação de CNAEs', status: 'Success', time: 'Ontem, 21:30', color: 'text-emerald-400' },
               ].map((log, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-4">
                       <div className={cn("w-2 h-2 rounded-full", log.color.replace('text', 'bg'))} />
                       <div>
                          <p className="text-sm font-semibold text-slate-200">{log.action}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-display font-bold">{log.status} • {log.time}</p>
                       </div>
                    </div>
                    <button className="p-2 text-slate-600 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
