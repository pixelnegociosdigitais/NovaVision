/**
 * Nova Vision - ETL Service
 * Pipeline: BrasilAPI → Transforma → Supabase
 * 
 * Busca empresas em lote por município/CNAE/período
 * e persiste os dados no banco Supabase.
 */

import { supabase } from './supabase';
import { CNAE_EIXO_MAP, type Empresa, type ETLConfig, type ETLResult } from './types';

// ─────────────────────────────────────────
// Helper: Detectar Eixo Econômico pelo CNAE
// ─────────────────────────────────────────
export function detectarEixo(cnae: string | number | undefined): string {
  if (!cnae) return 'Outro';
  const codigo = String(cnae);
  const prefixo2 = codigo.substring(0, 2);
  const prefixo1 = codigo.substring(0, 1);
  return CNAE_EIXO_MAP[prefixo2] || CNAE_EIXO_MAP[prefixo1] || 'Outro';
}

// ─────────────────────────────────────────
// Helper: Calcular Score Empresarial (0–100)
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// Helper: Classificar Potencial Comercial
// ─────────────────────────────────────────
function classificarPotencial(score: number): string {
  if (score >= 80) return 'Alto';
  if (score >= 60) return 'Médio';
  if (score >= 40) return 'Baixo';
  return 'Mínimo';
}

// ─────────────────────────────────────────
// Transformar dados brutos da BrasilAPI → Empresa
// ─────────────────────────────────────────
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
    opcao_pelo_mei: raw.opcao_pelo_mei === 'S' || raw.opcao_pelo_mei === true,
    opcao_pelo_simples: raw.opcao_pelo_simples === 'S' || raw.opcao_pelo_simples === true,
    capital_social: raw.capital_social ? parseFloat(raw.capital_social) : undefined,
    score_empresarial: score,
    potencial_comercial: classificarPotencial(score),
    fonte: 'brasilapi',
    importado_em: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────
// Busca em lote via BrasilAPI (por CNPJ individual — sem endpoint de listagem em lote)
// Para buscar em lote real precisamos do Brasil.IO
// ─────────────────────────────────────────
export async function buscarPorCnpjBrasilAPI(cnpj: string): Promise<any> {
  const clean = cnpj.replace(/\D/g, '');
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
  if (!response.ok) {
    throw new Error(`BrasilAPI erro para CNPJ ${cnpj}: ${response.statusText}`);
  }
  return response.json();
}

