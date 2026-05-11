import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, Star, MapPin,
  Building2, Calendar, ChevronLeft, ChevronRight,
  MoreVertical, RefreshCw, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { consultarEmpresas } from '@/lib/etl';
import { usePreferences } from '@/contexts/PreferenceContext';
import type { Empresa } from '@/lib/types';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

const EIXOS = ['Comércio','Indústria','Serviços','Agronegócio','Tecnologia','Saúde','Educação','Construção','Financeiro','Turismo'];

const EIXO_COLORS: Record<string, string> = {
  'Comércio':'#568dff','Serviços':'#00e3fd','Tecnologia':'#a078ff','Indústria':'#f43f5e',
  'Saúde':'#10b981','Educação':'#f59e0b','Construção':'#fb923c','Agronegócio':'#84cc16',
  'Financeiro':'#e879f9','Turismo':'#38bdf8','Outro':'#64748b',
};

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-white/5 rounded-xl', className)} />;
}

function EixoBadge({ eixo }: { eixo?: string }) {
  const color = EIXO_COLORS[eixo || 'Outro'] || '#64748b';
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}18`, color }}>
      {eixo || 'Outro'}
    </span>
  );
}

function formatCnpj(cnpj?: string) {
  if (!cnpj) return '—';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

interface CompaniesProps { onSelectCompany: (c: any) => void; }

export default function Companies({ onSelectCompany }: CompaniesProps) {
  const { uf: prefUf, cities: prefCities, isFiltered: prefActive } = usePreferences();
  const [empresas, setEmpresas]       = useState<Empresa[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [pagina, setPagina]           = useState(1);
  const POR_PAGINA = 20;

  // Filtros Locais
  const [busca, setBusca]             = useState('');
  const [buscaInput, setBuscaInput]   = useState('');
  const [uf, setUf]                   = useState('');
  const [eixo, setEixo]               = useState('');
  const [apenasMei, setApenasMei]     = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await consultarEmpresas({
        busca:      busca || undefined,
        uf:         prefUf || uf || undefined,
        municipios: prefCities.length > 0 ? prefCities : undefined,
        eixo:       eixo  || undefined,
        apenas_mei: apenasMei || undefined,
        pagina,
        por_pagina: POR_PAGINA,
      });
      setEmpresas((res.data || []) as Empresa[]);
      setTotal(res.count || 0);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [busca, uf, prefUf, prefCities, eixo, apenasMei, pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setBusca(buscaInput);
    setPagina(1);
  };

  const handleFiltro = () => { setPagina(1); carregar(); };

  const limparFiltros = () => {
    setUf(''); setEixo(''); setApenasAtivas(false); setApenasMei(false);
    setBusca(''); setBuscaInput(''); setPagina(1);
  };

  const hasFilters = uf || eixo || apenasAtivas || apenasMei || busca;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Base de Dados Empresarial</h1>
          <p className="text-slate-400 font-sans">
            {loading ? 'Carregando...' : `${total.toLocaleString('pt-BR')} empresas encontradas`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={carregar}
            disabled={loading}
            className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Atualizar
          </button>
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filtros laterais */}
        <aside className="lg:col-span-3 space-y-4 h-fit sticky top-28">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <button
              onClick={() => setFiltersOpen(p => !p)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all"
            >
              <span className="font-display font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-blue" /> Filtros
                {hasFilters && <span className="w-2 h-2 bg-brand-blue rounded-full" />}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', !filtersOpen && '-rotate-90')} />
            </button>

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-4">
                    {/* UF */}
                    <div className="space-y-2">
                      <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest">
                        Estado (UF) {prefUf && <span className="text-brand-blue text-[8px] ml-1">(Foco Ativo)</span>}
                      </label>
                      <div className="relative">
                        <select
                          value={prefUf || uf}
                          disabled={!!prefUf}
                          onChange={e => { setUf(e.target.value); setPagina(1); }}
                          className={cn(
                            "w-full appearance-none bg-white/5 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all [&>option]:text-black",
                            prefUf && "opacity-50 cursor-not-allowed border-brand-blue/30"
                          )}
                        >
                          <option value="">Todos os estados</option>
                          {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Cidades (Exibição apenas se foco ativo) */}
                    {prefCities.length > 0 && (
                       <div className="space-y-2">
                         <label className="text-xs font-display font-bold text-brand-purple uppercase tracking-widest">Cidades Focadas</label>
                         <div className="flex flex-wrap gap-1.5">
                            {prefCities.map(c => (
                              <span key={c} className="bg-brand-purple/10 text-brand-purple text-[9px] font-bold px-2 py-0.5 rounded border border-brand-purple/20 uppercase">{c}</span>
                            ))}
                         </div>
                       </div>
                    )}

                    {/* Eixo */}
                    <div className="space-y-2">
                      <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest">Eixo Econômico</label>
                      <div className="relative">
                        <select
                          value={eixo}
                          onChange={e => { setEixo(e.target.value); setPagina(1); }}
                          className="w-full appearance-none bg-white/5 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all [&>option]:text-black"
                        >
                          <option value="">Todos os eixos</option>
                          {EIXOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Toggles */}
                    {[
                      { label: 'Apenas MEI', desc: 'Microempreendedores', value: apenasMei, set: setApenasMei },
                    ].map(({ label, desc, value, set }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{label}</p>
                          <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                        <button
                          onClick={() => { set(!value); setPagina(1); }}
                          className={cn('relative w-10 h-5 rounded-full transition-all', value ? 'bg-brand-blue' : 'bg-white/10')}
                        >
                          <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', value ? 'left-5' : 'left-0.5')} />
                        </button>
                      </div>
                    ))}

                    {hasFilters && (
                      <button
                        onClick={limparFiltros}
                        className="w-full py-2 rounded-xl text-xs text-red-400 border border-red-400/20 hover:bg-red-400/5 transition-all flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Limpar todos os filtros
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Tabela principal */}
        <div className="lg:col-span-9 space-y-4">
          {/* Barra de busca */}
          <form onSubmit={handleBusca} className="glass-panel p-2 rounded-2xl flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
              <input
                type="text"
                value={buscaInput}
                onChange={e => setBuscaInput(e.target.value)}
                placeholder="Busca por CNPJ, Razão Social ou Nome Fantasia..."
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm outline-none placeholder-slate-600"
              />
            </div>
            {buscaInput && (
              <button type="button" onClick={() => { setBuscaInput(''); setBusca(''); setPagina(1); }}
                className="p-2 text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit"
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:scale-105 transition-all">
              Buscar
            </button>
          </form>

          {/* Tabela */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.15em] bg-white/[0.02]">
                    <th className="px-6 py-4">Empresa</th>
                    <th className="px-6 py-4">CNPJ</th>
                    <th className="px-6 py-4">Cidade / UF</th>
                    <th className="px-6 py-4">Eixo</th>
                    <th className="px-6 py-4">Abertura</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
                        ))}
                      </tr>
                    ))
                  ) : empresas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-400 font-semibold">Nenhuma empresa encontrada</p>
                        <p className="text-slate-600 text-sm mt-1">
                          {hasFilters ? 'Tente ajustar os filtros' : 'Importe dados via Central de Importação'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {empresas.map((emp, i) => (
                        <motion.tr
                          key={emp.cnpj}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          onClick={() => onSelectCompany(emp)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center font-display font-bold text-brand-blue text-xs shrink-0">
                                {(emp.nome_fantasia || emp.razao_social || '?').charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm group-hover:text-brand-blue transition-colors truncate max-w-[180px]">
                                  {emp.nome_fantasia || emp.razao_social}
                                </p>
                                {emp.nome_fantasia && (
                                  <p className="text-slate-600 text-xs truncate max-w-[180px]">{emp.razao_social}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">{formatCnpj(emp.cnpj)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              {[emp.municipio, emp.uf].filter(Boolean).join(', ') || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4"><EixoBadge eixo={emp.eixo_economico} /></td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {emp.data_abertura
                              ? new Date(emp.data_abertura + 'T12:00:00').toLocaleDateString('pt-BR')
                              : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                              emp.descricao_situacao_cadastral === 'ATIVA'
                                ? 'bg-emerald-400/10 text-emerald-400'
                                : 'bg-slate-500/10 text-slate-500'
                            )}>
                              {emp.descricao_situacao_cadastral || 'N/D'}
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-display">
                {loading ? '...' : `Página ${pagina} de ${totalPaginas} • ${total.toLocaleString('pt-BR')} registros`}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagina <= 1 || loading}
                  onClick={() => setPagina(p => p - 1)}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pg = Math.max(1, Math.min(pagina - 2, totalPaginas - 4)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPagina(pg)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-bold font-display transition-all',
                        pg === pagina ? 'bg-brand-blue text-white shadow-[0_0_15px_rgba(86,141,255,0.4)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      )}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  disabled={pagina >= totalPaginas || loading}
                  onClick={() => setPagina(p => p + 1)}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
