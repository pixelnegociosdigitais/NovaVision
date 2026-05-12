import React, { useState, useEffect } from 'react';
import { Database, Download, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Log {
  id: string;
  criado_em: string;
  acao: string;
  entidade: string;
  detalhes: any;
  status: 'success' | 'error';
}

export default function SyncMonitor() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, enriched: 0, pending: 0 });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  async function fetchStats() {
    const { count: total, error: e1 } = await supabase.from('empresas').select('*', { count: 'exact', head: true });
    const { count: enriched, error: e2 } = await supabase.from('empresas').select('*', { count: 'exact', head: true }).not('municipio', 'is', null);
    
    if (e1 || e2) console.error('Erro ao buscar stats:', e1 || e2);

    const totalVal = total || 0;
    const enrichedVal = enriched || 0;

    setStats({
      total: totalVal,
      enriched: enrichedVal,
      pending: Math.max(0, totalVal - enrichedVal)
    });
  }

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(20);

    if (!error) setLogs(data);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitor de Sincronização</h1>
          <p className="text-slate-500 text-sm">Status em tempo real do download e processamento de dados</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchLogs(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Cards de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total no Banco</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Enriquecidos</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.enriched.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aguardando Detalhes</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Download size={20} className="text-slate-400" />
          <h2 className="font-semibold text-slate-800">Histórico de Atividades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Data/Hora</th>
                <th className="px-6 py-3 font-semibold">Ação</th>
                <th className="px-6 py-3 font-semibold">Entidade</th>
                <th className="px-6 py-3 font-semibold">Detalhes</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {new Date(log.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{log.acao}</td>
                  <td className="px-6 py-4 text-slate-500">{log.entidade}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {JSON.stringify(log.detalhes)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.status === 'success' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Sucesso
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        Erro
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma atividade registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
