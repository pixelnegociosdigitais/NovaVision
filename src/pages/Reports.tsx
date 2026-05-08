import React from 'react';
import { 
  FileText, 
  Search, 
  LayoutGrid, 
  List, 
  Download, 
  Clock, 
  ChevronRight, 
  FilePieChart,
  FileSearch,
  FileJson,
  Plus,
  MoreVertical,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const ReportChip = ({ label }: { label: string, key?: string }) => (
  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-display font-bold text-slate-400 uppercase tracking-widest">{label}</span>
);

export default function Reports() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Repositório de Relatórios</h1>
          <p className="text-slate-400 font-sans">Documentação técnica, análises setoriais e dashboards exportados</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel p-2.5 rounded-xl text-slate-500 hover:text-white">
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button className="glass-panel p-2.5 rounded-xl text-brand-blue bg-brand-blue/10 border-brand-blue/20">
            <List className="w-5 h-5" />
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Report Custom
          </button>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome do arquivo, categoria ou tag..."
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Access */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-6 bg-gradient-to-br from-brand-purple/5 to-transparent">
             <h3 className="font-display font-bold text-white">Smart Folders</h3>
             <div className="space-y-1">
                {[
                  { label: 'Análise Setorial', icon: FilePieChart },
                  { label: 'Diligências', icon: FileSearch },
                  { label: 'JSON Exports', icon: FileJson },
                  { label: 'Favoritos', icon: Star },
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                     <item.icon className="w-4 h-4 text-slate-500 group-hover:text-brand-purple transition-colors" />
                     <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors font-medium">{item.label}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4">
             <h3 className="font-display font-bold text-white text-sm">Espaço Utilizado</h3>
             <div className="space-y-2">
                <div className="flex justify-between text-xs">
                   <span className="text-slate-500">2.4 GB de 10 GB</span>
                   <span className="text-slate-200 font-bold">24%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-purple rounded-full w-[24%]" />
                </div>
             </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-9 space-y-4">
           {[
             { name: 'Análise Macro Brasil 2024 - Q1', type: 'PDF', size: '12.4 MB', date: 'há 2 dias', tags: ['Macro', 'BI'] },
             { name: 'Dataset Empresas Tecnologia SP', type: 'CSV', size: '4.1 MB', date: 'há 5 dias', tags: ['Data', 'SP'] },
             { name: 'Relatório Due Diligence - Alpha Corp', type: 'DOCX', size: '1.2 MB', date: 'há 1 semana', tags: ['Diligence'] },
             { name: 'Estatísticas MEI por Região', type: 'PDF', size: '8.9 MB', date: 'há 2 semanas', tags: ['MEI', 'Gov'] },
           ].map((report, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer"
             >
                <div className="flex items-center gap-6">
                   <div className="w-12 h-14 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                      <div className="absolute top-0 right-0 w-4 h-4 bg-white/5 rotate-45 translate-x-2 -translate-y-2 border-l border-b border-white/10" />
                      <span className="text-[10px] font-black text-brand-blue uppercase">{report.type}</span>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-white font-bold group-hover:text-brand-blue transition-colors">{report.name}</h4>
                      <div className="flex items-center gap-3">
                         <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" /> {report.date}
                         </span>
                         <span className="w-1 h-1 bg-slate-700 rounded-full" />
                         <span className="text-xs text-slate-500 font-medium">{report.size}</span>
                         <div className="flex gap-2 ml-4">
                            {report.tags.map(tag => <ReportChip key={tag} label={tag} />)}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                      <Download className="w-4 h-4" />
                   </button>
                   <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                   <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-brand-blue transition-all group-hover:translate-x-1" />
                </div>
             </motion.div>
           ))}

           <button className="w-full py-4 rounded-3xl border border-dashed border-white/10 text-slate-500 font-display font-bold hover:border-brand-blue hover:text-brand-blue transition-all">
              Carregar mais relatórios históricos...
           </button>
        </div>
      </div>
    </div>
  );
}
