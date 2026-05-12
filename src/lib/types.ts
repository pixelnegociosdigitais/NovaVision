/**
 * Nova Vision - Tipos TypeScript Globais
 * Modelos de dados da plataforma
 */

// ─────────────────────────────────────────
// Empresa (conforme dados da BrasilAPI/Receita Federal)
// ─────────────────────────────────────────
export interface Empresa {
  id?: string;
  cnpj: string;
  cnpj_basico?: string;
  razao_social: string;
  nome_fantasia?: string;
  natureza_juridica?: string;
  descricao_natureza_juridica?: string;
  cnae_fiscal?: string | number;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: CnaeSecundario[];
  eixo_economico?: string;
  data_inicio_atividade?: string;
  data_abertura?: string;
  situacao_cadastral?: number | string;
  descricao_situacao_cadastral?: string;
  municipio?: string;
  uf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  ddd_telefone_1?: string;
  email?: string;
  descricao_porte?: string;
  opcao_pelo_mei?: boolean;
  opcao_pelo_simples?: boolean;
  capital_social?: number;
  score_empresarial?: number;
  potencial_comercial?: string;
  tags?: string[];
  is_favorite?: boolean;
  observacoes?: string;
  socios?: any[];
  created_at?: string;
  updated_at?: string;
  importado_em?: string;
  fonte?: 'brasilapi' | 'brasilio' | 'manual';
}

export interface CnaeSecundario {
  codigo: string | number;
  descricao: string;
}

// ─────────────────────────────────────────
// Eixo Econômico (classificação setorial)
// ─────────────────────────────────────────
export type EixoEconomico =
  | 'Comércio'
  | 'Indústria'
  | 'Serviços'
  | 'Agronegócio'
  | 'Tecnologia'
  | 'Saúde'
  | 'Educação'
  | 'Construção'
  | 'Financeiro'
  | 'Turismo'
  | 'Outro';

// Mapeamento de seções CNAE → Eixo Econômico
export const CNAE_EIXO_MAP: Record<string, EixoEconomico> = {
  // Agropecuária
  '01': 'Agronegócio', '02': 'Agronegócio', '03': 'Agronegócio',
  // Indústria extrativa e transformação
  '05': 'Indústria', '06': 'Indústria', '07': 'Indústria', '08': 'Indústria', '09': 'Indústria',
  '10': 'Indústria', '11': 'Indústria', '12': 'Indústria', '13': 'Indústria', '14': 'Indústria',
  '15': 'Indústria', '16': 'Indústria', '17': 'Indústria', '18': 'Indústria', '19': 'Indústria',
  '20': 'Indústria', '21': 'Saúde', '22': 'Indústria', '23': 'Indústria', '24': 'Indústria',
  '25': 'Indústria', '26': 'Tecnologia', '27': 'Indústria', '28': 'Indústria', '29': 'Indústria',
  '30': 'Indústria', '31': 'Indústria', '32': 'Indústria', '33': 'Indústria',
  // Construção
  '41': 'Construção', '42': 'Construção', '43': 'Construção',
  // Comércio
  '45': 'Comércio', '46': 'Comércio', '47': 'Comércio',
  // Transportes e afins
  '49': 'Serviços', '50': 'Serviços', '51': 'Serviços', '52': 'Serviços', '53': 'Serviços',
  // Alimentação
  '55': 'Turismo', '56': 'Turismo',
  // Informação e tecnologia
  '58': 'Tecnologia', '59': 'Tecnologia', '60': 'Tecnologia', '61': 'Tecnologia', '62': 'Tecnologia', '63': 'Tecnologia',
  // Financeiro
  '64': 'Financeiro', '65': 'Financeiro', '66': 'Financeiro',
  // Imobiliário
  '68': 'Serviços',
  // Profissionais e científicos
  '69': 'Serviços', '70': 'Serviços', '71': 'Serviços', '72': 'Tecnologia', '73': 'Serviços', '74': 'Serviços', '75': 'Serviços',
  // Administrativos
  '77': 'Serviços', '78': 'Serviços', '79': 'Turismo', '80': 'Serviços', '81': 'Serviços', '82': 'Serviços',
  // Educação
  '85': 'Educação', '86': 'Saúde', '87': 'Saúde', '88': 'Saúde',
  // Artes e entretenimento
  '90': 'Turismo', '91': 'Turismo', '92': 'Turismo', '93': 'Turismo',
  // Outros serviços
  '94': 'Serviços', '95': 'Tecnologia', '96': 'Serviços', '97': 'Serviços',
};

// ─────────────────────────────────────────
// Resultado do ETL
// ─────────────────────────────────────────
export interface ETLResult {
  total_buscados: number;
  total_salvos: number;
  total_erros: number;
  erros: string[];
  empresas: Empresa[];
}

export interface ETLConfig {
  municipio?: string;
  uf?: string;
  cnae_prefix?: string;   // ex: "45" para comércio
  data_inicio?: string;   // ISO date
  data_fim?: string;      // ISO date
  apenas_mei?: boolean;
  limit?: number;
  fonte: 'brasilapi' | 'brasilio';
}

// ─────────────────────────────────────────
// Estatísticas do Dashboard
// ─────────────────────────────────────────
export interface DashboardStats {
  total_empresas: number;
  abertas_7d: number;
  abertas_30d: number;
  abertas_90d: number;
  crescimento_mensal_pct: number;
  principal_eixo: string;
  cidade_maior_crescimento: string;
}

// ─────────────────────────────────────────
// Filtros de listagem
// ─────────────────────────────────────────
export interface EmpresaFiltros {
  busca?: string;
  uf?: string;
  municipio?: string;
  cnae?: string;
  eixo?: string;
  data_inicio?: string;
  data_fim?: string;
  situacao?: string;
  apenas_mei?: boolean;
  pagina?: number;
  por_pagina?: number;
  ordenar_por?: string;
  ordem?: 'asc' | 'desc';
}
