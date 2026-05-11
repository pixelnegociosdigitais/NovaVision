import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, AlertTriangle, Zap, RefreshCcw, Settings, MoreVertical,
  CheckCircle2, Clock, Building2, Filter, Plus, X, MapPin,
  Layers, Trash2, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { registrarLog } from '@/lib/activity';

// ─────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────
interface Alerta {
  id: string;
  tipo: 'cidade' | 'estado' | 'cnae' | 'eixo';
  valor: string;
  descricao?: string;
  ativo: boolean;
  notificacao_email: boolean;
  notificacao_dashboard: boolean;
  criado_em: string;
  ultimo_disparo?: string;
  total_disparos?: number;
}

const TIPOS = [
  { value: 'cidade',  label: 'Cidade',          icon: MapPin    },
  { value: 'estado',  label: 'Estado (UF)',      icon: MapPin    },
  { value: 'cnae',    label: 'CNAE',             icon: Layers    },
  { value: 'eixo',    label: 'Eixo Econômico',   icon: Building2 },
];

const EIXOS = ['Comércio','Indústria','Serviços','Agronegócio','Tecnologia','Saúde','Educação','Construção','Financeiro','Turismo'];
const UFS   = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-white/5 rounded-xl', className)} />;
}

// ─────────────────────────────────────────
// Card de alerta
// ─────────────────────────────────────────
function AlertCard({ alerta, onToggle, onDelete }: { alerta: Alerta; onToggle: () => void; onDelete: () => void }) {
  const tipoInfo = TIPOS.find(t => t.value === alerta.tipo);
  const Icon = tipoInfo?.icon || Bell;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'glass-panel p-6 rounded-2xl border-l-4 transition-all',
        alerta.ativo ? 'border-l-brand-blue' : 'border-l-white/10 opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={cn('p-3 rounded-xl shrink-0', alerta.ativo ? 'bg-brand-blue/10' : 'bg-white/5')}>
            <Icon className={cn('w-5 h-5', alerta.ativo ? 'text-brand-blue' : 'text-white/60')} />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-display font-bold text-white/70 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-lg">
                {tipoInfo?.label}
              </span>
              {alerta.ativo ? (
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Ativo</span>
              ) : (
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Pausado</span>
              )}
            </div>
            <h3 className="font-display font-bold text-white">{alerta.valor}</h3>
            {alerta.descricao && <p className="text-sm text-white/80">{alerta.descricao}</p>}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Clock className="w-3.5 h-3.5" />
                Criado em {new Date(alerta.criado_em).toLocaleDateString('pt-BR')}
              </span>
              {alerta.ultimo_disparo && (
                <span className="flex items-center gap-1.5 text-xs text-white/70">
                  <Bell className="w-3.5 h-3.5" />
                  Último disparo: {new Date(alerta.ultimo_disparo).toLocaleDateString('pt-BR')}
                </span>
              )}
              {alerta.notificacao_email && (
                <span className="text-xs text-brand-cyan font-medium">✉ Email</span>
              )}
              {alerta.notificacao_dashboard && (
                <span className="text-xs text-brand-purple font-medium">🖥 Dashboard</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggle} title={alerta.ativo ? 'Pausar' : 'Ativar'}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all">
            {alerta.ativo
              ? <ToggleRight className="w-5 h-5 text-brand-blue" />
              : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button onClick={onDelete} title="Excluir"
            className="p-2 rounded-lg text-white/70 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Modal de criação
// ─────────────────────────────────────────
function NovoAlertaModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Partial<Alerta>) => Promise<void> }) {
  const [tipo, setTipo]       = useState<Alerta['tipo']>('cidade');
  const [valor, setValor]     = useState('');
  const [desc, setDesc]       = useState('');
  const [email, setEmail]     = useState(true);
  const [dashboard, setDash]  = useState(true);
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor.trim()) return;
    setSaving(true);
    await onCreate({ tipo, valor: valor.trim(), descricao: desc.trim() || undefined, notificacao_email: email, notificacao_dashboard: dashboard });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-blue" /> Novo Alerta
          </h2>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-xs font-display font-bold text-white/70 uppercase tracking-widest">Tipo de Alerta</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(t => (
                <button key={t.value} type="button" onClick={() => { setTipo(t.value as any); setValor(''); }}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all',
                    tipo === t.value ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-white/10 text-white/80 hover:border-white/20'
                  )}>
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-xs font-display font-bold text-white/70 uppercase tracking-widest">
              {tipo === 'estado' ? 'Estado' : tipo === 'eixo' ? 'Eixo Econômico' : tipo === 'cnae' ? 'CNAE (código)' : 'Nome da Cidade'}
            </label>
            {tipo === 'estado' ? (
              <select value={valor} onChange={e => setValor(e.target.value)} required
                className="w-full appearance-none bg-white/5 border border-white/10 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black">
                <option value="">Selecione um estado</option>
                {UFS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            ) : tipo === 'eixo' ? (
              <select value={valor} onChange={e => setValor(e.target.value)} required
                className="w-full appearance-none bg-white/5 border border-white/10 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all [&>option]:text-black">
                <option value="">Selecione um eixo</option>
                {EIXOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            ) : (
              <input type="text" value={valor} onChange={e => setValor(e.target.value)} required
                placeholder={tipo === 'cnae' ? 'Ex: 4711 ou 47' : 'Ex: MARAU, SAO PAULO...'}
                className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all uppercase"
              />
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-xs font-display font-bold text-white/70 uppercase tracking-widest">Descrição (opcional)</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Ex: Monitorar novas lojas em Marau"
              className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all"
            />
          </div>

          {/* Notificações */}
          <div className="space-y-2">
            <label className="text-xs font-display font-bold text-white/70 uppercase tracking-widest">Notificações</label>
            <div className="flex gap-3">
              {[
                { label: 'E-mail', val: email, set: setEmail },
                { label: 'Dashboard', val: dashboard, set: setDash },
              ].map(({ label, val, set }) => (
                <button key={label} type="button" onClick={() => set(!val)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                    val ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-white/10 text-white/70 hover:border-white/20'
                  )}>
                  {val ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-white/10 rounded-xl text-white/80 font-display font-semibold text-sm hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !valor}
              className="flex-[2] py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(86,141,255,0.3)]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Criando...' : 'Criar Alerta'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────
export default function Alerts() {
  const [alertas, setAlertas]     = useState<Alerta[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtroTipo, setFiltro]   = useState<string>('');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('alertas').select('*').order('criado_em', { ascending: false });
      if (filtroTipo) query = query.eq('tipo', filtroTipo);
      const { data, error } = await query;
      if (!error && data) setAlertas(data as Alerta[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filtroTipo]);

  useEffect(() => { carregar(); }, [carregar]);

  const criarAlerta = async (dados: Partial<Alerta>) => {
    const { error } = await supabase.from('alertas').insert([{
      ...dados,
      ativo: true,
      criado_em: new Date().toISOString(),
      total_disparos: 0,
    }]);
    if (!error) {
      carregar();
      registrarLog('Criou Alerta', `${dados.tipo}: ${dados.valor}`);
    }
  };

  const toggleAlerta = async (id: string, ativo: boolean) => {
    const alerta = alertas.find(a => a.id === id);
    await supabase.from('alertas').update({ ativo: !ativo }).eq('id', id);
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, ativo: !ativo } : a));
    registrarLog(ativo ? 'Pausou Alerta' : 'Ativou Alerta', alerta ? `${alerta.tipo}: ${alerta.valor}` : undefined);
  };

  const excluirAlerta = async (id: string) => {
    const alerta = alertas.find(a => a.id === id);
    await supabase.from('alertas').delete().eq('id', id);
    setAlertas(prev => prev.filter(a => a.id !== id));
    registrarLog('Excluiu Alerta', alerta ? `${alerta.tipo}: ${alerta.valor}` : undefined);
  };

  const filtrados = alertas.filter(a => !filtroTipo || a.tipo === filtroTipo);
  const ativos    = alertas.filter(a => a.ativo).length;

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Central de Alertas</h1>
            <p className="text-white/80">
              {loading ? 'Carregando...' : `${ativos} alertas ativos de ${alertas.length} configurados`}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={carregar} disabled={loading}
              className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50">
              <RefreshCcw className={cn('w-4 h-4', loading && 'animate-spin')} /> Atualizar
            </button>
            <button onClick={() => setShowModal(true)}
              className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo Alerta
            </button>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ativos', value: alertas.filter(a => a.ativo).length, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Pausados', value: alertas.filter(a => !a.ativo).length, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Por Cidade', value: alertas.filter(a => a.tipo === 'cidade').length, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
            { label: 'Por Eixo', value: alertas.filter(a => a.tipo === 'eixo').length, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="glass-panel p-5 rounded-2xl">
              <p className="text-xs font-display font-bold text-white/70 uppercase tracking-wider mb-1">{label}</p>
              <p className={cn('text-3xl font-display font-bold', color)}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros laterais */}
          <aside className="lg:col-span-1 space-y-4 h-fit sticky top-28">
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-blue" /> Filtrar por Tipo
              </h3>
              <button onClick={() => setFiltro('')}
                className={cn('w-full text-left p-3 rounded-xl text-sm font-semibold transition-all',
                  !filtroTipo ? 'bg-brand-blue/10 text-brand-blue' : 'text-white/80 hover:bg-white/5')}>
                Todos os alertas
              </button>
              {TIPOS.map(t => (
                <button key={t.value} onClick={() => setFiltro(t.value)}
                  className={cn('w-full text-left p-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                    filtroTipo === t.value ? 'bg-brand-blue/10 text-brand-blue' : 'text-white/80 hover:bg-white/5')}>
                  <t.icon className="w-4 h-4" /> {t.label}
                  <span className="ml-auto text-xs bg-white/5 px-2 py-0.5 rounded-lg">
                    {alertas.filter(a => a.tipo === t.value).length}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Lista de alertas */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
            ) : filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl">
                <Bell className="w-14 h-14 text-slate-700 mb-4" />
                <h3 className="font-display font-bold text-white/80 text-lg mb-1">Nenhum alerta configurado</h3>
                <p className="text-white/60 text-sm mb-6">Crie alertas para monitorar cidades, estados, CNAEs ou eixos econômicos</p>
                <button onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:scale-105 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Criar Primeiro Alerta
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {filtrados.map(alerta => (
                  <AlertCard
                    key={alerta.id}
                    alerta={alerta}
                    onToggle={() => toggleAlerta(alerta.id, alerta.ativo)}
                    onDelete={() => excluirAlerta(alerta.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <NovoAlertaModal onClose={() => setShowModal(false)} onCreate={criarAlerta} />
        )}
      </AnimatePresence>
    </>
  );
}
