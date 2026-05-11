import React, { useEffect, useState } from 'react';
import {
  Map as MapIcon, MapPin, Search, Filter, Maximize2, Layers,
  TrendingUp, Building2, Navigation, Globe, Loader2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface CityStat {
  municipio: string;
  uf: string;
  count: number;
  lat?: number;
  lng?: number;
}

export default function EconomicMap() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CityStat[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        // Busca contagem por município
        const { data, error } = await supabase
          .from('empresas')
          .select('municipio, uf')
          .not('municipio', 'is', null);

        if (error) throw error;

        const counts: Record<string, CityStat> = {};
        data.forEach(item => {
          const key = `${item.municipio}-${item.uf}`;
          if (!counts[key]) {
            counts[key] = { municipio: item.municipio, uf: item.uf, count: 0 };
          }
          counts[key].count++;
        });

        const sorted = Object.values(counts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 15); // Top 15 cidades

        setStats(sorted);
      } catch (err) {
        console.error('Erro ao carregar mapa:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalEmpresas = stats.reduce((acc, s) => acc + s.count, 0);
  const filtrados = stats.filter(s =>
    s.municipio.toLowerCase().includes(busca.toLowerCase()) ||
    s.uf.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Mapa Econômico HUD</h1>
          <p className="text-slate-400 font-sans">Geolocalização de polos comerciais baseada em dados reais</p>
        </div>
        <div className="flex gap-3">
           <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Layers className="w-4 h-4" /> Camadas
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Maximize2 className="w-4 h-4" /> Full View
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Map Visualization Area */}
        <div className="flex-1 glass-panel rounded-[2rem] relative overflow-hidden bg-brand-black/40 border-white/5">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff20 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 left-6 space-y-4 z-10">
            <div className="glass-panel p-2 rounded-2xl flex flex-col gap-2">
              <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-brand-blue/20 transition-all">
                <Globe className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-brand-blue/20 transition-all">
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar on Map */}
          <div className="absolute top-6 left-24 right-24 max-w-xl mx-auto z-10">
             <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 shadow-2xl">
                <Search className="ml-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Localizar Cluster Econômico..."
                  className="bg-transparent border-none py-2 text-sm text-white outline-none flex-1"
                />
                <button className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Global</button>
             </div>
          </div>

          {/* Visual Indicators (Randomly placed for HUD aesthetic) */}
          <AnimatePresence>
            {!loading && filtrados.map((item, i) => {
              // Simulated coordinates for visual effect based on name hash
              const hash = item.municipio.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const top = 20 + (hash % 60) + '%';
              const left = 20 + ((hash * 1.5) % 60) + '%';
              const size = Math.max(0.5, Math.min(2, item.count / (stats[0]?.count || 1) * 2));

              return (
                <motion.div
                  key={item.municipio}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="absolute group cursor-pointer"
                  style={{ top, left }}
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-brand-blue/10 rounded-full blur-xl group-hover:bg-brand-blue/30 transition-all" />
                    <div
                      className="relative rounded-full border-2 border-white shadow-lg bg-brand-blue"
                      style={{
                        width: `${12 * size}px`,
                        height: `${12 * size}px`,
                        boxShadow: `0 0 ${20 * size}px rgba(86, 141, 255, 0.5)`
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none z-20">
                      <div className="glass-panel p-4 rounded-2xl whitespace-nowrap space-y-1 shadow-2xl border-brand-blue/30">
                        <p className="text-white font-bold text-sm">{item.municipio} - {item.uf}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-display font-medium uppercase tracking-wider">
                           <Building2 className="w-3 h-3" /> {item.count} Empresas
                           <span className="w-1 h-1 bg-slate-700 rounded-full" />
                           <TrendingUp className="w-3 h-3 text-emerald-400" /> Hotspot
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-black/20 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                <p className="text-sm font-display font-bold text-brand-blue uppercase tracking-widest">Sincronizando Geo-Clusters...</p>
              </div>
            </div>
          )}

          {/* HUD Info Box */}
          <div className="absolute bottom-6 left-6 glass-panel p-6 rounded-3xl space-y-3 max-w-[240px] border-white/10">
             <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-blue" />
                <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Status da Malha</span>
             </div>
             <p className="text-xs text-slate-300 leading-relaxed font-sans">
               Dados baseados em <span className="text-brand-blue font-bold">{totalEmpresas.toLocaleString('pt-BR')}</span> empresas importadas no banco de dados local.
             </p>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-full bg-brand-blue"
                />
             </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <aside className="w-80 space-y-6 flex flex-col min-h-0">
           <div className="glass-panel p-6 rounded-[2rem] space-y-6 shrink-0">
              <h3 className="font-display font-bold text-lg text-white">Ranking de Polos</h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {loading ? (
                   Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="space-y-2">
                        <div className="h-3 w-24 bg-white/5 rounded" />
                        <div className="h-1.5 w-full bg-white/5 rounded" />
                     </div>
                   ))
                 ) : filtrados.map((reg, i) => {
                   const max = stats[0]?.count || 1;
                   const percent = (reg.count / max) * 100;
                   return (
                    <div key={reg.municipio} className="space-y-2 group">
                       <div className="flex justify-between text-xs">
                         <span className="text-slate-400 font-medium group-hover:text-white transition-colors">{reg.municipio}</span>
                         <span className="text-white font-bold">{reg.count}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${percent}%` }}
                           className="h-full bg-brand-blue rounded-full"
                         />
                       </div>
                    </div>
                   );
                 })}
              </div>
           </div>

           <div className="glass-panel p-6 rounded-[2rem] space-y-4 flex-1 flex flex-col min-h-0">
              <h3 className="font-display font-bold text-white text-sm">Zonas de Influência</h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                 {!loading && filtrados.slice(0, 5).map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-brand-blue/5 transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                         <MapPin className={cn("w-5 h-5", i === 0 ? "text-brand-blue" : "text-slate-500")} />
                      </div>
                      <div>
                         <p className="text-sm font-semibold text-slate-200">{item.municipio}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{item.uf} — Polo Industrial</p>
                      </div>
                   </div>
                 ))}
                 {filtrados.length === 0 && !loading && (
                   <p className="text-slate-600 text-xs text-center py-10">Nenhum polo identificado com os filtros atuais.</p>
                 )}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
