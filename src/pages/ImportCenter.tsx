import React, { useState, useRef, useEffect } from 'react';
import {
  Download, Play, RotateCcw, CheckCircle2, XCircle,
  Database, Filter, Calendar, MapPin, Building2,
  Loader2, ChevronDown, AlertTriangle, Zap, Info,
  BarChart3, Clock, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { executarETL, buscarEstatisticas } from '@/lib/etl';
import { registrarLog } from '@/lib/activity';
import type { ETLConfig, ETLResult } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────
// Constantes de opções de filtros
// ─────────────────────────────────────────
const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const EIXOS_CNAE = [
  { label: 'Comércio (45–47)', value: '4' },
  { label: 'Serviços (69–82)', value: '6' },
  { label: 'Tecnologia (58–63)', value: '6' },
  { label: 'Saúde (86–88)', value: '8' },
  { label: 'Indústria (10–33)', value: '1' },
  { label: 'Construção (41–43)', value: '4' },
  { label: 'Agronegócio (01–03)', value: '0' },
  { label: 'Todos os setores', value: '' },
];

const LIMITS = [25, 50, 100, 200, 500];

// ─────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
      <div className={cn('p-3 rounded-xl', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-white">{value.toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
}

function SelectField({ label, icon: Icon, value, onChange, children }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white/5 border border-white/10 text-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all cursor-pointer [&>option]:text-black"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, placeholder, value, onChange, type = 'text' }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
      />
    </div>
  );
}

function LogLine({ line }: { line: string }) {
  const isError = line.includes('❌') || line.includes('Erro');
  const isSuccess = line.includes('✅');
  const isInfo = line.includes('🔍') || line.includes('📦') || line.includes('⚙️');

  return (
    <div className={cn(
      'font-mono text-xs px-3 py-1.5 rounded-lg border',
      isError && 'text-red-400 bg-red-500/5 border-red-500/10',
      isSuccess && 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
      isInfo && 'text-brand-cyan bg-brand-cyan/5 border-brand-cyan/10',
      !isError && !isSuccess && !isInfo && 'text-slate-400 bg-white/3 border-white/5'
    )}>
      <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString('pt-BR')}]</span>
      {line}
    </div>
  );
}

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────
export default function ImportCenter() {
  const [config, setConfig] = useState<ETLConfig>({
    fonte: 'brasilio',
    municipio: '',
    uf: '',
    cnae_prefix: '',
    data_inicio: '',
    data_fim: '',
    apenas_mei: false,
    limit: 100,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<ETLResult | null>(null);
  const [stats, setStats] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buscarEstatisticas().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setLogs([]);
    setResult(null);

    registrarLog('Iniciou Importação', `${config.municipio || config.uf || 'Geral'}`);
    addLog('🚀 Iniciando pipeline ETL Nova Vision...');

    const etlResult = await executarETL(config, addLog);
    setResult(etlResult);
    setIsRunning(false);

    registrarLog('Finalizou Importação', `${config.municipio || config.uf || 'Geral'}`, { processados: etlResult.total_salvos, erros: etlResult.total_erros });

    // Atualizar estatísticas
    buscarEstatisticas().then(setStats).catch(() => {});
  };

  const handleReset = () => {
    setLogs([]);
    setResult(null);
    setConfig({
      fonte: 'brasilio',
      municipio: '',
      uf: '',
      cnae_prefix: '',
      data_inicio: '',
      data_fim: '',
      apenas_mei: false,
      limit: 100,
    });
  };

  const now = new Date();
  const last30 = new Date(now); last30.setDate(now.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand-blue/10 rounded-xl border border-brand-blue/20">
              <Download className="w-6 h-6 text-brand-blue" />
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-white">
              Central de Importação
            </h1>
          </div>
          <p className="text-slate-400 ml-[52px]">
            Pipeline ETL: busca empresas na Receita Federal e sincroniza com o banco de dados
          </p>
        </div>
        <div className="flex items-center gap-2 glass-panel px-4 py-2.5 rounded-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Brasil.IO Conectado</span>
        </div>
      </div>

      {/* Stats do banco */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total no Banco" value={stats.total_empresas} icon={Database} color="bg-brand-blue/10 text-brand-blue" />
          <StatCard label="Últimos 7 dias" value={stats.abertas_7d} icon={Zap} color="bg-brand-cyan/10 text-brand-cyan" />
          <StatCard label="Últimos 30 dias" value={stats.abertas_30d} icon={BarChart3} color="bg-brand-purple/10 text-brand-purple" />
          <StatCard label="Últimos 90 dias" value={stats.abertas_90d} icon={Clock} color="bg-amber-500/10 text-amber-400" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ─── Painel de Configuração ─── */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <Filter className="w-5 h-5 text-brand-blue" />
            <h2 className="font-display font-bold text-white">Configurar Importação</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Fonte */}
            <SelectField label="Fonte de Dados" icon={Database} value={config.fonte} onChange={(v: any) => setConfig(p => ({ ...p, fonte: v }))}>
              <option value="brasilio">Brasil.IO (Receita Federal — Lote)</option>
              <option value="brasilapi" disabled>BrasilAPI (somente CNPJ individual)</option>
            </SelectField>

            {/* Município */}
            <InputField
              label="Município"
              icon={MapPin}
              placeholder="Ex: MARAU, SAO PAULO..."
              value={config.municipio || ''}
              onChange={(v: string) => setConfig(p => ({ ...p, municipio: v }))}
            />

            {/* UF */}
            <SelectField label="Estado (UF)" icon={MapPin} value={config.uf || ''} onChange={(v: string) => setConfig(p => ({ ...p, uf: v }))}>
              <option value="">Todos os estados</option>
              {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </SelectField>

            {/* CNAE / Eixo */}
            <SelectField label="Setor / CNAE" icon={Building2} value={config.cnae_prefix || ''} onChange={(v: string) => setConfig(p => ({ ...p, cnae_prefix: v }))}>
              {EIXOS_CNAE.map(e => <option key={e.label} value={e.value}>{e.label}</option>)}
            </SelectField>

            {/* Período */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Data Início"
                icon={Calendar}
                type="date"
                value={config.data_inicio || ''}
                onChange={(v: string) => setConfig(p => ({ ...p, data_inicio: v }))}
              />
              <InputField
                label="Data Fim"
                icon={Calendar}
                type="date"
                value={config.data_fim || ''}
                onChange={(v: string) => setConfig(p => ({ ...p, data_fim: v }))}
              />
            </div>

            {/* Limit */}
            <SelectField label="Limite de Registros" icon={BarChart3} value={String(config.limit)} onChange={(v: string) => setConfig(p => ({ ...p, limit: parseInt(v) }))}>
              {LIMITS.map(l => <option key={l} value={l}>{l} registros</option>)}
            </SelectField>

            {/* MEI Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-semibold text-slate-200">Apenas MEI</p>
                <p className="text-xs text-slate-500 mt-0.5">Filtrar somente Microempreendedores</p>
              </div>
              <button
                onClick={() => setConfig(p => ({ ...p, apenas_mei: !p.apenas_mei }))}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-all duration-300',
                  config.apenas_mei ? 'bg-brand-blue' : 'bg-white/10'
                )}
              >
                <div className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300',
                  config.apenas_mei ? 'left-7' : 'left-1'
                )} />
              </button>
            </div>

            {/* Atalho: últimos 30 dias */}
            <button
              onClick={() => setConfig(p => ({ ...p, data_inicio: fmt(last30), data_fim: fmt(now) }))}
              className="w-full py-2 text-xs text-brand-cyan font-semibold hover:underline flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> Definir período: últimos 30 dias
            </button>

            {/* Botões de ação */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                disabled={isRunning}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-display font-semibold text-sm hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" /> Limpar
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex-[2] py-3 rounded-xl bg-brand-blue text-white font-display font-bold text-sm shadow-[0_0_25px_rgba(86,141,255,0.3)] hover:scale-105 hover:shadow-[0_0_35px_rgba(86,141,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:scale-100"
              >
                {isRunning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Executando...</>
                ) : (
                  <><Play className="w-4 h-4" /> Executar ETL</>
                )}
              </button>
            </div>

            {/* Aviso */}
            <div className="flex gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/70 leading-relaxed">
                O Brasil.IO usa dados públicos da Receita Federal. Respeite os limites da API e configure seu token em <code className="text-amber-300">.env.local</code>.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Log de Execução + Resultado ─── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Log Terminal */}
          <div className="glass-panel rounded-3xl overflow-hidden flex-1">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500/60 rounded-full" />
                  <div className="w-3 h-3 bg-amber-500/60 rounded-full" />
                  <div className="w-3 h-3 bg-emerald-500/60 rounded-full" />
                </div>
                <span className="font-mono text-sm text-slate-400">etl.pipeline.log</span>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2 text-brand-cyan text-xs font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processando...
                </div>
              )}
            </div>

            <div className="p-5 h-72 overflow-y-auto space-y-1.5 scrollbar-thin">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Database className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Configure os filtros e clique em <strong>Executar ETL</strong></p>
                  <p className="text-xs mt-1">Os logs de progresso aparecerão aqui em tempo real</p>
                </div>
              )}
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <LogLine line={log} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Resultado */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl overflow-hidden"
              >
                <div className={cn(
                  'p-5 border-b border-white/5 flex items-center gap-3',
                  result.total_erros === 0 ? '' : 'border-amber-500/10'
                )}>
                  {result.total_salvos > 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <h3 className="font-display font-bold text-white">Resultado do Pipeline</h3>
                </div>

                <div className="p-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
                    <p className="text-3xl font-display font-bold text-brand-blue">{result.total_buscados}</p>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Buscados</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <p className="text-3xl font-display font-bold text-emerald-400">{result.total_salvos}</p>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Salvos</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <p className="text-3xl font-display font-bold text-red-400">{result.total_erros}</p>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Erros</p>
                  </div>
                </div>

                {result.erros.length > 0 && (
                  <div className="px-6 pb-6 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" /> Detalhes dos erros
                    </div>
                    {result.erros.map((e, i) => (
                      <div key={i} className="font-mono text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                        {e}
                      </div>
                    ))}
                  </div>
                )}

                {result.total_salvos > 0 && (
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-xs text-emerald-300/80">
                        <strong>{result.total_salvos} empresas</strong> sincronizadas com sucesso no Supabase. Acesse a aba <strong>Empresas</strong> para visualizá-las.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
