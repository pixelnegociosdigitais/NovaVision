import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  MapPin, 
  ArrowUpRight, 
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { motion } from 'motion/react';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1100 },
];

const sectorData = [
  { name: 'Tecnologia', value: 45, color: '#568dff' },
  { name: 'Varejo', value: 32, color: '#00e3fd' },
  { name: 'Saúde', value: 28, color: '#a078ff' },
  { name: 'Indústria', value: 24, color: '#f43f5e' },
];

const StatCard = React.memo(({ title, value, change, icon: Icon }: any) => (
  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-blue/30 transition-all duration-500 will-change-transform">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-brand-blue/10 rounded-xl">
        <Icon className="w-5 h-5 text-brand-blue" />
      </div>
      <div className="flex items-center gap-1 text-xs font-display font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
        <TrendingUp className="w-3 h-3" />
        {change}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-400 text-sm font-medium font-display uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-display font-bold text-white tracking-tight">{value}</p>
    </div>
    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors" />
  </div>
));

interface DashboardProps {
  onSelectCompany: (company: any) => void;
}

export default function Dashboard({ onSelectCompany }: DashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Panorama Executivo</h1>
          <p className="text-slate-400 font-sans">Sincronizado há 2 minutos • Dados nacionais BR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Empresas" value="1.240.592" change="+12.4%" icon={Building2} />
        <StatCard title="Últimos 30 Dias" value="48.210" change="+8.2%" icon={Calendar} trend />
        <StatCard title="Novos MEIs" value="12.903" change="+15.3%" icon={Users} />
        <StatCard title="Polo de Crescimento" value="São Paulo, SP" change="Ativo" icon={MapPin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl font-bold text-white">Evolução de Aberturas</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-slate-300 hover:bg-white/10 transition-all border border-white/5">Exportar</button>
              <button className="material-symbols-outlined p-1 text-slate-500 hover:text-white cursor-pointer transition-colors">more_horiz</button>
            </div>
          </div>
          
          <div className="h-[300px] w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#568dff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#568dff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#568dff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <h2 className="font-display text-xl font-bold text-white">Distribuição Setorial</h2>
          <div className="space-y-6">
            {sectorData.map((item) => (
              <div key={item.name} className="space-y-2 group cursor-pointer">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{item.name}</span>
                  <span className="text-white font-bold">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full will-change-[width]"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all font-display font-semibold text-sm text-slate-300">
            Ver Análise Completa
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-white">Últimas Empresas Abertas</h2>
          <button className="text-brand-blue font-display text-sm font-bold hover:underline">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-display font-medium text-slate-500 uppercase tracking-widest bg-white/[0.02]">
                <th className="px-8 py-4">Empresa</th>
                <th className="px-8 py-4">CNPJ</th>
                <th className="px-8 py-4">Cidade / UF</th>
                <th className="px-8 py-4">Eixo Econômico</th>
                <th className="px-8 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Nova Tech Solutions', cnpj: '42.234.123/0001-90', city: 'São Paulo, SP', axis: 'Tecnologia' },
                { name: 'BioInova S.A.', cnpj: '18.990.432/0001-11', city: 'Curitiba, PR', axis: 'Saúde' },
                { name: 'Logística Alpha', cnpj: '33.112.556/0001-02', city: 'Goiânia, GO', axis: 'Indústria' },
              ].map((row, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={() => onSelectCompany(row)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center font-display font-bold text-brand-blue text-xs">
                        {row.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-400 font-mono text-sm">{row.cnpj}</td>
                  <td className="px-8 py-5 text-slate-400 text-sm">{row.city}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-wider">
                      {row.axis}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button className="material-symbols-outlined text-slate-600 hover:text-white transition-colors">arrow_forward</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