// ─────────────────────────────────────────
// Busca empresas do Brasil.IO (por município, CNAE, data)
// Requer token autenticado
// ─────────────────────────────────────────
export async function buscarDosBrasilIO(config: ETLConfig): Promise<any[]> {
  const token = import.meta.env.VITE_BRASILIO_TOKEN;
  if (!token) throw new Error('Token Brasil.IO não configurado.');

  const params = new URLSearchParams();
  if (config.municipio) params.append('municipio', config.municipio.toUpperCase());
  if (config.uf) params.append('uf', config.uf.toUpperCase());
  if (config.cnae_prefix) params.append('cnae_fiscal__startswith', config.cnae_prefix);
  if (config.data_inicio) params.append('data_inicio_atividade__gte', config.data_inicio);
  if (config.data_fim) params.append('data_inicio_atividade__lte', config.data_fim);
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

// ─────────────────────────────────────────
// Salvar lista de empresas no Supabase (upsert por CNPJ)
// ─────────────────────────────────────────
export async function salvarEmpresasNoSupabase(empresas: Empresa[]): Promise<{ salvos: number; erros: string[] }> {
  const erros: string[] = [];
  let salvos = 0;

  // Processa em lotes de 50 para evitar limite de payload
  const BATCH_SIZE = 50;
  for (let i = 0; i < empresas.length; i += BATCH_SIZE) {
    const lote = empresas.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('empresas')
      .upsert(lote, {
        onConflict: 'cnpj',
        ignoreDuplicates: false,
      });

    if (error) {
      erros.push(`Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      salvos += lote.length;
    }
  }

  return { salvos, erros };
}

// ─────────────────────────────────────────
// ETL COMPLETO: busca → transforma → salva
// ─────────────────────────────────────────
export async function executarETL(
  config: ETLConfig,
  onProgress?: (msg: string) => void
): Promise<ETLResult> {
  const result: ETLResult = {
    total_buscados: 0,
    total_salvos: 0,
    total_erros: 0,
    erros: [],
    empresas: [],
  };

  try {
    onProgress?.('🔍 Buscando empresas na fonte de dados...');

    let rawEmpresas: any[] = [];

    if (config.fonte === 'brasilio') {
      rawEmpresas = await buscarDosBrasilIO(config);
    } else {
      // BrasilAPI não tem endpoint de listagem — retornar erro orientativo
      throw new Error(
        'A BrasilAPI permite apenas busca por CNPJ individual. Use a fonte "Brasil.IO" para busca em lote.'
      );
    }

    result.total_buscados = rawEmpresas.length;
    onProgress?.(`📦 ${rawEmpresas.length} registros obtidos. Transformando dados...`);

    // Transformar dados
    const empresasTransformadas = rawEmpresas.map(transformarEmpresa);

    // Filtrar MEI se solicitado
    const empresasFiltradas = config.apenas_mei
      ? empresasTransformadas.filter((e) => e.opcao_pelo_mei)
      : empresasTransformadas;

    result.empresas = empresasFiltradas;
    onProgress?.(`⚙️ ${empresasFiltradas.length} empresas prontas. Salvando no banco...`);

    // Salvar no Supabase
    const { salvos, erros } = await salvarEmpresasNoSupabase(empresasFiltradas);

    result.total_salvos = salvos;
    result.total_erros = erros.length;
    result.erros = erros;

    onProgress?.(`✅ ETL concluído: ${salvos} empresas salvas.`);
  } catch (err: any) {
    result.erros.push(err.message);
    result.total_erros++;
    onProgress?.(`❌ Erro: ${err.message}`);
  }

  return result;
}

// ─────────────────────────────────────────
// Consultar empresas do Supabase (com filtros)
// ─────────────────────────────────────────
export async function consultarEmpresas(filtros: {
  municipio?: string;
  municipios?: string[];
  uf?: string;
  cnae_prefix?: string;
  eixo?: string;
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

  if (filtros.eixo) query = query.eq('eixo_economico', filtros.eixo);
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

// ─────────────────────────────────────────
// Estatísticas rápidas para o Dashboard
// ─────────────────────────────────────────
export async function buscarEstatisticas(filtros?: { uf?: string; municipios?: string[] }) {
  const hoje = new Date();
  const d7 = new Date(hoje); d7.setDate(hoje.getDate() - 7);
  const d30 = new Date(hoje); d30.setDate(hoje.getDate() - 30);
  const d90 = new Date(hoje); d90.setDate(hoje.getDate() - 90);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const applyBaseFilters = (q: any) => {
    let query = q;
    if (filtros?.uf) query = query.eq('uf', filtros.uf.toUpperCase());
    if (filtros?.municipios && filtros.municipios.length > 0) {
      query = query.in('municipio', filtros.municipios.map(m => m.toUpperCase()));
    }
    return query;
  };

  const [total, abertas7, abertas30, abertas90] = await Promise.all([
    applyBaseFilters(supabase.from('empresas').select('id', { count: 'exact', head: true })),
    applyBaseFilters(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d7))),
    applyBaseFilters(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d30))),
    applyBaseFilters(supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('data_abertura', fmt(d90))),
  ]);

  return {
    total_empresas: total.count || 0,
    abertas_7d: abertas7.count || 0,
    abertas_30d: abertas30.count || 0,
    abertas_90d: abertas90.count || 0,
  };
}
