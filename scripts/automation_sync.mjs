import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BRASILIO_TOKEN = process.env.VITE_BRASILIO_TOKEN;

async function dailySync() {
  console.log('--- INICIANDO SINCRONIZAÇÃO AUTOMÁTICA DIÁRIA ---');
  
  try {
    // 1. Definir o período (Ontem)
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataFmt = ontem.toISOString().split('T')[0];
    
    console.log(`Buscando empresas abertas em: ${dataFmt}`);

    // 2. Buscar no Brasil.IO (Focado em RS para economizar espaço)
    const params = new URLSearchParams({
      uf: 'RS',
      data_inicio_atividade__gte: dataFmt,
      format: 'json',
      page_size: '100'
    });

    const res = await fetch(`https://api.brasil.io/v1/dataset/socios-brasil/empresas/data/?${params.toString()}`, {
      headers: { 'Authorization': `Token ${BRASILIO_TOKEN}` }
    });

    if (!res.ok) throw new Error('Erro na API Brasil.IO');
    const { results } = await res.json();

    if (!results || results.length === 0) {
      console.log('Nenhuma empresa nova encontrada ontem.');
      return;
    }

    console.log(`Processando ${results.length} novas empresas...`);

    // 3. Transformação Básica
    const empresas = results.map(item => ({
      cnpj: item.cnpj,
      razao_social: item.razao_social,
      uf: item.uf,
      municipio: item.municipio,
      data_abertura: item.data_inicio_atividade,
      fonte: 'automation_worker',
      importado_em: new Date().toISOString()
    }));

    // 4. Upsert no Supabase
    const { error, count } = await supabase
      .from('empresas')
      .upsert(empresas, { onConflict: 'cnpj', ignoreDuplicates: false });

    if (error) throw error;

    console.log(`✅ Sucesso! ${empresas.length} empresas sincronizadas automaticamente.`);
    
    // 5. Registrar Log de Atividade
    await supabase.from('activity_logs').insert({
      acao: 'Sincronização Automática',
      entidade: 'Sistema',
      detalhes: { data_referencia: dataFmt, registros: empresas.length }
    });

  } catch (err) {
    console.error('❌ ERRO NA AUTOMAÇÃO:', err.message);
  }
}

// Executa
dailySync();
