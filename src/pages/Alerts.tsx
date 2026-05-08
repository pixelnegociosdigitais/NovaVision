import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Zap, 
  RefreshCcw, 
  Settings,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const AlertItem = ({ type, title, description, time, priority }: any) => (
  <div className="glass-panel p-6 rounded-3xl border-l-4 group cursor-pointer transition-all hover:bg-white/[0.05]"
       style={{ borderLeftColor: priority === 'high' ? '#f43f5e' : priority === 'medium' ? '#f59e0b' : '#568dff' }}>
    <div className="flex justify-between items-start">
      <div className="flex gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
          priority === 'high' ? "bg-red-400/10" : priority === 'medium' ? "bg-amber-400/10" : "bg-brand-blue/10"
        )}>
          {type === 'alert' && <AlertTriangle className={cn("w-6 h-6", priority === 'high' ? "text-red-400" : "text-amber-400")} />}
          {type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          {type === 'info' && <Zap className="w-6 h-6 text-brand-blue" />}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-white">{title}</h3>
            <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{priority} priority</span>
          </div>
          <p className="text-sm text-slate-400 font-sans max-w-xl">{description}</p>
          <div className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" /> {time}
            </span>
            <button className="text-xs text-brand-blue font-bold hover:underline">Ver análise detalhada</button>
          </div>
        </div>
      </div>
      <button className="p-2 text-slate-600 hover:text-white">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export default function Alerts() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Central de Alertas Inteligentes</h1>
          <p className="text-slate-400 font-sans">Sinalização de riscos, aberturas e movimentações societárias críticas</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Settings className="w-4 h-4" /> Configurar Rules
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Sync Agora
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-blue" /> Categorias
                </h3>
              </div>
              <div className="space-y-2">
                 {[
                   { label: 'Risco de Crédito', count: 12, icon: TrendingDown, color: 'text-red-400' },
                   { label: 'Sociedades', count: 45, icon: Building2, color: 'text-brand-blue' },
                   { label: 'Fusões', count: 5, icon: Zap, color: 'text-brand-purple' },
                   { label: 'Aberturas VIP', count: 128, icon: ArrowUpRight, color: 'text-brand-cyan' },
                 ].map((cat) => (
                   <button key={cat.label} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <cat.icon className={cn("w-4 h-4", cat.color)} />
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{cat.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-lg">{cat.count}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
           <AlertItem 
              type="alert"
              priority="high"
              title="ALERTA: Alteração Societária Crítica"
              description="A empresa Global Retail S.A. removeu 3 investidores majoritários do QSA sem aviso prévio. Risco de alteração estrutural detectado."
              time="há 14 minutos"
           />
           <AlertItem 
              type="info"
              priority="medium"
              title="Novo Unicórnio Potencial"
              description="A startup TechAlpha Ltda recebeu um aumento de capital de R$ 45M em rodada Series B. Classificada como Tier 1 em potencial de crescimento."
              time="há 1 hora"
           />
           <AlertItem 
              type="success"
              priority="low"
              title="Processamento Concluído"
              description="A sincronização com a base da Receita Federal (Q1 2024) foi finalizada com sucesso. 12k novas empresas importadas."
              time="há 3 horas"
           />
            <AlertItem 
              type="alert"
              priority="medium"
              title="Suspensão de Atividade Detectada"
              description="Monitoramento automático identificou 15 empresas do setor calçadista em Franca-SP com status alterado para 'Inativa'."
              time="há 5 horas"
           />
        </div>
      </div>
    </div>
  );
}
