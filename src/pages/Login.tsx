import React from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-brand-black">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-2xl">
            <Building2 className="text-brand-blue w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mb-1">Nova Vision</h1>
          <p className="text-slate-400 font-sans text-sm text-center opacity-80 uppercase tracking-[0.2em] font-medium">
            Inteligência de Mercado Premium
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-10 space-y-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent rounded-3xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">Bem-vindo à Elite</h2>
            <p className="text-slate-500 font-sans text-sm">Transformando dados em vantagem competitiva.</p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest px-1">E-mail Corporativo</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-brand-blue" />
                  <input 
                    type="email" 
                    placeholder="ex: ceo@empresa.com.br"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-widest">Senha de Acesso</label>
                  <button type="button" className="text-[10px] text-brand-blue hover:underline font-bold uppercase tracking-wider">Recuperar</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-brand-blue" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="w-full bg-brand-blue text-white font-display font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                Acessar Plataforma
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative px-4 bg-transparent text-[10px] font-display font-bold text-slate-600 uppercase tracking-widest">Ou acesse via</span>
            </div>

            <button type="button" className="w-full glass-panel py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
              <span className="text-sm font-display font-semibold text-slate-400">Corporativo Google</span>
            </button>
          </form>

          <p className="text-center text-[10px] font-display font-semibold text-slate-600 uppercase tracking-[0.2em] relative z-10">
            Nexus Tech Solutions © 2024
          </p>
        </div>
      </motion.div>
    </div>
  );
}
