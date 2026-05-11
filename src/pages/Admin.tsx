import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Settings, Users, Database, Activity, Zap, Lock,
  Key, Server, Cloud, ChevronRight, MoreVertical, Loader2,
  HardDrive, Globe, AlertCircle, Trash2, Filter, CheckCircle2
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
  
  async function limparDadosAntigos() {
    if (!confirm('Tem certeza que deseja apagar empresas importadas há mais de 90 dias?')) return;
    setLoading(true);
    try {
      const data90 = new Date();
      data90.setDate(data90.getDate() - 90);
      const { error, count } = await supabase
        .from('empresas')
        .delete({ count: 'exact' })
        .lt('importado_em', data90.toISOString());
      
      if (error) throw error;
      alert(`Sucesso! ${count || 0} registros antigos foram removidos.`);
      window.location.reload();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function manterApenasRS() {
    if (!confirm('Esta ação irá apagar TODAS as empresas que NÃO são do Rio Grande do Sul (RS). Continuar?')) return;
    setLoading(true);
    try {
      const { error, count } = await supabase
        .from('empresas')
        .delete({ count: 'exact' })
        .neq('uf', 'RS');
      
      if (error) throw error;
      alert(`Sucesso! ${count || 0} registros de outros estados foram removidos.`);
      window.location.reload();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Painel Administrativo</h1>
          <p className="text-white/80 font-sans">Monitoramento de infraestrutura, volumes de dados e auditoria do sistema</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-white/90 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
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
              <h3 className="text-white/80 text-xs font-display font-bold uppercase tracking-widest mb-1">Volume do Banco</h3>
              {loading ? <div className="h-8 w-32 bg-white/5 rounded animate-pulse" /> : (
                <p className="text-3xl font-display font-bold text-white">{stats.totalEmpresas.toLocaleString('pt-BR')} <span className="text-sm font-sans font-medium text-white/70">Registros</span></p>
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
              <h3 className="text-white/80 text-xs font-display font-bold uppercase tracking-widest mb-1">Health & Latency</h3>
              <p className="text-3xl font-display font-bold text-white">12ms <span className="text-sm font-sans font-medium text-white/70">Avg Response</span></p>
              <p className="text-xs text-white/70 mt-2 font-medium flex items-center gap-2">
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
              <h3 className="text-white/80 text-xs font-display font-bold uppercase tracking-widest mb-1">Monitoramento Ativo</h3>
              {loading ? <div className="h-8 w-32 bg-white/5 rounded animate-pulse" /> : (
                <p className="text-3xl font-display font-bold text-white">{stats.totalAlertas} <span className="text-sm font-sans font-medium text-white/70">Alertas</span></p>
              )}
              <p className="text-xs text-white/70 mt-2 font-medium">{stats.totalFavoritos} empresas favoritadas pelos usuários</p>
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
                        <span className="text-sm text-white/90 font-medium">{item.label}</span>
                     </div>
                     <span className="text-xs text-white/70 font-bold">{item.value} / {item.total}</span>
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
                          <p className="text-[10px] text-white/70 uppercase font-display font-bold">{log.status} • {log.time}</p>
                       </div>
                    </div>
                    <button className="p-2 text-white/60 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
         </div>
      </div>

       {/* Maintenance Section */}
       <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-400/10 rounded-2xl">
                <Settings className="w-6 h-6 text-red-400" />
             </div>
             <div>
                <h2 className="text-xl font-display font-bold text-white">Manutenção de Dados</h2>
                <p className="text-sm text-slate-500 font-sans">Ferramentas para otimização de armazenamento e limpeza de base</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <button 
               onClick={limparDadosAntigos}
               disabled={loading}
               className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-red-400/5 hover:border-red-400/20 transition-all group disabled:opacity-50"
             >
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-6 h-6 text-slate-400 group-hover:text-red-400" />
                   </div>
                   <div className="text-left">
                      <p className="text-white font-bold font-display">Limpar Dados Antigos</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Remove empresas importadas há +90 dias</p>
                   </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-red-400" />
             </button>

             <button 
               onClick={manterApenasRS}
               disabled={loading}
               className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-brand-blue/5 hover:border-brand-blue/20 transition-all group disabled:opacity-50"
             >
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-blue/10 transition-colors">
                      <Filter className="w-6 h-6 text-slate-400 group-hover:text-brand-blue" />
                   </div>
                   <div className="text-left">
                      <p className="text-white font-bold font-display">Manter Apenas RS</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Remove registros de outros estados da base</p>
                   </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-brand-blue" />
             </button>
          </div>
       </div>
    </div>
  );
}
