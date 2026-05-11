import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2, TrendingUp, Users, MapPin,
  Calendar, RefreshCw, ArrowUpRight, Zap, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { registrarLog } from '@/lib/activity';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import type { Empresa } from '@/lib/types';

// ─────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────
interface Stats {
  total: number;
  abertas_7d: number;
  abertas_30d: number;
  abertas_90d: number;
  total_mei: number;
}

interface MensalItem { mes: string; total: number }
interface EixoItem   { name: string; value: number; color: string }

const EIXO_COLORS: Record<string, string> = {
  'Comércio':    '#568dff',
  'Serviços':    '#00e3fd',
  'Tecnologia':  '#a078ff',
  'Indústria':   '#f43f5e',
  'Saúde':       '#10b981',
  'Educação':    '#f59e0b',
  'Construção':  '#fb923c',
  'Agronegócio': '#84cc16',
  'Financeiro':  '#e879f9',
  'Turismo':     '#38bdf8',
  'Outro':       '#64748b',
};

const MESES: Record<string, string> = {
  '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez',
};

// ─────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-white/5 rounded-xl', className)} />
  );
}

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, loading }: {
  title: string; value: string | number; sub?: string;
  icon: any; loading: boolean;
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-blue/30 transition-all duration-500">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-brand-blue/10 rounded-xl">
          <Icon className="w-5 h-5 text-brand-blue" />
        </div>
        {sub && (
          <div className="flex items-center gap-1 text-xs font-display font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3" /> {sub}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-white/80 text-sm font-medium font-display uppercase tracking-wider">{title}</h3>
        {loading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <p className="text-3xl font-display font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
        )}
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors" />
    </div>
  );
}

// ─────────────────────────────────────────
// Custom tooltip para gráficos
// ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-white/80 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-sm">{payload[0].value?.toLocaleString('pt-BR')} empresas</p>
    </div>
  );
};

// ─────────────────────────────────────────
// Badge de eixo colorido
// ─────────────────────────────────────────
function EixoBadge({ eixo }: { eixo?: string }) {
  const color = EIXO_COLORS[eixo || 'Outro'] || '#64748b';
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {eixo || 'Outro'}
    </span>
  );
}

// ─────────────────────────────────────────
// Dashboard principal
// ─────────────────────────────────────────
interface DashboardProps {
  onSelectCompany: (company: any) => void;
}

