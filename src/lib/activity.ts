import { supabase } from './supabase';

/**
 * Registra uma atividade no log do sistema
 */
export async function registrarLog(acao: string, entidade?: string, detalhes?: any) {
  try {
    await supabase.from('activity_logs').insert([{
      acao,
      entidade,
      detalhes,
      ip_address: '127.0.0.1' // Mocked para ambiente local
    }]);
  } catch (e) {
    console.error('Erro ao registrar log:', e);
  }
}

/**
 * Busca os logs de atividade recentes
 */
export async function buscarLogsRecentes(limit = 10) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}
