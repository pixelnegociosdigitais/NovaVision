import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, X, Plus, ChevronDown, Check, 
  Search, Shield, Info, Building2, TrendingUp,
  Loader2, ArrowRight, Calendar, UserCheck, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import { buscarCidadesIbge } from '@/lib/etl';

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

export default function FocusSettings() {
  const { 
    uf, cities, apenasMei, dataInicio, dataFim,
    setUf, setCities, setApenasMei, setDataInicio, setDataFim,
    clearPreferences 
  } = usePreferences();

  const [cityInput, setCityInput] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!uf) {
        setAllCities([]);
        return;
      }
      setLoadingCities(true);
      try {
        const res = await buscarCidadesIbge(uf);
        setAllCities(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCities(false);
      }
    }
    load();
  }, [uf]);

  useEffect(() => {
    if (!cityInput.trim() || cityInput.length < 2 || allCities.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const query = cityInput.toLowerCase();
    const filtered = allCities
      .filter(c => c.toLowerCase().includes(query) && !cities.includes(c))
      .slice(0, 10);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [cityInput, allCities, cities]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAddCity = (cityName: string) => {
    const city = cityName.trim().toUpperCase();
    if (city && !cities.includes(city)) {
      setCities([...cities, city]);
    }
    setCityInput('');
    setShowSuggestions(false);
  };

  const removeCity = (cityToRemove: string) => {
    setCities(cities.filter(c => c !== cityToRemove));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Foco Econômico Regional</h1>
          <p className="text-slate-400 font-sans">Defina os critérios globais que filtrarão todos os dados da plataforma.</p>
        </div>
        {(uf || apenasMei || dataInicio || dataFim) && (
          <button 
            onClick={clearPreferences}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-400/10 text-red-400 font-display font-bold text-sm border border-red-400/20 hover:bg-red-400/20 transition-all shadow-lg shadow-red-400/5"
          >
            <X className="w-4 h-4" /> Limpar Todos os Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal: Localização e Filtros Avançados */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SEÇÃO 1: LOCALIZAÇÃO */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Globe className="w-32 h-32 text-brand-blue" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                <MapPin className="text-brand-blue w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Localização Prioritária</h3>
                <p className="text-slate-500 text-sm">Estado e municípios de atuação.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Estado */}
              <div className="space-y-3">
                <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  1. Selecione o Estado
                </label>
                <div className="relative">
                  <select
                    value={uf}
                    onChange={e => { setUf(e.target.value); setCities([]); setCityInput(''); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none cursor-pointer hover:bg-white/[0.08]"
                  >
                    <option value="">Todo o Brasil (Nacional)</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Cidades */}
              <div className="space-y-3 relative" ref={suggestionRef}>
                <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  2. Adicionar Municípios
                  {loadingCities && <Loader2 className="w-3 h-3 animate-spin text-brand-blue" />}
                </label>
                <div className="relative group">
                  <Search className={cn(
                    "absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                    uf && !loadingCities ? "text-brand-purple" : "text-slate-700"
                  )} />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={e => setCityInput(e.target.value)}
                    disabled={!uf || loadingCities}
                    placeholder={!uf ? "Selecione um estado primeiro" : loadingCities ? "Sincronizando..." : "Digite o nome da cidade..."}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600 disabled:opacity-30"
                  />
                </div>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,1)] overflow-hidden"
                    >
                      <div className="max-h-[280px] overflow-y-auto">
                        {suggestions.map((s) => (
                          <button
                            key={s} onClick={() => handleAddCity(s)}
                            className="w-full flex items-center justify-between px-6 py-4 text-sm text-slate-300 hover:bg-brand-purple/10 hover:text-white transition-all text-left group border-b border-white/5 last:border-0"
                          >
                            <span className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-slate-600 group-hover:text-brand-purple" />
                              {s}
                            </span>
                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-purple" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Listagem de Cidades */}
            <AnimatePresence mode="wait">
              {uf && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="pt-6 border-t border-white/5 space-y-4"
                >
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cidades Ativas ({cities.length})</p>
                  <div className="flex flex-wrap gap-2.5">
                    {cities.length > 0 ? (
                      cities.map(c => (
                        <motion.span
                          key={c} layout initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-xl text-xs font-bold uppercase tracking-wider group"
                        >
                          {c}
                          <button onClick={() => removeCity(c)} className="hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                        </motion.span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">Todo o estado de {uf} está sendo monitorado.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEÇÃO 2: FILTROS GLOBAIS (NOVO) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtro MEI */}
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
                  <UserCheck className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Perfil de Empresa</h3>
                  <p className="text-slate-500 text-sm">Filtre por porte empresarial.</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-all group">
                <div>
                  <p className="font-display font-bold text-white text-sm">Apenas MEI</p>
                  <p className="text-xs text-slate-500">Microempreendedores Individuais</p>
                </div>
                <button 
                  onClick={() => setApenasMei(!apenasMei)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all duration-300",
                    apenasMei ? "bg-emerald-400" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md",
                    apenasMei ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
              
              <div className="flex gap-3 p-4 bg-emerald-400/5 rounded-2xl border border-emerald-400/10">
                 <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-slate-400 leading-relaxed">
                   Quando ativo, todas as listagens e gráficos mostrarão exclusivamente dados de MEIs.
                 </p>
              </div>
            </div>

            {/* Filtro de Período */}
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                  <Calendar className="text-amber-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Período de Abertura</h3>
                  <p className="text-slate-500 text-sm">Defina o intervalo cronológico.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Início</label>
                    <input 
                      type="date"
                      value={dataInicio}
                      onChange={e => setDataInicio(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Fim</label>
                    <input 
                      type="date"
                      value={dataFim}
                      onChange={e => setDataFim(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                {dataInicio && dataFim && (
                  <button 
                    onClick={() => { setDataInicio(''); setDataFim(''); }}
                    className="text-[10px] text-slate-500 hover:text-amber-400 font-bold uppercase transition-colors"
                  >
                    Limpar Datas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Resumo */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border-brand-blue/20 sticky top-28">
             <div className="flex items-center gap-2 mb-8">
                <Filter className="w-4 h-4 text-brand-blue" />
                <h4 className="font-display font-bold text-white uppercase text-[10px] tracking-widest">Foco de Pesquisa Ativo</h4>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-3">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Território</p>
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center text-brand-blue font-display font-bold text-lg">
                         {uf || 'BR'}
                      </div>
                      <div>
                        <p className="text-lg font-display font-bold text-white leading-none">{uf ? 'Regional' : 'Nacional'}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          {cities.length > 0 ? `${cities.length} cidade(s)` : (uf ? 'Todas as cidades' : 'Brasil Completo')}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Perfil</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                        apenasMei ? "bg-emerald-400/10 text-emerald-400" : "bg-white/5 text-slate-400"
                      )}>{apenasMei ? 'Apenas MEI' : 'Todas as Empresas'}</span>
                   </div>
                   
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Período</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                        dataInicio ? "bg-amber-400/10 text-amber-400" : "bg-white/5 text-slate-400"
                      )}>{dataInicio ? `${new Date(dataInicio).getFullYear()} - ${new Date(dataFim).getFullYear()}` : 'Vitalício'}</span>
                   </div>
                </div>
             </div>
             
             <div className="mt-12 p-6 bg-white/3 rounded-[2.5rem] border border-white/5 space-y-5">
                <div className="flex gap-4">
                   <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Os gráficos de evolução de aberturas e distribuição setorial seguirão estes filtros.</p>
                </div>
                <div className="flex gap-4">
                   <Building2 className="w-5 h-5 text-brand-blue shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed font-medium">A exportação de dados e a malha societária serão restritas a este recorte.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
