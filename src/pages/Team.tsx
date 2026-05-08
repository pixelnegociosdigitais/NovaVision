import React from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  MoreVertical, 
  Mail, 
  ShieldCheck,
  ShieldAlert,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const TeamMember = ({ name, role, email, status, lastActive, avatar }: any) => (
  <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:bg-white/[0.05] transition-all border border-white/5">
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-slate-400 text-lg overflow-hidden">
          {avatar ? (
             <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
             name.split(' ').map((n: string) => n[0]).join('')
          )}
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-brand-black",
          status === 'Active' ? "bg-emerald-400" : "bg-slate-500"
        )} />
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-bold text-white group-hover:text-brand-blue transition-colors">{name}</h3>
          <span className={cn(
            "text-[10px] font-display font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
            role === 'Admin' ? "bg-brand-blue/10 text-brand-blue" : "bg-white/5 text-slate-500"
          )}>
            {role}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium font-sans">
          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {email}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {lastActive}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
        <Shield className="w-4 h-4" />
      </button>
      <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function Team() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">Gestão de Equipe</h1>
          <p className="text-slate-400 font-sans">Controle de acessos, permissões e atividade operacional</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 font-display font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Convidar Membro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-8">
            <h3 className="font-display font-bold text-white text-lg">Resumo de Acessos</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Full Access</p>
                    <p className="text-xs text-slate-500 font-medium">3 Admnistradores</p>
                  </div>
                </div>
              </div>

               <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Analistas</p>
                    <p className="text-xs text-slate-500 font-medium">12 Operadores</p>
                  </div>
                </div>
              </div>

               <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Guest</p>
                    <p className="text-xs text-slate-500 font-medium">0 Convidados ativos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-xs text-slate-500 font-medium mb-4">Assinatura Enterprise permite até 25 membros. Restam 10 vagas.</p>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 mb-6">
            <Search className="ml-3 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou cargo..."
              className="bg-transparent border-none py-2 text-sm text-white outline-none flex-1"
            />
          </div>

          {[
            { name: 'Ricardo Antunes', role: 'Admin', email: 'ricardo@nexus.ai', status: 'Active', lastActive: 'Acessando agora', avatar: null },
            { name: 'Suelen Mendes', role: 'Analyst', email: 'suelen@nexus.ai', status: 'Active', lastActive: 'há 12 min', avatar: null },
            { name: 'Marcos Oliveira', role: 'Analyst', email: 'marcos@nexus.ai', status: 'Active', lastActive: 'há 1 hora', avatar: null },
            { name: 'Beatriz Costa', role: 'Analyst', email: 'beatriz@nexus.ai', status: 'Inactive', lastActive: 'há 2 dias', avatar: null },
            { name: 'Felipe Rocha', role: 'Admin', email: 'felipe@nexus.ai', status: 'Active', lastActive: 'Acessando agora', avatar: null },
          ].map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TeamMember {...member} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
