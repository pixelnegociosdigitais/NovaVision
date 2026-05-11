/**
 * Nova Vision - ETL Service
 */

import { supabase } from './supabase';
import { CNAE_EIXO_MAP, type Empresa, type ETLConfig, type ETLResult } from './types';

export function detectarEixo(cnae: string | number | undefined): string {
  if (!cnae) return 'Outro';
  const codigo = String(cnae);
  const prefixo2 = codigo.substring(0, 2);
  const prefixo1 = codigo.substring(0, 1);
  return CNAE_EIXO_MAP[prefixo2] || CNAE_EIXO_MAP[prefixo1] || 'Outro';
}

function calcularScore(empresa: any): number {
  let score = 50;
  if (empresa.descricao_situacao_cadastral === 'ATIVA') score += 20;
  if (empresa.nome_fantasia) score += 10;
  if (empresa.ddd_telefone_1) score += 5;
  if (empresa.email) score += 5;
  if (empresa.opcao_pelo_simples) score += 5;
  if (empresa.capital_social && empresa.capital_social > 5000) score += 5;
  return Math.min(score, 100);
}

function classificarPotencial(score: number): string {
  if (score >= 80) return 'Alto';
  if (score >= 60) return 'Médio';
  if (score >= 40) return 'Baixo';
  return 'Mínimo';
}

export function transformarEmpresa(raw: any): Empresa {
  const cnae = raw.cnae_fiscal || raw.cnae_fiscal_principal?.codigo;
  const score = calcularScore(raw);

  return {
    cnpj: (raw.cnpj || '').replace(/\D/g, ''),
    cnpj_basico: raw.cnpj ? raw.cnpj.replace(/\D/g, '').substring(0, 8) : undefined,
    razao_social: raw.razao_social || raw.nome || '',
    nome_fantasia: raw.nome_fantasia || undefined,
    natureza_juridica: raw.codigo_natureza_juridica || raw.natureza_juridica || undefined,
    descricao_natureza_juridica: raw.natureza_juridica_descricao || raw.natureza_juridica || undefined,
    cnae_fiscal: cnae,
    cnae_fiscal_descricao: raw.cnae_fiscal_descricao || raw.cnae_fiscal_principal?.descricao || undefined,
    cnaes_secundarios: (raw.cnaes_secundarios || []).map((c: any) => ({
      codigo: c.codigo,
      descricao: c.descricao,
    })),
    eixo_economico: detectarEixo(cnae),
    data_inicio_atividade: raw.data_inicio_atividade || raw.data_abertura || undefined,
    data_abertura: raw.data_inicio_atividade || raw.data_abertura || undefined,
    situacao_cadastral: raw.situacao_cadastral,
    descricao_situacao_cadastral: raw.descricao_situacao_cadastral || undefined,
    municipio: raw.municipio || undefined,
    uf: raw.uf || undefined,
    logradouro: raw.logradouro || undefined,
    numero: raw.numero || undefined,
    complemento: raw.complemento || undefined,
    bairro: raw.bairro || undefined,
    cep: raw.cep ? raw.cep.replace(/\D/g, '') : undefined,
    ddd_telefone_1: raw.ddd_telefone_1 ? `${raw.ddd_telefone_1}${raw.telefone_1 || ''}` : undefined,
    email: raw.email || undefined,
    descricao_porte: raw.descricao_porte || undefined,
    opcao_pelo_mei: raw.opcao_pelo_mei === 'S' || raw.opcao_pelo_mei === true || String(raw.codigo_natureza_juridica) === '2135' || String(raw.natureza_juridica) === '2135',
    opcao_pelo_simples: raw.opcao_pelo_simples === 'S' || raw.opcao_pelo_simples === true,
    capital_social: raw.capital_social ? parseFloat(raw.capital_social) : undefined,
    score_empresarial: score,
    potencial_comercial: classificarPotencial(score),
    fonte: raw.fonte || 'brasilio',
    importado_em: new Date().toISOString(),
  };
}

