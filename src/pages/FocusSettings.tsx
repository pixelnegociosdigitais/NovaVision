import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, X, Plus, ChevronDown, Check, 
  Search, Shield, Info, Building2, TrendingUp,
  Loader2, ArrowRight, Calendar, UserCheck, Filter,
  Save, CheckCircle2
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
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Mostrar feedback de salvamento automático
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

  const handleManualSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showSavedFeedback('Configurações salvas');
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Foco Econômico Regional</h1>
          <p className="text-slate-400 font-sans">Configurações globais salvas automaticamente para toda a plataforma.</p>
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
          
          {/* SEÇÃO 1: LOCALIZAÇÃO */}
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe className="w-32 h-32 text-brand-blue" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                <MapPin className="text-brand-blue w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Área de Atuação</h3>
                <p className="text-slate-500 text-sm">Estado e municípios onde a inteligência será aplicada.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  Estado Prioritário
                </label>
                <div className="relative">
                  <select
                    value={uf}
                    onChange={e => { 
                      setUf(e.target.value); 
                      setCities([]); 
                      setCityInput(''); 
                      showSavedFeedback('Estado alterado');
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none cursor-pointer hover:bg-white/[0.08]"
                  >
                    <option value="">Brasil Completo</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3 relative" ref={suggestionRef}>
                <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  Adicionar Cidades
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
                    placeholder={!uf ? "Selecione o estado" : loadingCities ? "Sincronizando..." : "Digite para buscar..."}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600 disabled:opacity-30"
                  />
                </div>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,1)] overflow-hidden"
                    >
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
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

            <AnimatePresence mode="wait">
              {uf && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="pt-6 border-t border-white/5 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cidades no Foco Ativo ({cities.length})</p>
                    {cities.length > 0 && (
                      <button 
                        onClick={() => { setCities([]); showSavedFeedback('Cidades removidas'); }}
                        className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase font-bold"
                      >
                        Limpar Cidades
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {cities.length > 0 ? (
                      cities.map(c => (
                        <motion.span
                          key={c} layout initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-xl text-xs font-bold uppercase tracking-wider group hover:bg-brand-purple/20 transition-all"
                        >
                          {c}
                          <button onClick={() => removeCity(c)} className="text-brand-purple/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                        </motion.span>
                      ))
                    ) : (
                      <div className="p-10 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl w-full flex flex-col items-center justify-center text-slate-700">
                        <MapPin className="w-8 h-8 mb-2 opacity-10" />
                        <p className="text-xs italic">Nenhuma cidade específica. O foco será em todo o estado de {uf}.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEÇÃO 2: PREFERÊNCIAS AVANÇADAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 group hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Perfil Empresarial</h3>
                  <p className="text-slate-500 text-sm">Filtro por porte de negócio.</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-all">
                <div>
                  <p className="font-display font-bold text-white text-sm">Apenas MEI</p>
                  <p className="text-xs text-slate-500">Microempreendedores Individuais</p>
                </div>
                <button 
                  onClick={() => { 
                    setApenasMei(!apenasMei); 
                    showSavedFeedback(apenasMei ? 'Todos os portes' : 'Filtro MEI ativo');
                  }}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all duration-300",
                    apenasMei ? "bg-emerald-400" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg",
                    apenasMei ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 group hover:border-amber-400/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="text-amber-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Janela Temporal</h3>
                  <p className="text-slate-500 text-sm">Filtrar por data de abertura.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Data Inicial</label>
                  <input 
                    type="date" value={dataInicio}
                    onChange={e => { setDataInicio(e.target.value); showSavedFeedback('Início alterado'); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Data Final</label>
                  <input 
                    type="date" value={dataFim}
                    onChange={e => { setDataFim(e.target.value); showSavedFeedback('Fim alterado'); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA LATERAL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border-brand-blue/20 sticky top-28">
             <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-6">
                <Shield className="w-5 h-5 text-brand-blue" />
                <div>
                   <h4 className="font-display font-bold text-white text-xs uppercase tracking-widest">Foco Configurado</h4>
                   <p className="text-[10px] text-slate-500 font-medium">Status da Filtragem Global</p>
                </div>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-3">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Localização Ativa</p>
                   <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 rounded-xl bg-brand-blue text-white flex items-center justify-center font-display font-bold text-xl shadow-lg shadow-brand-blue/20">
                         {uf || 'BR'}
                      </div>
                      <div>
                        <p className="text-lg font-display font-bold text-white leading-none">{uf ? 'Foco Regional' : 'Visão Brasil'}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          {cities.length > 0 ? `${cities.length} município(s)` : (uf ? 'Todas as cidades do estado' : 'Sem restrição geográfica')}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Porte</p>
                      <p className={cn("text-xs font-bold", apenasMei ? "text-emerald-400" : "text-white")}>
                        {apenasMei ? 'MEI' : 'TODOS'}
                      </p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Período</p>
                      <p className={cn("text-xs font-bold", dataInicio ? "text-amber-400" : "text-white")}>
                        {dataInicio ? 'ATIVO' : 'LIVRE'}
                      </p>
                   </div>
                </div>
             </div>
             
             <div className="mt-12 space-y-4">
                <div className="flex gap-4 p-4 bg-white/3 rounded-2xl">
                   <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed">
                     As alterações são salvas automaticamente em seu navegador para garantir agilidade.
                   </p>
                </div>
                {(uf || apenasMei || dataInicio || dataFim) && (
                  <button 
                    onClick={clearPreferences}
                    className="w-full py-4 rounded-2xl text-xs font-bold uppercase text-slate-500 border border-white/5 hover:bg-red-400/10 hover:text-red-400 transition-all"
                  >
                    Resetar Todas as Preferências
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
