/**
 * Serviço de integração com a API do Brasil.io
 * Focado no dataset de CNPJ (Empresas, Estabelecimentos e Sócios)
 */

const BRASILIO_TOKEN = import.meta.env.VITE_BRASILIO_TOKEN;

if (!BRASILIO_TOKEN) {
  console.warn('⚠️ Token do Brasil.io não encontrado! Configure VITE_BRASILIO_TOKEN no .env.local');
}

const headers = {
  'Authorization': `Token ${BRASILIO_TOKEN}`,
  'Content-Type': 'application/json',
};

const BASE_URL = 'https://api.brasil.io/v1/dataset/socios-brasil';

/**
 * Busca dados da tabela de EMPRESAS (Dados raiz do CNPJ, como Razão Social e Natureza Jurídica).
 * Para MEI, geralmente a natureza jurídica é "2135" (Empresário Individual).
 */
export async function buscarEmpresas(filtros: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}/empresas/data/`);
  
  // Adiciona os filtros na URL (ex: codigo_natureza_juridica=2135)
  Object.keys(filtros).forEach(key => url.searchParams.append(key, filtros[key]));

  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar empresas no Brasil.io: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Busca dados da tabela de ESTABELECIMENTOS (Dados de filiais, endereço, CNAE principal).
 * Ideal para buscar MEIs de uma cidade específica.
 */
export async function buscarEstabelecimentos(filtros: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}/estabelecimentos/data/`);
  
  Object.keys(filtros).forEach(key => url.searchParams.append(key, filtros[key]));

  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar estabelecimentos no Brasil.io: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Busca se o CNPJ é optante pelo Simples Nacional ou MEI
 * Tabela: simples
 */
export async function buscarOpcaoSimplesMei(cnpjBasico: string) {
  const url = new URL(`${BASE_URL}/simples/data/`);
  url.searchParams.append('cnpj_basico', cnpjBasico);

  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados do Simples/MEI no Brasil.io: ${response.statusText}`);
  }
  
  return response.json();
}