export default function Dashboard({ onSelectCompany }: DashboardProps) {
  const { uf, cities, apenasMei, dataInicio, dataFim, eixos } = usePreferences();
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, abertas_7d: 0, abertas_30d: 0, abertas_90d: 0, total_mei: 0 });
  const [mensal, setMensal] = useState<MensalItem[]>([]);
  const [eixos, setEixos] = useState<EixoItem[]>([]);
  const [recentes, setRecentes] = useState<Empresa[]>([]);

  const carregar = useCallback(async (manual = false) => {
    setLoading(true);
    if (manual) registrarLog('Atualizou Dashboard');
    try {
      const hoje = new Date();
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const d7  = new Date(hoje); d7.setDate(hoje.getDate() - 7);
      const d30 = new Date(hoje); d30.setDate(hoje.getDate() - 30);
      const d90 = new Date(hoje); d90.setDate(hoje.getDate() - 90);

      const applyPref = (q: any) => {
        let query = q;
        if (uf) query = query.eq('uf', uf.toUpperCase());
        if (cities.length > 0) query = query.in('municipio', cities.map(c => c.toUpperCase()));
        if (eixos && eixos.length > 0) query = query.in('eixo_economico', eixos);
        if (apenasMei) query = query.eq('opcao_pelo_mei', true);
        if (dataInicio) query = query.gte('data_abertura', dataInicio);
        if (dataFim) query = query.lte('data_abertura', dataFim);
        return query;
      };

      // Estatísticas em paralelo
      const [rTotal, r7, r30, r90, rMei, rRecentes, rMensal, rEixo] = await Promise.all([
        applyPref(supabase.from('empresas').select('id', { count: 'exact', head: true })),
        applyPref(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d7))),
        applyPref(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d30))),
        applyPref(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d90))),
        applyPref(supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('opcao_pelo_mei', true)),
        applyPref(supabase.from('empresas').select('cnpj,razao_social,nome_fantasia,municipio,uf,eixo_economico,data_abertura,descricao_situacao_cadastral'))
          .order('data_abertura', { ascending: false }).limit(8),
        applyPref(supabase.from('empresas').select('data_abertura'))
          .gte('data_abertura', fmt(new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1)))
          .not('data_abertura', 'is', null),
        applyPref(supabase.from('empresas').select('eixo_economico')).not('eixo_economico', 'is', null),
      ]);

      setStats({
        total:      rTotal.count  || 0,
        abertas_7d: r7.count      || 0,
        abertas_30d: r30.count    || 0,
        abertas_90d: r90.count    || 0,
        total_mei:  rMei.count    || 0,
      });

      setRecentes((rRecentes.data || []) as Empresa[]);

      // Agrupa crescimento mensal
      const mensalMap: Record<string, number> = {};
      (rMensal.data || []).forEach((e: any) => {
        if (!e.data_abertura) return;
        const key = e.data_abertura.substring(0, 7); // YYYY-MM
        mensalMap[key] = (mensalMap[key] || 0) + 1;
      });
      const mensalArr = Object.entries(mensalMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, total]) => {
          const [, mm] = mes.split('-');
          return { mes: MESES[mm] || mm, total };
        });
      setMensal(mensalArr);

      // Agrupa por eixo econômico
      const eixoMap: Record<string, number> = {};
      (rEixo.data || []).forEach((e: any) => {
        const k = e.eixo_economico || 'Outro';
        eixoMap[k] = (eixoMap[k] || 0) + 1;
      });
      const eixoArr = Object.entries(eixoMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, value]) => ({ name, value, color: EIXO_COLORS[name] || '#64748b' }));
      setEixos(eixoArr);

      setLastSync(new Date());
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [uf, cities, apenasMei, dataInicio, dataFim, eixos]);

  useEffect(() => { carregar(); }, [carregar]);

  const sincronia = lastSync
    ? `Sincronizado às ${lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Carregando...';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Panorama Executivo</h1>
          <p className="text-white/80 font-sans">{sincronia} • Dados do banco Nova Vision</p>
        </div>
        <button
          onClick={() => carregar(true)}
          disabled={loading}
          className="glass-panel px-4 py-2.5 rounded-xl text-white/90 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Empresas"     value={stats.total}       icon={Building2}  loading={loading} />
        <StatCard title="Últimos 30 Dias"    value={stats.abertas_30d} icon={Calendar}   loading={loading} sub={stats.abertas_30d > 0 ? 'Novas' : undefined} />
        <StatCard title="Últimos 7 Dias"     value={stats.abertas_7d}  icon={Zap}        loading={loading} />
        <StatCard title="Total MEI"          value={stats.total_mei}   icon={Users}      loading={loading} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Área — crescimento mensal */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Evolução de Aberturas</h2>
              <p className="text-white/70 text-xs mt-0.5">Últimos 12 meses</p>
            </div>
            <BarChart3 className="w-5 h-5 text-white/60" />
          </div>
          <div className="h-[280px] w-full min-h-0 min-w-0">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : mensal.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60">
                <Building2 className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhum dado de abertura disponível</p>
                <p className="text-xs mt-1">Importe empresas via Central de Importação</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mensal}>
                  <defs>
                    <linearGradient id="gradMensal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#568dff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#568dff" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="total" stroke="#568dff" strokeWidth={3}
                    fillOpacity={1} fill="url(#gradMensal)" animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribuição por Eixo */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <h2 className="font-display text-xl font-bold text-white">Distribuição Setorial</h2>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : eixos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/60">
              <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm text-center">Importe dados para ver distribuição setorial</p>
            </div>
          ) : (
            <div className="space-y-5">
              {eixos.map((item) => {
                const max = eixos[0]?.value || 1;
                const pct = Math.round((item.value / max) * 100);
                return (
                  <div key={item.name} className="space-y-2 group cursor-pointer">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/80 font-medium">{item.name}</span>
                      <span className="text-white font-bold">{item.value.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        className="h-full rounded-full will-change-[width]"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabela — últimas empresas abertas */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Últimas Empresas Abertas</h2>
            <p className="text-white/70 text-xs mt-0.5">Ordenado por data de abertura</p>
          </div>
          <button className="text-brand-blue font-display text-sm font-bold hover:underline flex items-center gap-1">
            Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-display font-medium text-white/70 uppercase tracking-widest bg-white/[0.02]">
                <th className="px-8 py-4">Empresa</th>
                <th className="px-8 py-4">CNPJ</th>
                <th className="px-8 py-4">Cidade / UF</th>
                <th className="px-8 py-4">Eixo Econômico</th>
                <th className="px-8 py-4">Data Abertura</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-8 py-5">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                    <p className="text-white/70 text-sm">Nenhuma empresa importada ainda.</p>
                    <p className="text-white/60 text-xs mt-1">Acesse <strong className="text-white/70">Importar Dados</strong> na sidebar para iniciar.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {recentes.map((emp, i) => (
                    <motion.tr
                      key={emp.cnpj}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => onSelectCompany(emp)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center font-display font-bold text-brand-blue text-xs shrink-0">
                            {(emp.nome_fantasia || emp.razao_social).charAt(0)}
                          </div>
                          <span className="text-white font-medium text-sm group-hover:text-brand-blue transition-colors line-clamp-1">
                            {emp.nome_fantasia || emp.razao_social}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-white/80 font-mono text-xs">
                        {emp.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-white/60" />
                          {[emp.municipio, emp.uf].filter(Boolean).join(', ') || '—'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <EixoBadge eixo={emp.eixo_economico} />
                      </td>
                      <td className="px-8 py-5 text-white/80 text-sm">
                        {emp.data_abertura
                          ? new Date(emp.data_abertura + 'T12:00:00').toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          emp.descricao_situacao_cadastral === 'ATIVA'
                            ? 'bg-emerald-400/10 text-emerald-400'
                            : 'bg-slate-500/10 text-white/70'
                        )}>
                          {emp.descricao_situacao_cadastral || 'N/D'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
