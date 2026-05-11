import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, X, Plus, ChevronDown, Check, 
  Search, Shield, Info, Building2, TrendingUp,
  Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import { buscarCidadesSugestao } from '@/lib/etl';

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

export default function FocusSettings() {
  const { uf, cities, setUf, setCities, clearPreferences } = usePreferences();
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Busca sugestões em tempo real com debounce
  useEffect(() => {
    if (!cityInput.trim() || cityInput.length < 2 || !uf) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await buscarCidadesSugestao(uf, cityInput);
        // Filtrar as que já estão selecionadas
        const filtered = res.filter(c => !cities.includes(c));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cityInput, uf, cities]);

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
          <p className="text-slate-400 font-sans">Ajuste a abrangência da inteligência Nova Vision para regiões específicas.</p>
        </div>
        {uf && (
          <button 
            onClick={clearPreferences}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-400/10 text-red-400 font-display font-bold text-sm border border-red-400/20 hover:bg-red-400/20 transition-all"
          >
            <X className="w-4 h-4" /> Limpar Filtro Global
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                <Globe className="text-brand-blue w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">Configuração de Território</h3>
                <p className="text-slate-500 text-sm">Seus dados serão segmentados com base nas escolhas abaixo.</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Passo 1: Estado */}
              <div className="space-y-3">
                <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center text-[10px]">1</span>
                  Estado Prioritário
                </label>
                <div className="relative">
                  <select
                    value={uf}
                    onChange={e => { setUf(e.target.value); setCities([]); setCityInput(''); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none cursor-pointer"
                  >
                    <option value="">Brasil (Sem filtro regional)</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Passo 2: Cidades */}
              <AnimatePresence mode="wait">
                {uf ? (
                  <motion.div
                    key="cities-search"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3 relative" ref={suggestionRef}>
                      <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[10px]">2</span>
                        Cidades Focadas
                      </label>
                      <div className="relative group">
                        <Search className={cn(
                          "absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                          loadingSuggestions ? "text-brand-purple" : "text-slate-500"
                        )} />
                        <input
                          type="text"
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          placeholder="Digite o nome da cidade..."
                          className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600"
                        />
                        {loadingSuggestions && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-brand-purple animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Dropdown de Sugestões */}
                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#121212] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                          >
                            <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              Sugestões encontradas no {uf}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                              {suggestions.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleAddCity(s)}
                                  className="w-full flex items-center justify-between px-6 py-4 text-sm text-slate-300 hover:bg-brand-purple/10 hover:text-white transition-all text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-slate-600 group-hover:text-brand-purple transition-colors" />
                                    <span>{s}</span>
                                  </div>
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-purple transition-all" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tags de Cidades Selecionadas */}
                    <div className="min-h-[120px] p-6 bg-white/2 rounded-3xl border border-white/5 space-y-4">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Cidades Ativas no Filtro ({cities.length})</p>
                       <div className="flex flex-wrap gap-2">
                         {cities.length > 0 ? (
                           cities.map(c => (
                             <motion.span
                               key={c}
                               layout
                               initial={{ scale: 0.9, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-xl text-xs font-bold uppercase tracking-wider group"
                             >
                               {c}
                               <button onClick={() => removeCity(c)} className="text-brand-purple/40 hover:text-white transition-colors">
                                 <X className="w-3.5 h-3.5" />
                               </button>
                             </motion.span>
                           ))
                         ) : (
                           <div className="flex flex-col items-center justify-center w-full py-6 text-slate-700">
                             <MapPin className="w-8 h-8 mb-2 opacity-20" />
                             <p className="text-xs italic">Nenhuma cidade focada. O sistema exibirá dados de todo o estado de {uf}.</p>
                           </div>
                         )}
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Globe className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-sm text-slate-500 max-w-xs font-medium">
                      Selecione um estado no passo anterior para habilitar a busca por cidades específicas.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border-brand-blue/20">
             <h4 className="font-display font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-blue" /> Visão Ativa
             </h4>
             
             <div className="space-y-6">
                <div className="flex justify-between items-center group cursor-default">
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Escopo</span>
                   <span className={cn(
                     "text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-tighter",
                     uf ? "bg-brand-blue/10 text-brand-blue" : "bg-slate-500/10 text-slate-500"
                   )}>{uf ? 'Regional' : 'Brasil'}</span>
                </div>
                
                <div className="space-y-2">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Estado</p>
                   <p className="text-xl font-display font-bold text-white">{uf || 'Território Nacional'}</p>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Municípios</p>
                   <p className="text-xl font-display font-bold text-brand-purple">
                      {cities.length > 0 ? `${cities.length} Cidade${cities.length > 1 ? 's' : ''}` : (uf ? 'Todos' : 'Nenhum')}
                   </p>
                </div>
             </div>
             
             <div className="mt-10 p-5 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> Regras de Negócio
                </p>
                <div className="flex gap-3">
                   <Building2 className="w-4 h-4 text-brand-blue shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed">As consultas ao banco de dados serão restringidas às localizações acima.</p>
                </div>
                <div className="flex gap-3">
                   <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed">Estatísticas e KPIs refletirão exclusivamente o cenário do foco ativo.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
