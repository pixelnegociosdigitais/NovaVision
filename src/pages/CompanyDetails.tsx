import React, { useEffect, useState } from 'react';
import {
  Building2, MapPin, ShieldCheck, Share2, Download,
  Calendar, Layers, ArrowUpRight, TrendingUp, Activity,
  User, Star, ChevronLeft, Copy, Check, Zap, Briefcase,
  Phone, Mail, Globe, Hash, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { buscarPorCnpjBrasilAPI, detectarEixo } from '@/lib/etl';
import { registrarLog } from '@/lib/activity';
import type { Empresa } from '@/lib/types';

const EIXO_COLORS: Record<string, string> = {
  'Comércio':'#568dff','Serviços':'#00e3fd','Tecnologia':'#a078ff','Indústria':'#f43f5e',
  'Saúde':'#10b981','Educação':'#f59e0b','Construção':'#fb923c','Agronegócio':'#84cc16',
  'Financeiro':'#e879f9','Turismo':'#38bdf8','Outro':'#64748b',
};

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-white/5 rounded-xl', className)} />;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon: any }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-white/5 last:border-0 group">
      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-blue/10 transition-colors shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-blue transition-colors" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm text-slate-200 font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function formatCnpj(cnpj?: string) {
  if (!cnpj) return '';
  const d = cnpj.replace(/\D/g, '');
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function calcularIdade(dataAbertura?: string | null): string {
  if (!dataAbertura) return '—';
  const inicio = new Date(dataAbertura + 'T12:00:00');
  const agora = new Date();
  const anos = agora.getFullYear() - inicio.getFullYear();
  const meses = agora.getMonth() - inicio.getMonth();
  const totalMeses = anos * 12 + meses;
  if (totalMeses < 12) return `${totalMeses} meses`;
  const a = Math.floor(totalMeses / 12);
  const m = totalMeses % 12;
  return m > 0 ? `${a} anos e ${m} meses` : `${a} anos`;
}

interface CompanyDetailsProps {
  empresa?: Empresa | null;
  onBack?: () => void;
}

export default function CompanyDetails({ empresa: empresaProp, onBack }: CompanyDetailsProps) {
  const [empresa, setEmpresa] = useState<Empresa | null>(empresaProp || null);
  const [loading, setLoading] = useState(!empresaProp);
  const [enriching, setEnriching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Se não recebeu empresa via prop, tenta enriquecer via BrasilAPI
  useEffect(() => {
    if (empresaProp) {
      setEmpresa(empresaProp);
      setIsFav(empresaProp.is_favorite || false);
      setLoading(false);

      registrarLog('Visualizou Empresa', empresaProp.nome_fantasia || empresaProp.razao_social, { cnpj: empresaProp.cnpj });

      // Enriquece com dados da BrasilAPI se CNPJ disponível
      if (empresaProp.cnpj && !empresaProp.cnae_fiscal_descricao) {
        enriquecerDados(empresaProp.cnpj);
      }
    } else {
      setLoading(false);
    }
  }, [empresaProp]);

  const enriquecerDados = async (cnpj: string) => {
    setEnriching(true);
    try {
      const raw = await buscarPorCnpjBrasilAPI(cnpj);
      setEmpresa(prev => prev ? {
        ...prev,
        cnae_fiscal_descricao: raw.cnae_fiscal_descricao || prev.cnae_fiscal_descricao,
        cnaes_secundarios: raw.cnaes_secundarios || prev.cnaes_secundarios,
        natureza_juridica: raw.codigo_natureza_juridica || prev.natureza_juridica,
        descricao_natureza_juridica: raw.natureza_juridica || prev.descricao_natureza_juridica,
        logradouro: raw.logradouro || prev.logradouro,
        numero: raw.numero || prev.numero,
        bairro: raw.bairro || prev.bairro,
        cep: raw.cep || prev.cep,
        ddd_telefone_1: raw.ddd_telefone_1 ? `(${raw.ddd_telefone_1}) ${raw.telefone_1}` : prev.ddd_telefone_1,
        email: raw.email || prev.email,
        descricao_porte: raw.descricao_porte || prev.descricao_porte,
        capital_social: raw.capital_social || prev.capital_social,
      } : prev);
    } catch (e) {
      // silencioso — usa dados do banco
    } finally {
      setEnriching(false);
    }
  };

  const copiarCnpj = () => {
    if (empresa?.cnpj) {
      navigator.clipboard.writeText(formatCnpj(empresa.cnpj));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFavorito = async () => {
    if (!empresa?.cnpj) return;
    const novoValor = !isFav;
    setIsFav(novoValor);
    await supabase.from('empresas').update({ is_favorite: novoValor }).eq('cnpj', empresa.cnpj);
    registrarLog(novoValor ? 'Favoritou Empresa' : 'Removeu Favorito', empresa.nome_fantasia || empresa.razao_social);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-80 rounded-3xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <Building2 className="w-16 h-16 text-slate-700" />
        <h2 className="text-xl font-display font-bold text-slate-400">Nenhuma empresa selecionada</h2>
        <p className="text-slate-600 text-sm">Acesse a aba <strong className="text-slate-500">Empresas</strong> e clique em uma empresa para ver seus detalhes.</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-display font-bold text-sm hover:scale-105 transition-all">
            Ir para Empresas
          </button>
        )}
      </div>
    );
  }

  const eixoColor = EIXO_COLORS[empresa.eixo_economico || 'Outro'] || '#64748b';
  const score = empresa.score_empresarial || 50;
  const isAtiva = empresa.descricao_situacao_cadastral === 'ATIVA';
  const enderecoCompleto = [
    empresa.logradouro && empresa.numero ? `${empresa.logradouro}, ${empresa.numero}` : empresa.logradouro,
    empresa.complemento,
    empresa.bairro,
    empresa.cep ? `CEP: ${empresa.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}` : null,
  ].filter(Boolean).join(' — ');

  return (
    <div className="space-y-8">
      {/* Breadcrumb / Voltar */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-display font-semibold">
          <ChevronLeft className="w-4 h-4" /> Voltar para Empresas
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-purple p-0.5 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[22px] bg-brand-black flex items-center justify-center">
              <Building2 className="text-brand-blue w-8 h-8" />
            </div>
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-display font-bold tracking-tight text-white">
                {empresa.nome_fantasia || empresa.razao_social}
              </h1>
              <span className={cn(
                'text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest shrink-0',
                isAtiva ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              )}>
                {empresa.descricao_situacao_cadastral || 'N/D'}
              </span>
              {enriching && <span className="text-[10px] text-brand-cyan animate-pulse">Enriquecendo dados...</span>}
            </div>
            {empresa.nome_fantasia && (
              <p className="text-slate-500 text-sm font-medium">{empresa.razao_social}</p>
            )}
            <button onClick={copiarCnpj} className="flex items-center gap-2 text-slate-400 font-mono text-sm hover:text-white transition-colors group">
              <span>CNPJ: {formatCnpj(empresa.cnpj)}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <button onClick={toggleFavorito}
            className={cn('p-3 rounded-xl border transition-all', isFav ? 'border-amber-400/30 bg-amber-400/10 text-amber-400' : 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white')}>
            <Star className={cn('w-5 h-5', isFav && 'fill-amber-400')} />
          </button>
          <button className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-slate-400 hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="bg-brand-blue text-white px-6 py-3 rounded-xl font-display font-bold text-sm shadow-[0_0_20px_rgba(86,141,255,0.3)] hover:scale-105 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Idade', value: calcularIdade(empresa.data_abertura), icon: Clock, color: 'text-brand-blue' },
          { label: 'Eixo Econômico', value: empresa.eixo_economico || 'N/D', icon: Briefcase, color: 'text-brand-cyan', style: { color: eixoColor } },
          { label: 'Score Empresarial', value: `${score}/100`, icon: TrendingUp, color: score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400' },
          { label: 'Potencial Comercial', value: empresa.potencial_comercial || '—', icon: Zap, color: empresa.potencial_comercial === 'Alto' ? 'text-emerald-400' : 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color, style }) => (
          <div key={label} className="glass-panel p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', color)} style={style} />
              <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-xl font-display font-bold text-white" style={style}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna esquerda — Identificação */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-7 rounded-3xl">
            <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-blue" /> Identificação
            </h3>
            <InfoRow label="Razão Social"        value={empresa.razao_social}                icon={Building2}   />
            <InfoRow label="Nome Fantasia"        value={empresa.nome_fantasia}               icon={Hash}        />
            <InfoRow label="CNAE Principal"       value={empresa.cnae_fiscal ? `${empresa.cnae_fiscal} — ${empresa.cnae_fiscal_descricao || ''}` : null} icon={Layers} />
            <InfoRow label="Natureza Jurídica"    value={empresa.descricao_natureza_juridica} icon={ShieldCheck} />
            <InfoRow label="Porte"                value={empresa.descricao_porte}             icon={Activity}    />
            <InfoRow label="Data de Abertura"     value={empresa.data_abertura ? new Date(empresa.data_abertura + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }) : null} icon={Calendar} />
            {empresa.capital_social != null && (
              <InfoRow label="Capital Social"
                value={`R$ ${Number(empresa.capital_social).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={TrendingUp}
              />
            )}
          </div>

          {/* Score Card */}
          <div className="glass-panel p-7 rounded-3xl bg-gradient-to-br from-brand-blue/5 to-transparent border-l-4 border-l-brand-blue space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-base font-bold text-white">Score Analytics</h3>
              <TrendingUp className="w-4 h-4 text-brand-blue" />
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400 text-sm">Saúde Empresarial</span>
                <span className="text-brand-blue font-display font-bold text-xl">{score}/100</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e' }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Potencial comercial classificado como{' '}
              <span className="font-semibold" style={{ color: empresa.potencial_comercial === 'Alto' ? '#10b981' : '#f59e0b' }}>
                {empresa.potencial_comercial || 'Baixo'}
              </span>
              {isAtiva ? '. Empresa com cadastro ativo na Receita Federal.' : '. Atenção: situação cadastral não ativa.'}
            </p>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="lg:col-span-8 space-y-6">
          {/* Contato e Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-7 rounded-3xl space-y-1">
              <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-cyan" /> Localização
              </h3>
              {enderecoCompleto ? (
                <div className="space-y-2">
                  <p className="text-slate-200 font-medium text-sm leading-relaxed">{enderecoCompleto}</p>
                  <p className="text-slate-400 text-sm font-semibold">
                    {[empresa.municipio, empresa.uf].filter(Boolean).join(' — ')}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent([enderecoCompleto, empresa.municipio, empresa.uf].filter(Boolean).join(', '))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-brand-blue hover:underline mt-2"
                  >
                    <Globe className="w-3.5 h-3.5" /> Ver no Google Maps
                  </a>
                </div>
              ) : (
                <div className="aspect-video bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                  <div className="text-center text-slate-600 space-y-1">
                    <MapPin className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-display font-bold uppercase tracking-widest">
                      {empresa.municipio && empresa.uf ? `${empresa.municipio}, ${empresa.uf}` : 'Endereço não disponível'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel p-7 rounded-3xl space-y-1">
              <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-purple" /> Contato
              </h3>
              <InfoRow label="Telefone" value={empresa.ddd_telefone_1} icon={Phone} />
              <InfoRow label="E-mail"   value={empresa.email}           icon={Mail}  />
              <InfoRow label="MEI"
                value={empresa.opcao_pelo_mei ? 'Sim — Optante pelo MEI' : empresa.opcao_pelo_mei === false ? 'Não' : undefined}
                icon={User}
              />
              <InfoRow label="Simples Nacional"
                value={empresa.opcao_pelo_simples ? 'Sim — Optante pelo Simples' : empresa.opcao_pelo_simples === false ? 'Não' : undefined}
                icon={ShieldCheck}
              />
              {!empresa.ddd_telefone_1 && !empresa.email && (
                <p className="text-slate-600 text-sm text-center py-4">Dados de contato não disponíveis</p>
              )}
            </div>
          </div>

          {/* CNAEs Secundários */}
          {empresa.cnaes_secundarios && empresa.cnaes_secundarios.length > 0 && (
            <div className="glass-panel p-7 rounded-3xl space-y-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-purple" /> CNAEs Secundários
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg">
                  {empresa.cnaes_secundarios.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {empresa.cnaes_secundarios.slice(0, 8).map((cnae, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-lg shrink-0">{cnae.codigo}</span>
                    <span className="text-xs text-slate-400 leading-relaxed">{cnae.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="glass-panel p-7 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-purple" /> Timeline Empresarial
              </h3>
            </div>
            <div className="relative space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {[
                empresa.data_abertura && {
                  date: new Date(empresa.data_abertura + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                  event: 'Abertura da Empresa',
                  detail: `Início das atividades — ${empresa.cnae_fiscal_descricao || empresa.eixo_economico || 'setor registrado na RF'}`,
                  color: '#568dff',
                },
                empresa.importado_em && {
                  date: new Date(empresa.importado_em).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                  event: 'Importado para Nova Vision',
                  detail: `Dados sincronizados via ${empresa.fonte === 'brasilio' ? 'Brasil.IO' : 'BrasilAPI'}`,
                  color: '#00e3fd',
                },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} className="relative pl-10 group">
                  <div className="absolute left-[7px] top-2 w-1.5 h-1.5 rounded-full ring-4 ring-brand-blue/20 transition-all group-hover:scale-150"
                    style={{ backgroundColor: item.color }} />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-display font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.date}</p>
                    <p className="text-sm font-semibold text-slate-200">{item.event}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
