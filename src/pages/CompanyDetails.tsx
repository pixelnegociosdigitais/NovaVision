import React from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Download, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Activity,
  User,
  MoreVertical,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const InfoRow = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 group">
    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-blue/10 transition-colors">
      <Icon className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition-colors" />
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-slate-200 font-medium">{value}</p>
    </div>
  </div>
);

export default function CompanyDetails() {
  return (
    <div className="space-y-8">
      {/* Header Sticky */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-purple p-0.5 flex items-center justify-center">
            <div className="w-full h-full rounded-[23px] bg-brand-black flex items-center justify-center">
              <Building2 className="text-brand-blue w-8 h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display font-bold tracking-tight text-white">Nova Tech Solutions Ltda</h1>
              <span className="bg-emerald-400/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest">Ativa</span>
            </div>
            <p className="text-slate-400 flex items-center gap-4 font-sans text-sm">
              <span className="font-mono">CNPJ: 42.189.003/0001-90</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span>Inscrição Estadual: 119.230.450.112</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-slate-400 hover:text-white">
            <Star className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-slate-400 hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="bg-brand-blue text-white px-6 py-3 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar Relatório PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: General Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-3xl space-y-2">
            <h3 className="font-display text-lg font-bold text-white mb-6">Identificação</h3>
            <InfoRow label="Razão Social" value="Nova Tech Solutions Ltda" icon={Building2} />
            <InfoRow label="Nome Fantasia" value="Logix AI" icon={Activity} />
            <InfoRow label="CNAE Principal" value="62.01-5-01 - Desenvolvimento" icon={Layers} />
            <InfoRow label="Natureza Jurídica" value="Sociedade Empresária Limitada" icon={ShieldCheck} />
            <InfoRow label="Data de Abertura" value="12 de Maio de 2018" icon={Calendar} />
          </div>

          <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-brand-blue/5 to-transparent border-l-4 border-l-brand-blue">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-display text-lg font-bold text-white">Score Analytics</h3>
              <div className="p-2 bg-brand-blue/10 rounded-xl">
                <TrendingUp className="w-4 h-4 text-brand-blue" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-400 text-sm">Saúde da Empresa</span>
                  <span className="text-brand-blue font-display font-bold text-lg">94.8%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full w-[94.8%]" />
                </div>
              </div>

              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Empresa localizada no <span className="text-brand-blue font-semibold">Tier 1</span> de confiabilidade. Baixíssima probabilidade de insolvência nos próximos 24 meses.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Data */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="font-display text-lg font-bold text-white">Localização</h3>
              <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden group">
                <div className="text-slate-600 text-center space-y-2 group-hover:scale-105 transition-transform duration-500">
                  <MapPin className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs uppercase font-display font-bold tracking-widest">Mapa Interativo HUD</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-200 font-medium">Av. das Nações Unidas, 12551</p>
                <p className="text-slate-500 text-sm">Brooklin Novo, São Paulo - SP</p>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-bold text-white">Conselho e Sócios</h3>
                <button className="text-xs text-brand-blue hover:underline">Histórico QSA</button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Alexandre Souza Silva', role: 'Sócio-Administrador' },
                  { name: 'Global Tech Venture', role: 'Sócio Jurídico' },
                ].map((socio, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{socio.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-display font-bold">{socio.role}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-brand-blue transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center translate-y-[-4px]">
              <h3 className="font-display text-lg font-bold text-white">Timeline de Crescimento</h3>
              <div className="p-2 bg-brand-purple/10 rounded-xl">
                <Activity className="w-4 h-4 text-brand-purple" />
              </div>
            </div>

            <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {[
                { date: 'Jan 2024', event: 'Aumento de Capital Social', detail: 'Capital elevado para R$ 12.000.000,00' },
                { date: 'Set 2023', event: 'Alteração de Endereço', detail: 'Nova sede no Brooklin Novo, São Paulo' },
                { date: 'Mai 2018', event: 'Fundação da Empresa', detail: 'Início das operações focadas em IA' },
              ].map((item, i) => (
                <div key={i} className="relative pl-10 group">
                  <div className="absolute left-[7px] top-2 w-1.5 h-1.5 rounded-full bg-brand-blue ring-4 ring-brand-blue/20 transition-all group-hover:scale-150" />
                  <div className="space-y-1">
                    <p className="text-xs font-display font-bold text-brand-blue uppercase">{item.date}</p>
                    <p className="text-sm font-semibold text-slate-200">{item.event}</p>
                    <p className="text-xs text-slate-500 font-sans">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
