import React, { useState, useEffect, useRef } from 'react';
import { Globe, MapPin, X, Plus, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/contexts/PreferenceContext';
import { buscarCidadesPorEstado } from '@/lib/etl';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function RegionalFocusWidget() {
  const { uf, cities, setUf, setCities, clearPreferences } = usePreferences();
  const [cityInput, setCityInput] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Carregar cidades disponíveis quando o UF muda
  useEffect(() => {
    if (uf) {
      buscarCidadesPorEstado(uf).then(setAvailableCities);
    } else {
      setAvailableCities([]);
    }
  }, [uf]);

  // Filtrar sugestões
  useEffect(() => {
    if (cityInput.trim() && availableCities.length > 0) {
      const filtered = availableCities
        .filter(c => c.toLowerCase().includes(cityInput.toLowerCase()) && !cities.includes(c))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [cityInput, availableCities, cities]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Globe className="w-3 h-3 text-brand-blue" /> Foco Econômico
        </h3>
        {uf && (
          <button onClick={clearPreferences} className="text-[9px] text-red-400 hover:underline">Limpar</button>
        )}
      </div>

      <div className="space-y-3">
        {/* UF */}
        <div className="relative">
          <select
            value={uf}
            onChange={e => setUf(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue/40 transition-all [&>option]:text-black appearance-none"
          >
            <option value="">Brasil (Nacional)</option>
            {UFS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Cidades */}
        {uf && (
          <div className="space-y-2 relative" ref={suggestionRef}>
            <div className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                onFocus={() => cityInput.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Adicionar cidade..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple/40 transition-all placeholder:text-slate-600"
              />
              <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            </div>

            {/* Sugestões Autocomplete */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 left-0 right-0 top-full mt-1 bg-brand-black border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleAddCity(s)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-brand-blue/20 hover:text-white transition-all text-left border-b border-white/5 last:border-0"
                    >
                      {s}
                      <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de cidades selecionadas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cities.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-md text-[9px] font-bold">
                  {c}
                  <button onClick={() => removeCity(c)} className="hover:text-white">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
