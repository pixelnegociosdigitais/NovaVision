import React, { useState, useEffect } from 'react';
import {
  FileText, Search, LayoutGrid, List, Download, Clock,
  ChevronRight, FilePieChart, FileSearch, FileJson, Plus,
  MoreVertical, Star, Loader2, Info, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Report {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  tags: string[];
  category: 'sector' | 'diligence' | 'export' | 'favorite';
}

const ReportChip = ({ label }: { label: string }) => (
  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-display font-bold text-white/80 uppercase tracking-widest">{label}</span>
);

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [category, setCategory] = useState<Report['category'] | 'all'>('all');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      // Simulating loading real generated reports from DB or just generating some based on current data
      try {
        const { count: totalEmpresas } = await supabase.from('empresas').select('id', { count: 'exact', head: true });
        const { count: totalMei } = await supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('opcao_pelo_mei', true);

        const generated: Report[] = [
          {
            id: '1',
            name: `Dataset Geral - ${totalEmpresas} Empresas`,
            type: 'CSV',
            size: `${((totalEmpresas || 0) * 0.15).toFixed(1)} MB`,
            date: 'Hoje',
            tags: ['Geral', 'Full'],
            category: 'export'
          },
          {
            id: '2',
            name: `Análise de MEI - ${totalMei} Registros`,
            type: 'PDF',
            size: '4.2 MB',
            date: 'Ontem',
            tags: ['MEI', 'BI'],
            category: 'sector'
          },
          {
            id: '3',
            name: 'Relatório de Clusters Tecnológicos SP',
            type: 'PDF',
            size: '12.8 MB',
            date: 'há 3 dias',
            tags: ['Tech', 'SP'],
            category: 'sector'
          },
          {
            id: '4',
            name: 'Exportação JSON - Malha Societária',
            type: 'JSON',
            size: '1.5 MB',
            date: 'há 1 semana',
            tags: ['Dev', 'API'],
            category: 'export'
          }
        ];
        setReports(generated);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filtrados = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(filter.toLowerCase()) ||
                        r.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()));
    const matchesCat = category === 'all' || r.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Repositório de Relatórios</h1>
          <p className="text-white/80 font-sans">Documentação técnica, análises setoriais e datasets gerados pelo sistema</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Relatório Custom
          </button>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Buscar por nome do arquivo, categoria ou tag..."
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm text-white outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Access */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-6 bg-gradient-to-br from-brand-purple/5 to-transparent border-white/10">
             <h3 className="font-display font-bold text-white">Smart Folders</h3>
             <div className="space-y-1">
                {[
                  { label: 'Todos', icon: FileText, cat: 'all' },
                  { label: 'Análise Setorial', icon: FilePieChart, cat: 'sector' },
                  { label: 'Diligências', icon: FileSearch, cat: 'diligence' },
                  { label: 'Exportações', icon: FileJson, cat: 'export' },
                  { label: 'Favoritos', icon: Star, cat: 'favorite' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setCategory(item.cat as any)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                      category === item.cat ? "bg-brand-purple/10 text-brand-purple" : "hover:bg-white/5 text-white/80"
                    )}
                  >
                     <item.icon className={cn("w-4 h-4", category === item.cat ? "text-brand-purple" : "text-white/70 group-hover:text-brand-purple transition-colors")} />
                     <span className={cn("text-sm font-medium", category === item.cat ? "text-white" : "group-hover:text-slate-200 transition-colors")}>{item.label}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 border-white/10">
             <h3 className="font-display font-bold text-white text-sm">Armazenamento Cloud</h3>
             <div className="space-y-2">
                <div className="flex justify-between text-xs">
                   <span className="text-white/70">2.4 GB de 10 GB</span>
                   <span className="text-slate-200 font-bold">24%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '24%' }}
                    className="h-full bg-brand-purple rounded-full"
                   />
                </div>
             </div>
          </div>
        </aside>

        {/* Reports List */}
        <div className="lg:col-span-9 space-y-4">
           {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="h-24 glass-panel rounded-3xl animate-pulse" />
             ))
           ) : filtrados.length === 0 ? (
             <div className="py-20 text-center glass-panel rounded-3xl space-y-4 border-dashed border-white/10">
                <FileSearch className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-white/70 font-display">Nenhum relatório encontrado para este filtro.</p>
             </div>
           ) : (
             <AnimatePresence>
               {filtrados.map((report, i) => (
                 <motion.div
                   key={report.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer border-white/5"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-14 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                          <div className="absolute top-0 right-0 w-4 h-4 bg-white/5 rotate-45 translate-x-2 -translate-y-2 border-l border-b border-white/10" />
                          <span className="text-[10px] font-black text-brand-blue uppercase">{report.type}</span>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-white font-bold group-hover:text-brand-blue transition-colors">{report.name}</h4>
                          <div className="flex items-center gap-3">
                             <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                                <Clock className="w-3.5 h-3.5" /> {report.date}
                             </span>
                             <span className="w-1 h-1 bg-slate-700 rounded-full" />
                             <span className="text-xs text-white/70 font-medium">{report.size}</span>
                             <div className="flex gap-2 ml-4">
                                {report.tags.map(tag => <ReportChip key={tag} label={tag} />)}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <button className="p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                          <Download className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white transition-all">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                       <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-brand-blue transition-all group-hover:translate-x-1" />
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           )}

           {!loading && reports.length > 0 && (
             <div className="p-6 glass-panel rounded-3xl bg-brand-blue/5 border-brand-blue/10 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-blue shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Sincronização Ativa</p>
                  <p className="text-xs text-white/80">Seus relatórios são atualizados automaticamente a cada nova importação de dados.</p>
                </div>
                <button className="text-brand-blue text-xs font-bold hover:underline">Configurar Auto-Sync</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