export async function buscarDosBrasilIO(config: ETLConfig): Promise<any[]> {
  const token = import.meta.env.VITE_BRASILIO_TOKEN;
  if (!token) throw new Error('Token Brasil.IO não configurado.');

  const params = new URLSearchParams();
  if (config.municipio) {
    const normalized = config.municipio
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    params.append('municipio', normalized);
  }
  if (config.uf) params.append('uf', config.uf.toUpperCase());
  if (config.cnae_prefix) params.append('cnae_fiscal__startswith', config.cnae_prefix);
  if (config.data_inicio) params.append('data_inicio_atividade__gte', config.data_inicio);
  if (config.data_fim) params.append('data_inicio_atividade__lte', config.data_fim);
  params.append('ordering', '-data_inicio_atividade');
  params.append('format', 'json');
  params.append('page_size', String(config.limit || 100));

  const url = `https://api.brasil.io/v1/dataset/socios-brasil/empresas/data/?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brasil.IO erro ${response.status}: ${text.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.results || data || [];
}

export async function buscarPorCnpjBrasilAPI(cnpj: string): Promise<any> {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
  if (!response.ok) throw new Error('Empresa não encontrada na BrasilAPI');
  return response.json();
}

export async function salvarEmpresasNoSupabase(empresas: Empresa[]): Promise<{ salvos: number; erros: string[] }> {
  const erros: string[] = [];
  let salvos = 0;
  const BATCH_SIZE = 50;
  for (let i = 0; i < empresas.length; i += BATCH_SIZE) {
    const lote = empresas.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('empresas').upsert(lote, { onConflict: 'cnpj' });
    if (error) erros.push(error.message);
    else salvos += lote.length;
  }
  return { salvos, erros };
}

export async function consultarEmpresas(filtros: {
  uf?: string;
  municipio?: string;
  municipios?: string[];
  eixo?: string;
  eixos?: string[];
  cnae_prefix?: string;
  data_inicio?: string;
  data_fim?: string;
  apenas_mei?: boolean;
  pagina?: number;
  por_pagina?: number;
  busca?: string;
}) {
  const { pagina = 1, por_pagina = 50 } = filtros;
  const from = (pagina - 1) * por_pagina;
  const to = from + por_pagina - 1;

  let query = supabase
    .from('empresas')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('data_abertura', { ascending: false });

  if (filtros.uf) query = query.eq('uf', filtros.uf.toUpperCase());
  if (filtros.municipios && filtros.municipios.length > 0) {
    query = query.in('municipio', filtros.municipios.map(m => m.toUpperCase()));
  } else if (filtros.municipio) {
    query = query.ilike('municipio', `%${filtros.municipio}%`);
  }

  // Eixos econômicos (suporte a único ou múltiplos)
  if (filtros.eixos && filtros.eixos.length > 0) {
    query = query.in('eixo_economico', filtros.eixos);
  } else if (filtros.eixo) {
    query = query.eq('eixo_economico', filtros.eixo);
  }

  if (filtros.data_inicio) query = query.gte('data_abertura', filtros.data_inicio);
  if (filtros.data_fim) query = query.lte('data_abertura', filtros.data_fim);
  if (filtros.apenas_mei) query = query.eq('opcao_pelo_mei', true);
  
  if (filtros.busca) {
    query = query.or(
      `razao_social.ilike.%${filtros.busca}%,nome_fantasia.ilike.%${filtros.busca}%,cnpj.ilike.%${filtros.busca}%`
    );
  }
  if (filtros.cnae_prefix) {
    query = query.like('cnae_fiscal::text', `${filtros.cnae_prefix}%`);
  }

  return query;
}

export async function buscarEstatisticas(filtros?: { 
  uf?: string; 
  municipios?: string[];
  eixos?: string[];
  apenas_mei?: boolean;
  data_inicio?: string;
  data_fim?: string;
}) {
  const hoje = new Date();
  const d30 = new Date(hoje); d30.setDate(hoje.getDate() - 30);
  const d7 = new Date(hoje); d7.setDate(hoje.getDate() - 7);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const applyGlobalFilters = (q: any) => {
    let query = q;
    if (filtros?.uf) query = query.eq('uf', filtros.uf.toUpperCase());
    if (filtros?.municipios && filtros.municipios.length > 0) {
      query = query.in('municipio', filtros.municipios.map(m => m.toUpperCase()));
    }
    if (filtros?.eixos && filtros.eixos.length > 0) {
      query = query.in('eixo_economico', filtros.eixos);
    }
    if (filtros?.apenas_mei) query = query.eq('opcao_pelo_mei', true);
    if (filtros?.data_inicio) query = query.gte('data_abertura', filtros.data_inicio);
    if (filtros?.data_fim) query = query.lte('data_abertura', filtros.data_fim);
    return query;
  };

  const [total, abertas30, abertas7, totalMei] = await Promise.all([
    applyGlobalFilters(supabase.from('empresas').select('id', { count: 'exact', head: true })),
    applyGlobalFilters(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d30))),
    applyGlobalFilters(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d7))),
    applyGlobalFilters(supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('opcao_pelo_mei', true)),
  ]);

  return {
    total_empresas: total.count || 0,
    abertas_30d: abertas30.count || 0,
    abertas_7d: abertas7.count || 0,
    total_mei: totalMei.count || 0,
  };
}

export async function buscarCidadesIbge(uf: string) {
  if (!uf) return [];
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    if (!response.ok) throw new Error('Falha ao buscar cidades no IBGE');
    const data = await response.json();
    return data.map((item: any) => item.nome.toUpperCase()).sort();
  } catch (err) {
    console.error('Erro IBGE:', err);
    return [];
  }
}

export async function buscarCidadesSugestao(uf: string, termo: string) {
  return []; 
}

export async function executarETL(config: ETLConfig, onLog: (m: string) => void): Promise<ETLResult> {
  const result: ETLResult = { total_buscados: 0, total_salvos: 0, total_erros: 0, erros: [], empresas: [] };
  try {
    onLog(`Buscando dados no Brasil.IO para ${config.municipio || config.uf || 'Brasil'}...`);
    const raw = await buscarDosBrasilIO(config);
    result.total_buscados = raw.length;
    
    if (raw.length === 0) {
      onLog('Nenhum dado novo encontrado para este filtro.');
      return result;
    }

    onLog(`Transformando e enriquecendo ${raw.length} registros via BrasilAPI...`);
    
    // Processamento em lotes para não estourar rate limit e ser mais rápido
    const empresas: Empresa[] = [];
    const BATCH_SIZE = 10; // Lotes pequenos para feedback visual constante
    
    for (let i = 0; i < raw.length; i += BATCH_SIZE) {
      const loteRaw = raw.slice(i, i + BATCH_SIZE);
      onLog(`Processando lote ${Math.floor(i/BATCH_SIZE) + 1} de ${Math.ceil(raw.length/BATCH_SIZE)}...`);
      
      const loteProcessado = await Promise.all(loteRaw.map(async (item: any) => {
        try {
          // Busca detalhes completos para cada CNPJ
          const details = await buscarPorCnpjBrasilAPI(item.cnpj);
          return transformarEmpresa({ ...item, ...details });
        } catch (err) {
          // Se falhar o detalhe, usa o que tem (mesmo que incompleto)
          return transformarEmpresa(item);
        }
      }));
      
      empresas.push(...loteProcessado);
    }
    
    onLog(`Sincronizando ${empresas.length} empresas com o banco de dados...`);
    const { salvos, erros } = await salvarEmpresasNoSupabase(empresas);
    
    result.total_salvos = salvos;
    result.total_erros = erros.length;
    result.erros = erros;
    result.empresas = empresas;
    onLog(`Sucesso: ${salvos} empresas alimentadas e detalhadas.`);
  } catch (err: any) {
    onLog(`Erro na sincronização: ${err.message}`);
    result.erros.push(err.message);
  }
  return result;
}
