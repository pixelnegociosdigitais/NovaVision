import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, X, Plus, ChevronDown, Check, 
  Search, Shield, Info, Building2, TrendingUp,
  Loader2, ArrowRight, Calendar, UserCheck, Filter,
  Save, CheckCircle2, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import { buscarCidadesIbge } from '@/lib/etl';

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

const EIXOS_LIST = ['Comércio', 'Indústria', 'Serviços', 'Agronegócio', 'Tecnologia', 'Saúde', 'Educação', 'Construção', 'Financeiro', 'Turismo'];

export default function FocusSettings() {
  const { 
    uf, cities, apenasMei, dataInicio, dataFim, eixos,
    setUf, setCities, setApenasMei, setDataInicio, setDataFim, setEixos,
    clearPreferences 
  } = usePreferences();

  const [cityInput, setCityInput] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const showSavedFeedback = (field: string) => {
    setLastSaved(field);
    setTimeout(() => setLastSaved(null), 2000);
  };

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
      showSavedFeedback('Cidade adicionada');
    }
    setCityInput('');
    setShowSuggestions(false);
  };

  const removeCity = (cityToRemove: string) => {
    setCities(cities.filter(c => c !== cityToRemove));
    showSavedFeedback('Cidade removida');
  };

  const toggleEixo = (eixo: string) => {
    const newEixos = eixos.includes(eixo)
      ? eixos.filter(e => e !== eixo)
      : [...eixos, eixo];
    setEixos(newEixos);
    showSavedFeedback(newEixos.includes(eixo) ? `Eixo ${eixo} selecionado` : `Eixo ${eixo} removido`);
  };

  const handleManualSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showSavedFeedback('Configurações salvas');
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header com botões de ação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Foco Econômico Regional</h1>
          <p className="text-white/80 font-sans">Ajuste os filtros globais para segmentar a inteligência de dados.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {lastSaved}
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue text-white font-display font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-brand-blue/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. LOCALIZAÇÃO */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe className="w-32 h-32 text-brand-blue" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                <MapPin className="text-brand-blue w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Área Geográfica</h3>
                <p className="text-white/70 text-sm">Estado e municípios prioritários.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-display font-black text-white/70 uppercase tracking-[0.2em]">Estado</label>
                <div className="relative">
                  <select
                    value={uf}
                    onChange={e => { setUf(e.target.value); setCities([]); setCityInput(''); showSavedFeedback('Estado alterado'); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none cursor-pointer"
                  >
                    <option value="">Brasil (Visão Geral)</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3 relative" ref={suggestionRef}>
                <label className="text-[10px] font-display font-black text-white/70 uppercase tracking-[0.2em]">Cidades</label>
                <div className="relative group">
                  <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", uf ? "text-brand-purple" : "text-white/40")} />
                  <input
                    type="text" value={cityInput} onChange={e => setCityInput(e.target.value)}
                    disabled={!uf || loadingCities} placeholder={!uf ? "Selecione o estado" : "Buscar cidade..."}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-white/60 disabled:opacity-30"
                  />
                </div>
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,1)] overflow-hidden"
                    >
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {suggestions.map((s) => (
                          <button key={s} onClick={() => handleAddCity(s)} className="w-full flex items-center justify-between px-6 py-4 text-sm text-white/90 hover:bg-brand-purple/10 hover:text-white transition-all text-left group">
                            {s} <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-purple" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {uf && (
                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2.5">
                  {cities.length > 0 ? (
                    cities.map(c => (
                      <span key={c} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        {c} <button onClick={() => removeCity(c)} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-white/60 italic">Filtrando todo o estado de {uf}.</p>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. EIXO ECONÔMICO (NOVO) */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 flex items-center justify-center">
                <LayoutGrid className="text-brand-cyan w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Eixos Econômicos</h3>
                <p className="text-white/70 text-sm">Selecione um ou mais setores para filtrar os resultados.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {EIXOS_LIST.map((eixo) => {
                const active = eixos.includes(eixo);
                return (
                  <button
                    key={eixo}
                    onClick={() => toggleEixo(eixo)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all text-center space-y-2 group",
                      active 
                        ? "bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan shadow-lg shadow-brand-cyan/5" 
                        : "bg-white/3 border-white/5 text-white/70 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-colors",
                      active ? "bg-brand-cyan/20" : "bg-white/5"
                    )}>
                      {active ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest">{eixo}</span>
                  </button>
                );
              })}
            </div>
            
            {eixos.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
                  {eixos.length} eixo(s) selecionado(s)
                </p>
                <button onClick={() => { setEixos([]); showSavedFeedback('Eixos limpos'); }} className="text-[10px] text-red-400 hover:underline font-bold uppercase">Remover Filtro Setorial</button>
              </div>
            )}
          </div>

          {/* 3. PORTE E PERÍODO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
                  <UserCheck className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Porte da Empresa</h3>
                  <p className="text-white/70 text-sm">Filtro por categoria MEI.</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-all">
                <div>
                  <p className="font-display font-bold text-white text-sm">Apenas MEI</p>
                  <p className="text-xs text-white/70">Excluir outras naturezas</p>
                </div>
                <button 
                  onClick={() => { setApenasMei(!apenasMei); showSavedFeedback(apenasMei ? 'Todos os portes' : 'Apenas MEI ativo'); }}
                  className={cn("relative w-12 h-6 rounded-full transition-all duration-300", apenasMei ? "bg-emerald-400" : "bg-white/10")}
                >
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md", apenasMei ? "left-7" : "left-1")} />
                </button>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                  <Calendar className="text-amber-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Cronograma</h3>
                  <p className="text-white/70 text-sm">Data de fundação.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-display font-black text-white/70 uppercase tracking-widest text-center block">Início</label>
                  <input type="date" value={dataInicio} onChange={e => { setDataInicio(e.target.value); showSavedFeedback('Data alterada'); }} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-display font-black text-white/70 uppercase tracking-widest text-center block">Fim</label>
                  <input type="date" value={dataFim} onChange={e => { setDataFim(e.target.value); showSavedFeedback('Data alterada'); }} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none [color-scheme:dark]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA LATERAL: STATUS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border-brand-blue/20 sticky top-28">
             <div className="flex items-center gap-2 mb-8 pb-6 border-b border-white/5">
                <Shield className="w-5 h-5 text-brand-blue" />
                <div>
                  <h4 className="font-display font-bold text-white text-[10px] uppercase tracking-[0.2em]">Filtros Ativos</h4>
                  <p className="text-[9px] text-white/70 font-medium">Configuração Global Nova Vision</p>
                </div>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-3">
                   <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Localização</p>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-lg">{uf || 'BR'}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{uf ? 'Foco Regional' : 'Brasil Total'}</p>
                        <p className="text-[10px] text-white/70">{cities.length > 0 ? `${cities.length} cidade(s)` : (uf ? 'Estado Completo' : 'Nacional')}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Setores (Eixos)</p>
                   <div className="flex flex-wrap gap-1.5">
                      {eixos.length > 0 ? (
                        eixos.map(e => <span key={e} className="px-2 py-1 bg-brand-cyan/10 text-brand-cyan text-[9px] font-black uppercase rounded border border-brand-cyan/20">{e}</span>)
                      ) : <span className="text-xs text-white/60 italic">Todos os eixos</span>}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-white/70 font-black uppercase mb-1">Porte</p>
                      <p className={cn("text-xs font-bold", apenasMei ? "text-emerald-400" : "text-white")}>{apenasMei ? 'MEI' : 'TODOS'}</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-white/70 font-black uppercase mb-1">Período</p>
                      <p className={cn("text-xs font-bold", dataInicio ? "text-amber-400" : "text-white")}>{dataInicio ? 'ATIVO' : 'LIVRE'}</p>
                   </div>
                </div>
             </div>
             
             {(uf || apenasMei || dataInicio || dataFim || eixos.length > 0) && (
               <button onClick={clearPreferences} className="w-full mt-12 py-4 rounded-2xl text-[10px] font-black uppercase text-white/70 border border-white/5 hover:bg-red-400/10 hover:text-red-400 transition-all tracking-widest">
                 Resetar Foco Global
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
