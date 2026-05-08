import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  MapPin, 
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const companies = [
  { cnpj: '42.123.456/0001-89', name: 'TecnoLogix Soluções Digitais Ltda', fantasy: 'Logix AI', city: 'São Paulo', uf: 'SP', axis: 'Tecnologia', date: '12/05/2018' },
  { cnpj: '08.987.654/0001-21', name: 'AgroForte Commodities S.A.', fantasy: 'AgroForte', city: 'Rio Verde', uf: 'GO', axis: 'Agronegócio', date: '03/11/2005' },
  { cnpj: '15.432.111/0001-02', name: 'MedHealth Diagnostics', fantasy: 'MedHealth Lab', city: 'Curitiba', uf: 'PR', axis: 'Saúde', date: '21/09/2012' },
  { cnpj: '33.555.666/0001-44', name: 'FinFlow Asset Management', fantasy: 'FinFlow', city: 'Rio de Janeiro', uf: 'RJ', axis: 'Finanças', date: '15/01/2021' },
  { cnpj: '12.000.123/0001-99', name: 'Global Retail Hub', fantasy: 'RetailHub', city: 'Belo Horizonte', uf: 'MG', axis: 'Varejo', date: '08/08/2010' },
  { cnpj: '55.666.777/0001-33', name: 'Constructa Engenharia', fantasy: 'Constructa', city: 'Joinville', uf: 'SC', axis: 'Indústria', date: '30/04/2015' },
];

interface CompaniesProps {
  onSelectCompany: (company: any) => void;
}

export default function Companies({ onSelectCompany }: CompaniesProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const toggleSelect = (cnpj: string) => {
    setSelectedCompanies(prev => 
      prev.includes(cnpj) ? prev.filter(c => c !== cnpj) : [...prev, cnpj]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Base de Dados Empresarial</h1>
          <p className="text-slate-400 font-sans">Monitoramento de 150 a 2.430 registros em tempo real</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            Nova Empresa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6 h-fit sticky top-28">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-blue" /> Filtros
              </h3>
              <button className="text-xs text-slate-500 hover:text-brand-blue transition-colors">Limpar todos</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest px-1">Eixo Econômico</label>
                <select className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-blue/50 transition-all">
                  <option>Todos os Eixos</option>
                  <option>Tecnologia</option>
                  <option>Agronegócio</option>
                  <option>Saúde</option>
                  <option>Indústria</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest px-1">Estado (UF)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['SP', 'RJ', 'MG', 'PR', 'SC', 'GO'].map(uf => (
                    <button key={uf} className="px-2 py-1.5 rounded-lg border border-white/5 bg-white/5 text-xs text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all">
                      {uf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest px-1">Situação</label>
                <div className="flex flex-col gap-2">
                  {['Ativa', 'Baixada', 'Suspensa'].map(status => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-white/20 group-hover:border-brand-blue transition-colors" />
                      <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm glow-button">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        {/* List Content */}
        <div className="lg:col-span-9 space-y-4">
          <div className="glass-panel p-2 rounded-2xl flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Busca avançada por CNPJ, Razão Social ou Nome Fantasia..."
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
                    <th className="px-6 py-4">
                      <div className="w-4 h-4 rounded border border-white/20" />
                    </th>
                    <th className="px-6 py-4">CNPJ / Razão Social</th>
                    <th className="px-6 py-4">Cidade / UF</th>
                    <th className="px-6 py-4">Eixo</th>
                    <th className="px-6 py-4">Data Abertura</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companies.map((company, i) => (
                    <tr 
                      key={i} 
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => onSelectCompany(company)}
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <div 
                          onClick={() => toggleSelect(company.cnpj)}
                          className={cn(
                            "w-4 h-4 rounded border transition-all duration-300",
                            selectedCompanies.includes(company.cnpj) ? "bg-brand-blue border-brand-blue" : "border-white/20"
                          )} 
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <p className="text-white font-medium text-sm group-hover:text-brand-blue transition-colors">{company.name}</p>
                          <p className="text-slate-500 font-mono text-xs">{company.cnpj}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          {company.city}, {company.uf}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                          {company.axis}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-400 text-sm">{company.date}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-brand-blue hover:bg-brand-blue/10 transition-all">
                            <Star className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-display">Página 1 de 42</span>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg bg-brand-blue text-white text-xs font-bold font-display">1</button>
                  <button className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 text-xs font-bold font-display hover:bg-white/10">2</button>
                  <button className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 text-xs font-bold font-display hover:bg-white/10">3</button>
                </div>
                <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
