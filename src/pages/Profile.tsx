import React, { useEffect, useState } from 'react';
import {
  User, Lock, Bell, Eye, ShieldCheck, ChevronRight, Globe,
  Mail, Smartphone, CreditCard, Settings, LogOut, Camera,
  Clock, Activity, Loader2, MapPin, X, Plus, Info, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { buscarLogsRecentes } from '@/lib/activity';
import { usePreferences } from '@/contexts/PreferenceContext';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

const ProfileSection = ({ title, description, children, badge }: any) => (
  <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
    {badge && (
      <div className="absolute top-0 right-0 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl border-l border-b border-brand-blue/20">
        {badge}
      </div>
    )}
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
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const { uf, cities, setUf, setCities, clearPreferences } = usePreferences();
  const [cityInput, setCityInput] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await buscarLogsRecentes(5);
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLogs(false);
      }
    }
    loadLogs();
  }, []);

  const handleAddCity = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (cityInput.trim()) {
      const city = cityInput.trim().toUpperCase();
      if (!cities.includes(city)) {
        setCities([...cities, city]);
      }
      setCityInput('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    setCities(cities.filter(c => c !== cityToRemove));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex gap-8 items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-brand-blue/10 border-2 border-white/10 flex items-center justify-center font-display font-bold text-brand-blue text-4xl shadow-2xl relative overflow-hidden">
               AS
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
              <h1 className="text-4xl font-display font-bold tracking-tight text-white">Alexandre Silva</h1>
              <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-display font-bold px-3 py-1 rounded-full uppercase tracking-widest">Enterprise Master</span>
            </div>
            <p className="text-slate-400 font-sans font-medium flex items-center gap-3">
               <Mail className="w-4 h-4" /> alexandre@novavision.ai
               <span className="w-1 h-1 bg-slate-700 rounded-full" />
               ID: #4402NV
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-red-400 font-display font-bold text-sm border border-red-400/10 hover:bg-red-400/10 transition-all self-start md:self-auto">
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FOCO ECONÔMICO - NOVO */}
        <ProfileSection
          title="Foco Econômico Regional"
          description="Defina sua região de atuação. O sistema filtrará dados automaticamente."
          badge="Configuração Global"
        >
          <div className="space-y-5">
            {/* Estado Selection */}
            <div className="space-y-2">
              <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-brand-blue" /> Estado Prioritário
              </label>
              <select
                value={uf}
                onChange={e => setUf(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black"
              >
                <option value="">Brasil (Sem filtro de estado)</option>
                {UFS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Cidades Selection */}
            {uf && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-purple" /> Cidades Focadas ({cities.length})
                  </label>
                  <form onSubmit={handleAddCity} className="flex gap-2">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      placeholder="Ex: Marau, Passo Fundo..."
                      className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-brand-purple text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-purple/20"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {cities.map(city => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-lg text-xs font-bold transition-all hover:bg-brand-purple/20"
                    >
                      {city}
                      <button onClick={() => removeCity(city)} className="hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {cities.length === 0 && (
                    <p className="text-xs text-slate-600 italic">Nenhuma cidade definida. Mostrando todo o estado de {uf}.</p>
                  )}
                </div>
              </motion.div>
            )}

            {!uf && (
              <div className="p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-brand-blue shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sem um estado definido, a Nova Vision exibe dados agregados de todo o território nacional.
                </p>
              </div>
            )}

            {uf && (
               <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> Filtro Ativo no Dashboard
               </div>
            )}
          </div>
        </ProfileSection>

        <ProfileSection
          title="Assinatura"
          description="Gestão do seu pacote de inteligência empresarial."
        >
          <div className="p-6 bg-gradient-to-br from-brand-blue to-brand-purple rounded-3xl text-white space-y-4 shadow-[0_15px_30px_rgba(86,141,255,0.2)]">
            <div className="flex justify-between items-start">
               <h4 className="font-display font-bold text-lg">Nova Vision Enterprise</h4>
               <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">Anual</span>
            </div>
            <p className="text-sm opacity-90 font-medium">Acesso total a Malha Societária, Alertas de Hotspot e Enriquecimento API.</p>
            <div className="flex justify-between items-center pt-4">
               <p className="text-2xl font-display font-bold">R$ 590<span className="text-sm opacity-60 font-sans font-medium">/mês</span></p>
               <button className="bg-white text-brand-blue px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Gerenciar</button>
            </div>
          </div>
          <SettingItem
            icon={CreditCard}
            label="Método de Cobrança"
            value="Visa final 8822"
            color="text-brand-blue"
          />
        </ProfileSection>

        <ProfileSection
          title="Segurança"
          description="Controle o acesso e a proteção dos seus dados corporativos."
        >
          <SettingItem
            icon={Lock}
            label="Senha de Acesso"
            value="Atualizada há 12 dias"
            color="text-brand-purple"
          />
          <SettingItem
            icon={Smartphone}
            label="Autenticação em Duas Etapas"
            value="Ativado (Via Dispositivo)"
            color="text-emerald-400"
            action={<div className="w-10 h-5 bg-emerald-400 rounded-full relative p-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full ml-auto" /></div>}
          />
        </ProfileSection>

        <ProfileSection
          title="Histórico de Atividade"
          description="Suas últimas interações na plataforma."
        >
          <div className="space-y-4 min-h-[160px]">
             {loadingLogs ? (
               <div className="flex items-center justify-center py-10">
                 <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
               </div>
             ) : logs.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                 <Activity className="w-8 h-8 mb-2 opacity-30" />
                 <p className="text-sm">Nenhuma atividade registrada ainda.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {logs.map((log, i) => (
                   <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex justify-between items-center text-sm border-b border-white/5 pb-4 last:border-0 last:pb-0 group"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition-colors" />
                         </div>
                         <div>
                            <p className="text-white font-semibold group-hover:text-brand-blue transition-colors">{log.acao}</p>
                            <p className="text-slate-500 text-xs font-medium">{log.entidade || 'Sistema'}</p>
                         </div>
                      </div>
                      <span className="text-xs text-slate-600 font-mono">
                        {new Date(log.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
          {!loadingLogs && logs.length > 0 && (
            <button className="w-full flex items-center justify-center gap-2 text-brand-blue font-display font-bold text-xs hover:underline mt-4">
              Ver Log Completo <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </ProfileSection>
      </div>
    </div>
  );
}
