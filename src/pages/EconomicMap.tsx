import React from 'react';
import { 
  Map as MapIcon, 
  MapPin, 
  Search, 
  Filter, 
  Maximize2, 
  Layers,
  TrendingUp,
  Building2,
  Navigation,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function EconomicMap() {
  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Mapa Econômico HUD</h1>
          <p className="text-slate-400 font-sans">Geolocalização de eixos industriais e comerciais em tempo real</p>
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

      <div className="flex-1 flex gap-8">
        {/* Map Visualization Area */}
        <div className="flex-1 glass-panel rounded-[2rem] relative overflow-hidden bg-brand-black/40 border-white/5">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff10 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <svg className="w-full h-full text-brand-blue/20" viewBox="0 0 800 600">
              <path d="M100,100 Q400,50 700,100 T600,500 T100,500 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
              <path d="M200,200 Q450,150 750,250 T500,450 T150,300 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 left-6 space-y-4">
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
          <div className="absolute top-6 left-24 right-24 max-w-xl mx-auto">
             <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 shadow-2xl">
                <Search className="ml-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Localizar Cluster Econômico..."
                  className="bg-transparent border-none py-2 text-sm text-white outline-none flex-1"
                />
                <button className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Global</button>
             </div>
          </div>

          {/* Simulated Pins */}
          {[
            { top: '30%', left: '40%', color: 'blue' },
            { top: '55%', left: '25%', color: 'purple' },
            { top: '45%', left: '60%', color: 'cyan' },
            { top: '70%', left: '50%', color: 'blue' },
          ].map((pin, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="absolute group cursor-pointer will-change-transform"
              style={{ top: pin.top, left: pin.left }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-brand-blue/20 rounded-full blur-xl group-hover:bg-brand-blue/40 transition-all animate-pulse" />
                <div className={cn(
                  "relative w-4 h-4 rounded-full border-2 border-white shadow-lg",
                  pin.color === 'blue' ? "bg-brand-blue" : pin.color === 'purple' ? "bg-brand-purple" : "bg-brand-cyan"
                )} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none">
                  <div className="glass-panel p-4 rounded-2xl whitespace-nowrap space-y-1 shadow-2xl">
                    <p className="text-white font-bold text-sm">Polo de Inovação {i + 1}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-display font-medium uppercase tracking-wider">
                       <Building2 className="w-3 h-3" /> 1.2k Empresas
                       <span className="w-1 h-1 bg-slate-700 rounded-full" />
                       <TrendingUp className="w-3 h-3 text-emerald-400" /> +12%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Lens Effect Placeholder */}
          <div className="absolute bottom-6 right-6 w-64 glass-panel p-6 rounded-3xl space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest">Densidade de Atividade</span>
             </div>
             <div className="flex items-end gap-1 h-16">
               {[40, 70, 45, 90, 65, 80, 50, 60, 40, 55].map((h, i) => (
                 <div key={i} className="flex-1 bg-brand-blue/20 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div className="w-full h-1 bg-brand-blue rounded-full" />
                 </div>
               ))}
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed">Cluster concentrado no sudeste brasileiro apresenta o maior índice de aberturas de Q1.</p>
          </div>
        </div>

        {/* Sidebar Panel */}
        <aside className="w-80 space-y-6 overflow-y-auto pr-2">
           <div className="glass-panel p-6 rounded-[2rem] space-y-6">
              <h3 className="font-display font-bold text-lg text-white">Análise Regional</h3>
              
              <div className="space-y-4">
                 {[
                   { region: 'Sudeste', color: 'bg-brand-blue', percent: 45 },
                   { region: 'Sul', color: 'bg-brand-purple', percent: 28 },
                   { region: 'Nordeste', color: 'bg-brand-cyan', percent: 15 },
                   { region: 'Centro-Oeste', color: 'bg-emerald-400', percent: 12 },
                 ].map((reg) => (
                   <div key={reg.region} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">{reg.region}</span>
                        <span className="text-white font-bold">{reg.percent}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", reg.color)} style={{ width: `${reg.percent}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-panel p-6 rounded-[2rem] space-y-4">
              <h3 className="font-display font-bold text-white text-sm">Highlights Geográficos</h3>
              <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-brand-blue/5 transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                         <MapPin className="w-5 h-5 text-slate-500 group-hover:text-brand-blue" />
                      </div>
                      <div>
                         <p className="text-sm font-semibold text-slate-200">Zona Franca de Manaus</p>
                         <p className="text-xs text-slate-500 font-medium">Incentivo Fiscal: Tier A</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
