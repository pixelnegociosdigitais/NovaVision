import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, X, Plus, ChevronDown, Check, 
  Search, Shield, Info, Building2, TrendingUp,
  Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import { buscarCidadesIbge } from '@/lib/etl';

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

export default function FocusSettings() {
  const { uf, cities, setUf, setCities, clearPreferences } = usePreferences();
  const [cityInput, setCityInput] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Carregar TODAS as cidades do estado via IBGE (Independente do banco estar vazio)
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

  // Filtrar localmente conforme o usuário digita
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
          <p className="text-slate-400 font-sans">Defina o escopo territorial para análise de dados e prospecção.</p>
        </div>
        {uf && (
          <button 
            onClick={clearPreferences}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-400/10 text-red-400 font-display font-bold text-sm border border-red-400/20 hover:bg-red-400/20 transition-all"
          >
            <X className="w-4 h-4" /> Resetar para Brasil
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
                <h3 className="font-display font-bold text-white text-lg">Área de Atuação</h3>
                <p className="text-slate-500 text-sm">Configure o estado e municípios que deseja monitorar.</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Seleção de Estado */}
              <div className="space-y-3">
                <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center text-[10px]">1</span>
                  Selecione o Estado
                </label>
                <div className="relative">
                  <select
                    value={uf}
                    onChange={e => { setUf(e.target.value); setCities([]); setCityInput(''); }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none cursor-pointer"
                  >
                    <option value="">Todo o Brasil</option>
                    {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Busca de Cidades */}
              <AnimatePresence mode="wait">
                {uf ? (
                  <motion.div
                    key="city-input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3 relative" ref={suggestionRef}>
                      <label className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[10px]">2</span>
                        Adicionar Municípios
                        {loadingCities && <Loader2 className="w-3 h-3 animate-spin text-brand-blue" />}
                      </label>
                      <div className="relative group">
                        <Search className={cn(
                          "absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                          cityInput.length >= 2 ? "text-brand-purple" : "text-slate-500"
                        )} />
                        <input
                          type="text"
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          disabled={loadingCities}
                          placeholder={loadingCities ? "Carregando lista do IBGE..." : "Digite o nome da cidade..."}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>

                      {/* Sugestões do Autocomplete */}
                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#121212] border border-white/10 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden"
                          >
                            <div className="max-h-[300px] overflow-y-auto">
                              {suggestions.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleAddCity(s)}
                                  className="w-full flex items-center justify-between px-6 py-4 text-sm text-slate-300 hover:bg-brand-purple/10 hover:text-white transition-all text-left border-b border-white/5 last:border-0 group"
                                >
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-slate-600 group-hover:text-brand-purple" />
                                    <span>{s}</span>
                                  </div>
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-purple" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chips de Seleção */}
                    <div className="min-h-[140px] p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 flex flex-col gap-6">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Foco Selecionado ({cities.length})</p>
                          {cities.length > 0 && (
                            <button onClick={() => setCities([])} className="text-[10px] text-slate-500 hover:text-white transition-colors">Remover Todas</button>
                          )}
                       </div>
                       
                       <div className="flex flex-wrap gap-2.5">
                         {cities.length > 0 ? (
                           cities.map(c => (
                             <motion.span
                               key={c}
                               layout
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-xl text-xs font-bold uppercase tracking-wider"
                             >
                               {c}
                               <button onClick={() => removeCity(c)} className="hover:text-white transition-colors">
                                 <X className="w-4 h-4" />
                               </button>
                             </motion.span>
                           ))
                         ) : (
                           <div className="flex flex-col items-center justify-center w-full py-4 text-slate-700 text-center">
                             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                               <Info className="w-6 h-6 opacity-20" />
                             </div>
                             <p className="text-xs italic max-w-[200px]">Nenhuma cidade adicionada. O filtro será aplicado a todo o estado de {uf}.</p>
                           </div>
                         )}
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-16 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center text-center space-y-4 bg-white/[0.01]">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-slate-800" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Aguardando Estado</p>
                       <p className="text-xs text-slate-600 max-w-[240px]">Selecione um estado para listar os municípios disponíveis.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 border-brand-blue/20">
             <h4 className="font-display font-bold text-white mb-8 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                <Shield className="w-4 h-4 text-brand-blue" /> Configuração Atual
             </h4>
             
             <div className="space-y-8">
                <div className="space-y-2">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Território</p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
                         {uf || 'BR'}
                      </div>
                      <p className="text-xl font-display font-bold text-white leading-none">{uf ? 'Regional' : 'Nacional'}</p>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Cidades Ativas</p>
                   <p className="text-2xl font-display font-bold text-brand-purple">
                      {cities.length > 0 ? cities.length : (uf ? 'Todas' : 'N/A')}
                   </p>
                </div>
             </div>
             
             <div className="mt-12 p-6 bg-black/30 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex gap-3">
                   <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Os dados de mercado, MEI e tendências serão recalculados para o seu foco.</p>
                </div>
                <div className="flex gap-3">
                   <Building2 className="w-5 h-5 text-brand-blue shrink-0" />
                   <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Sua base de empresas exibirá apenas registros deste recorte geográfico.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
