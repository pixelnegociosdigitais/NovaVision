import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, X, Plus, ChevronDown, Check, 
  Search, Shield, Info, Building2, TrendingUp,
  Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import { buscarCidadesPorEstado } from '@/lib/etl';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function FocusSettings() {
  const { uf, cities, setUf, setCities, clearPreferences } = usePreferences();
  const [cityInput, setCityInput] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Carregar cidades do estado selecionado
  useEffect(() => {
    async function load() {
      if (!uf) {
        setAvailableCities([]);
        return;
      }
      setLoadingCities(true);
      try {
        const list = await buscarCidadesPorEstado(uf);
        setAvailableCities(list);
      } finally {
        setLoadingCities(false);
      }
    }
    load();
  }, [uf]);

  // Filtrar sugestões conforme o usuário digita
  useEffect(() => {
    if (cityInput.trim() && availableCities.length > 0) {
      const query = cityInput.toLowerCase();
      const filtered = availableCities
        .filter(c => c.toLowerCase().includes(query) && !cities.includes(c))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [cityInput, availableCities, cities]);

  // Fechar sugestões ao clicar fora
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Foco Econômico Regional</h1>
          <p className="text-slate-400 font-sans">Personalize a abrangência dos dados em toda a plataforma Nova Vision.</p>
        </div>
        {uf && (
          <button 
            onClick={clearPreferences}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-400/10 text-red-400 font-display font-bold text-sm border border-red-400/20 hover:bg-red-400/20 transition-all"
          >
            <X className="w-4 h-4" /> Resetar para Nacional
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Configuração */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                <Globe className="text-brand-blue w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Definição de Área</h3>
                <p className="text-slate-500 text-sm">Escolha o estado e as cidades de atuação.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Seleção de Estado */}
              <div className="space-y-3">
                <label className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  1. Selecione o Estado Prioritário
                </label>
                <div className="relative">
                  <select
                    value={uf}
                    onChange={e => { setUf(e.target.value); setCities([]); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none cursor-pointer"
                  >
                    <option value="">Brasil (Visão Nacional Completa)</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Seleção de Cidades */}
              <AnimatePresence mode="wait">
                {uf ? (
                  <motion.div
                    key="cities"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3 relative" ref={suggestionRef}>
                      <label className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        2. Adicione as Cidades Focadas
                        {loadingCities && <Loader2 className="w-3 h-3 animate-spin text-brand-blue" />}
                      </label>
                      <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-purple transition-colors" />
                        <input
                          type="text"
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          onFocus={() => cityInput.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder={loadingCities ? "Sincronizando cidades..." : "Digite o nome da cidade (ex: Marau)"}
                          disabled={loadingCities}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600"
                        />
                      </div>

                      {/* Sugestões */}
                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#121212] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                          >
                            {suggestions.map((s, i) => (
                              <button
                                key={s}
                                onClick={() => handleAddCity(s)}
                                className="w-full flex items-center justify-between px-6 py-4 text-sm text-slate-300 hover:bg-brand-purple/10 hover:text-white transition-all text-left border-b border-white/5 last:border-0 group"
                              >
                                <span className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 text-slate-600 group-hover:text-brand-purple" />
                                  {s}
                                </span>
                                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chips de Cidades */}
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[100px] p-6 bg-white/3 rounded-2xl border border-dashed border-white/10">
                      {cities.length > 0 ? (
                        cities.map(c => (
                          <motion.span
                            key={c}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-xl text-xs font-bold uppercase tracking-wider group hover:bg-brand-purple/20 transition-all"
                          >
                            {c}
                            <button onClick={() => removeCity(c)} className="text-brand-purple/50 hover:text-white transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </motion.span>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full py-4 text-slate-600">
                           <Info className="w-6 h-6 mb-2 opacity-30" />
                           <p className="text-xs text-center italic">Nenhuma cidade selecionada.<br/>A plataforma mostrará dados de todo o estado de {uf}.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-uf"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-10 bg-brand-blue/5 border border-brand-blue/10 rounded-[2rem] flex flex-col items-center text-center space-y-4"
                  >
                    <Globe className="w-12 h-12 text-brand-blue opacity-20" />
                    <p className="text-sm text-slate-400 max-w-xs">
                      Selecione um estado para liberar a filtragem por municípios específicos.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Lado Direito: Preview/Info */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border-brand-blue/20">
             <h4 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-blue" /> Visão de Foco Ativa
             </h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Escopo</span>
                   <span className="text-xs text-white font-bold">{uf ? 'Regional' : 'Nacional'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Estado</span>
                   <span className="text-xs text-brand-blue font-bold">{uf || 'Brasil'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Cidades</span>
                   <span className="text-xs text-brand-purple font-bold">{cities.length || (uf ? 'Todas' : 'N/A')}</span>
                </div>
             </div>
             
             <div className="mt-8 p-4 bg-white/5 rounded-2xl space-y-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Impacto nos Dados</p>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-400/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                   </div>
                   <p className="text-[11px] text-slate-300">Seus gráficos e indicadores serão calculados apenas para esta região.</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-brand-blue/10 rounded-lg">
                      <Building2 className="w-4 h-4 text-brand-blue" />
                   </div>
                   <p className="text-[11px] text-slate-300">A base de dados exibirá apenas empresas localizadas neste foco.</p>
                </div>
             </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
             <div className="relative z-10 space-y-4">
                <h4 className="font-display font-bold text-white text-sm">Precisa de mais regiões?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                   Assinantes Enterprise Master podem salvar múltiplos perfis de foco para alternância rápida.
                </p>
                <button className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest hover:underline">
                   Saiba mais <ArrowRight className="w-3 h-3" />
                </button>
             </div>
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
