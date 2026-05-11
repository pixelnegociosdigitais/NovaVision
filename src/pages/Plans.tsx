import React, { useState } from 'react';
import {
  Check, X, Zap, Building2, Crown, ArrowRight,
  Shield, BarChart3, Bell, Download, Users, Globe, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────
// Dados dos planos
// ─────────────────────────────────────────
const PLANOS = [
  {
    id: 'free',
    nome: 'Free',
    tagline: 'Para explorar a plataforma',
    preco_mensal: 0,
    preco_anual: 0,
    cor: '#64748b',
    icon: Shield,
    popular: false,
    recursos: [
      { label: 'Visualizar até 50 empresas/mês',     ok: true  },
      { label: '1 alerta de monitoramento',           ok: true  },
      { label: 'Dashboard básico',                    ok: true  },
      { label: 'Exportações (CSV)',                   ok: false },
      { label: 'Filtros avançados',                   ok: false },
      { label: 'Mapa econômico interativo',           ok: false },
      { label: 'Central de Relatórios',               ok: false },
      { label: 'Acesso à API',                        ok: false },
      { label: 'Suporte prioritário',                 ok: false },
    ],
    limite_empresas: '50 / mês',
    limite_alertas:  '1 alerta',
    limite_exports:  '—',
    limite_api:      '—',
  },
  {
    id: 'pro',
    nome: 'Pro',
    tagline: 'Para analistas e consultores',
    preco_mensal: 197,
    preco_anual: 167,
    cor: '#568dff',
    icon: Zap,
    popular: true,
    recursos: [
      { label: 'Visualizar até 5.000 empresas/mês',  ok: true  },
      { label: '20 alertas de monitoramento',         ok: true  },
      { label: 'Dashboard executivo completo',        ok: true  },
      { label: 'Exportações CSV e Excel',             ok: true  },
      { label: 'Filtros avançados + Full-text',       ok: true  },
      { label: 'Mapa econômico interativo',           ok: true  },
      { label: 'Central de Relatórios',               ok: true  },
      { label: 'Acesso à API',                        ok: false },
      { label: 'Suporte prioritário',                 ok: false },
    ],
    limite_empresas: '5.000 / mês',
    limite_alertas:  '20 alertas',
    limite_exports:  'CSV e Excel',
    limite_api:      '—',
  },
  {
    id: 'business',
    nome: 'Business',
    tagline: 'Para equipes e empresas',
    preco_mensal: 697,
    preco_anual: 590,
    cor: '#a078ff',
    icon: Crown,
    popular: false,
    recursos: [
      { label: 'Empresas ilimitadas',                 ok: true  },
      { label: 'Alertas ilimitados',                  ok: true  },
      { label: 'Dashboard executivo completo',        ok: true  },
      { label: 'Exportações CSV, Excel e PDF',        ok: true  },
      { label: 'Filtros avançados + Full-text',       ok: true  },
      { label: 'Mapa econômico interativo',           ok: true  },
      { label: 'Central de Relatórios',               ok: true  },
      { label: 'Acesso à API (10k req/mês)',          ok: true  },
      { label: 'Suporte prioritário 24/7',            ok: true  },
    ],
    limite_empresas: 'Ilimitado',
    limite_alertas:  'Ilimitado',
    limite_exports:  'CSV, Excel, PDF',
    limite_api:      '10.000 req/mês',
  },
];

const COMPARATIVO = [
  { label: 'Empresas por mês',      chave: 'limite_empresas', icon: Building2 },
  { label: 'Alertas inteligentes',  chave: 'limite_alertas',  icon: Bell      },
  { label: 'Exportações',           chave: 'limite_exports',  icon: Download  },
  { label: 'Acesso à API',          chave: 'limite_api',      icon: Globe     },
];

const FAQS = [
  { q: 'Posso cancelar a qualquer momento?', r: 'Sim. Não há fidelidade. Você pode cancelar ou fazer downgrade quando quiser, sem multas.' },
  { q: 'Os dados são da Receita Federal oficial?', r: 'Sim. Utilizamos dados públicos do Brasil.IO (Receita Federal) atualizados mensalmente.' },
  { q: 'Existe período de teste gratuito?', r: 'O plano Free já é gratuito para sempre. Planos pagos têm 7 dias de teste sem cobrança.' },
  { q: 'Como funciona o acesso à API?', r: 'Business libera 10.000 requisições REST/mês com chave de acesso configurável no painel.' },
];

// ─────────────────────────────────────────
// Componentes
// ─────────────────────────────────────────
function PlanCard({ plano, anual, planoAtual }: { plano: typeof PLANOS[0]; anual: boolean; planoAtual: string }) {
  const preco = anual ? plano.preco_anual : plano.preco_mensal;
  const isAtual = planoAtual === plano.id;
  const Icon = plano.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: PLANOS.indexOf(plano) * 0.1 }}
      className={cn(
        'relative glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-300',
        plano.popular && 'ring-2 ring-brand-blue/50 shadow-[0_0_40px_rgba(86,141,255,0.15)]',
      )}
    >
      {plano.popular && (
        <div className="bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest text-center py-2">
          ⭐ Mais Popular
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col gap-6">
        {/* Topo */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${plano.cor}18` }}>
              <Icon className="w-5 h-5" style={{ color: plano.cor }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-xl">{plano.nome}</h3>
              <p className="text-slate-500 text-xs">{plano.tagline}</p>
            </div>
          </div>

          <div className="flex items-end gap-2">
            {preco === 0 ? (
              <span className="text-4xl font-display font-bold text-white">Grátis</span>
            ) : (
              <>
                <span className="text-slate-500 text-sm self-start mt-2">R$</span>
                <span className="text-4xl font-display font-bold text-white">{preco.toLocaleString('pt-BR')}</span>
                <span className="text-slate-500 text-sm self-end mb-1">/mês</span>
              </>
            )}
          </div>
          {anual && preco > 0 && (
            <p className="text-emerald-400 text-xs font-semibold">
              💰 Economia de R$ {((plano.preco_mensal - plano.preco_anual) * 12).toLocaleString('pt-BR')}/ano no plano anual
            </p>
          )}
        </div>

        {/* Recursos */}
        <div className="space-y-3 flex-1">
          {plano.recursos.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              {r.ok ? (
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${plano.cor}20` }}>
                  <Check className="w-2.5 h-2.5" style={{ color: plano.cor }} />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <X className="w-2.5 h-2.5 text-slate-600" />
                </div>
              )}
              <span className={cn('text-sm', r.ok ? 'text-slate-300' : 'text-slate-600')}>{r.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isAtual ? (
          <div className="w-full py-3.5 rounded-xl border border-white/10 text-center font-display font-bold text-sm text-slate-400">
            Plano Atual
          </div>
        ) : (
          <button
            className={cn(
              'w-full py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]',
              plano.id === 'free'
                ? 'border border-white/10 text-slate-300 hover:bg-white/5'
                : 'text-white shadow-lg',
            )}
            style={plano.id !== 'free' ? { backgroundColor: plano.cor, boxShadow: `0 0 25px ${plano.cor}40` } : {}}
          >
            {plano.id === 'free' ? 'Usar Grátis' : `Assinar ${plano.nome}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────
export default function Plans() {
  const [anual, setAnual] = useState(false);
  const [planoAtual] = useState('free'); // Futuramente virá do Supabase Auth

  return (
    <div className="space-y-16 max-w-6xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-semibold mb-2">
          <Sparkles className="w-4 h-4" /> Escolha o plano ideal para seu negócio
        </div>
        <h1 className="text-5xl font-display font-bold tracking-tight text-white">
          Planos e Assinaturas
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Inteligência empresarial com dados reais da Receita Federal. Sem fidelidade, cancele quando quiser.
        </p>

        {/* Toggle mensal / anual */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <span className={cn('text-sm font-semibold', !anual ? 'text-white' : 'text-slate-500')}>Mensal</span>
          <button
            onClick={() => setAnual(p => !p)}
            className={cn('relative w-14 h-7 rounded-full transition-all duration-300', anual ? 'bg-brand-blue' : 'bg-white/10')}
          >
            <div className={cn('absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300', anual ? 'left-8' : 'left-1')} />
          </button>
          <span className={cn('text-sm font-semibold flex items-center gap-2', anual ? 'text-white' : 'text-slate-500')}>
            Anual
            <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">-15%</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANOS.map(plano => (
          <PlanCard key={plano.id} plano={plano} anual={anual} planoAtual={planoAtual} />
        ))}
      </div>

      {/* Tabela comparativa */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h2 className="font-display text-2xl font-bold text-white">Comparativo Detalhado</h2>
          <p className="text-slate-500 text-sm mt-1">Veja exatamente o que cada plano inclui</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-8 py-4 text-xs font-display font-bold text-slate-500 uppercase tracking-widest">Recurso</th>
                {PLANOS.map(p => (
                  <th key={p.id} className="px-8 py-4 text-center">
                    <span className="text-sm font-display font-bold" style={{ color: p.cor }}>{p.nome}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPARATIVO.map(({ label, chave, icon: Icon }) => (
                <tr key={chave} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-300 font-medium">{label}</span>
                    </div>
                  </td>
                  {PLANOS.map(p => (
                    <td key={p.id} className="px-8 py-4 text-center">
                      <span className={cn(
                        'text-sm font-semibold',
                        (p as any)[chave] === '—' ? 'text-slate-600' : 'text-white'
                      )}>
                        {(p as any)[chave]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-white text-center">Perguntas Frequentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel p-6 rounded-2xl space-y-2"
            >
              <h4 className="font-display font-bold text-white text-sm">{faq.q}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.r}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Banner CTA */}
      <div className="relative glass-panel rounded-3xl p-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-purple/10 pointer-events-none" />
        <div className="relative space-y-4">
          <Crown className="w-12 h-12 text-brand-blue mx-auto" />
          <h2 className="text-3xl font-display font-bold text-white">Pronto para começar?</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Comece gratuitamente e faça upgrade quando precisar. Dados reais da Receita Federal ao seu alcance.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button className="px-8 py-3.5 bg-brand-blue text-white rounded-xl font-display font-bold text-sm shadow-[0_0_30px_rgba(86,141,255,0.4)] hover:scale-105 transition-all flex items-center gap-2">
              Começar Grátis <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 border border-white/10 text-slate-300 rounded-xl font-display font-bold text-sm hover:bg-white/5 transition-all">
              Falar com Especialista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
