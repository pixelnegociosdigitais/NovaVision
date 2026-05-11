-- ============================================================
-- Nova Vision - Schema Supabase
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Tabela principal de empresas
CREATE TABLE IF NOT EXISTS public.empresas (
  id                            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj                          VARCHAR(14) UNIQUE NOT NULL,
  cnpj_basico                   VARCHAR(8),
  razao_social                  TEXT NOT NULL,
  nome_fantasia                 TEXT,
  natureza_juridica             VARCHAR(10),
  descricao_natureza_juridica   TEXT,
  cnae_fiscal                   VARCHAR(10),
  cnae_fiscal_descricao         TEXT,
  cnaes_secundarios             JSONB DEFAULT '[]',
  eixo_economico                TEXT,
  data_inicio_atividade         DATE,
  data_abertura                 DATE,
  situacao_cadastral            VARCHAR(10),
  descricao_situacao_cadastral  TEXT,
  municipio                     TEXT,
  uf                            CHAR(2),
  logradouro                    TEXT,
  numero                        TEXT,
  complemento                   TEXT,
  bairro                        TEXT,
  cep                           VARCHAR(8),
  ddd_telefone_1                TEXT,
  email                         TEXT,
  descricao_porte               TEXT,
  opcao_pelo_mei                BOOLEAN DEFAULT FALSE,
  opcao_pelo_simples            BOOLEAN DEFAULT FALSE,
  capital_social                NUMERIC(15, 2),
  score_empresarial             INTEGER,
  potencial_comercial           TEXT,
  tags                          TEXT[] DEFAULT '{}',
  is_favorite                   BOOLEAN DEFAULT FALSE,
  observacoes                   TEXT,
  fonte                         TEXT DEFAULT 'brasilapi',
  importado_em                  TIMESTAMPTZ DEFAULT NOW(),
  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance em grandes volumes
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj         ON public.empresas (cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_uf           ON public.empresas (uf);
CREATE INDEX IF NOT EXISTS idx_empresas_municipio    ON public.empresas (municipio);
CREATE INDEX IF NOT EXISTS idx_empresas_cnae         ON public.empresas (cnae_fiscal);
CREATE INDEX IF NOT EXISTS idx_empresas_eixo         ON public.empresas (eixo_economico);
CREATE INDEX IF NOT EXISTS idx_empresas_data         ON public.empresas (data_abertura DESC);
CREATE INDEX IF NOT EXISTS idx_empresas_mei          ON public.empresas (opcao_pelo_mei);
CREATE INDEX IF NOT EXISTS idx_empresas_situacao     ON public.empresas (descricao_situacao_cadastral);
CREATE INDEX IF NOT EXISTS idx_empresas_importado    ON public.empresas (importado_em DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_empresas_fts ON public.empresas
  USING GIN (to_tsvector('portuguese', coalesce(razao_social,'') || ' ' || coalesce(nome_fantasia,'') || ' ' || cnpj));

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- Políticas RLS (Row Level Security)
-- ─────────────────────────────────────────
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (ajuste conforme autenticação)
CREATE POLICY "Leitura pública de empresas"
  ON public.empresas FOR SELECT
  USING (true);

-- Apenas usuários autenticados podem inserir/atualizar
CREATE POLICY "Inserção autenticada"
  ON public.empresas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Atualização autenticada"
  ON public.empresas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- View para estatísticas do Dashboard
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.vw_dashboard_stats AS
SELECT
  COUNT(*)                                           AS total_empresas,
  COUNT(*) FILTER (WHERE data_abertura >= NOW() - INTERVAL '7 days')   AS abertas_7d,
  COUNT(*) FILTER (WHERE data_abertura >= NOW() - INTERVAL '30 days')  AS abertas_30d,
  COUNT(*) FILTER (WHERE data_abertura >= NOW() - INTERVAL '90 days')  AS abertas_90d,
  COUNT(*) FILTER (WHERE opcao_pelo_mei = TRUE)      AS total_mei,
  eixo_economico AS principal_eixo
FROM public.empresas
GROUP BY eixo_economico
ORDER BY COUNT(*) DESC
LIMIT 1;

-- ─────────────────────────────────────────
-- View para ranking de municípios
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.vw_ranking_municipios AS
SELECT
  municipio,
  uf,
  COUNT(*)                    AS total,
  COUNT(*) FILTER (WHERE data_abertura >= NOW() - INTERVAL '30 days') AS abertas_30d
FROM public.empresas
WHERE municipio IS NOT NULL
GROUP BY municipio, uf
ORDER BY total DESC;

-- ─────────────────────────────────────────
-- View para crescimento por mês
-- ─────────────────────────────────────────
-- ─────────────────────────────────────────
-- Tabela de Alertas Inteligentes
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alertas (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo                  TEXT NOT NULL CHECK (tipo IN ('cidade','estado','cnae','eixo')),
  valor                 TEXT NOT NULL,
  descricao             TEXT,
  ativo                 BOOLEAN DEFAULT TRUE,
  notificacao_email     BOOLEAN DEFAULT TRUE,
  notificacao_dashboard BOOLEAN DEFAULT TRUE,
  total_disparos        INTEGER DEFAULT 0,
  ultimo_disparo        TIMESTAMPTZ,
  criado_em             TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alertas públicos" ON public.alertas FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_alertas_tipo  ON public.alertas (tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_ativo ON public.alertas (ativo);

-- ─────────────────────────────────────────
-- Tabela de Logs de Atividade
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  TEXT DEFAULT 'alexandre_silva', -- Mocked for now
  acao        TEXT NOT NULL,
  entidade    TEXT,
  detalhes    JSONB,
  ip_address  TEXT,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs públicos" ON public.activity_logs FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_logs_criado_em ON public.activity_logs (criado_em);

-- ─────────────────────────────────────────
-- View de crescimento mensal (mantida)
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.vw_crescimento_mensal AS
SELECT
  TO_CHAR(data_abertura, 'YYYY-MM') AS mes,
  COUNT(*)                           AS total
FROM public.empresas
WHERE data_abertura IS NOT NULL
  AND data_abertura >= NOW() - INTERVAL '12 months'
GROUP BY mes
ORDER BY mes ASC;
