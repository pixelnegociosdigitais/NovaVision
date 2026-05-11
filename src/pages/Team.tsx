import React, { useState } from 'react';
import {
  Users, UserPlus, Shield, MoreVertical, Mail,
  ShieldCheck, ShieldAlert, Clock, Search, Filter,
  X, Loader2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  name: string;
  role: 'Admin' | 'Analyst' | 'Guest';
  email: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Alexandre Silva', role: 'Admin', email: 'alexandre@novavision.ai', status: 'Active', lastActive: 'Online agora' },
  { id: '2', name: 'Ricardo Antunes', role: 'Admin', email: 'ricardo@novavision.ai', status: 'Active', lastActive: 'há 12 min' },
  { id: '3', name: 'Beatriz Costa', role: 'Analyst', email: 'beatriz@novavision.ai', status: 'Active', lastActive: 'há 1 hora' },
  { id: '4', name: 'Suelen Mendes', role: 'Analyst', email: 'suelen@novavision.ai', status: 'Inactive', lastActive: 'há 2 dias' },
  { id: '5', name: 'Marcos Oliveira', role: 'Analyst', email: 'marcos@novavision.ai', status: 'Active', lastActive: 'há 5 horas' },
];

function TeamMember({ member, onDelete }: { member: Member; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:bg-white/[0.05] transition-all border border-white/5"
    >
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-slate-400 text-lg overflow-hidden group-hover:border-brand-blue/30 transition-colors">
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-brand-black",
            member.status === 'Active' ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-slate-500"
          )} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-white group-hover:text-brand-blue transition-colors">{member.name}</h3>
            <span className={cn(
              "text-[10px] font-display font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
              member.role === 'Admin' ? "bg-brand-blue/10 text-brand-blue" : "bg-white/5 text-slate-500"
            )}>
              {member.role}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium font-sans">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {member.email}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {member.lastActive}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
          <Shield className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Team() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState('');
  const [inviting, setInviting] = useState(false);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const inviteMember = () => {
    setInviting(true);
    setTimeout(() => {
      setInviting(false);
      // Aqui integraria com Supabase futuramente
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Equipe e Acessos</h1>
          <p className="text-slate-400 font-sans">Controle de membros, cargos e atividade operacional do time</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button
            onClick={inviteMember}
            disabled={inviting}
            className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {inviting ? 'Enviando convite...' : 'Convidar Membro'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8">
            <h3 className="font-display font-bold text-white text-lg">Distribuição</h3>

            <div className="space-y-6">
              {[
                { label: 'Administradores', count: members.filter(m => m.role === 'Admin').length, icon: ShieldCheck, color: 'brand-blue' },
                { label: 'Analistas', count: members.filter(m => m.role === 'Analyst').length, icon: Users, color: 'brand-purple' },
                { label: 'Convidados', count: members.filter(m => m.role === 'Guest').length, icon: ShieldAlert, color: 'brand-cyan' },
              ].map((group) => (
                <div key={group.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-${group.color}/10`)}>
                      <group.icon className={cn("w-5 h-5", `text-${group.color}`)} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{group.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{group.count} membros</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-xs text-slate-500 font-medium mb-4">Seu plano Enterprise permite até 25 membros. {25 - members.length} vagas restantes.</p>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(members.length / 25) * 100}%` }}
                  className="h-full bg-brand-blue rounded-full"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 mb-2">
            <Search className="ml-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou cargo..."
              className="bg-transparent border-none py-3 text-sm text-white outline-none flex-1 placeholder-slate-600"
            />
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((member) => (
                <TeamMember key={member.id} member={member} onDelete={deleteMember} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="py-20 text-center glass-panel rounded-3xl border-dashed border-white/10">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-display">Nenhum membro encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
