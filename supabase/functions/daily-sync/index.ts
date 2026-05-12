import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BRASILIO_TOKEN = Deno.env.get('BRASILIO_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // 1. Data de Ontem
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    const dataFmt = ontem.toISOString().split('T')[0]
    
    console.log(`Iniciando sync para data: ${dataFmt}`)

    // 2. Busca no Brasil.IO
    const params = new URLSearchParams({
      uf: 'RS',
      data_inicio_atividade__gte: dataFmt,
      format: 'json',
      page_size: '100'
    })

    const res = await fetch(`https://api.brasil.io/v1/dataset/socios-brasil/empresas/data/?${params.toString()}`, {
      headers: { 'Authorization': `Token ${BRASILIO_TOKEN}` }
    })

    if (!res.ok) throw new Error(`Erro Brasil.IO: ${res.status}`)
    const { results } = await res.json()

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ message: 'Sem dados para ontem' }), { status: 200 })
    }

    // 3. Preparação e Upsert
    const empresas = results.map((item: any) => ({
      cnpj: item.cnpj,
      razao_social: item.razao_social,
      uf: item.uf,
      municipio: item.municipio,
      data_abertura: item.data_inicio_atividade,
      fonte: 'edge_function_cron',
      importado_em: new Date().toISOString()
    }))

    const { error } = await supabase.from('empresas').upsert(empresas, { onConflict: 'cnpj' })
    if (error) throw error

    // 4. Log
    await supabase.from('activity_logs').insert({
      acao: 'Cron Sync Automático',
      entidade: 'Edge Function',
      detalhes: { data: dataFmt, registros: empresas.length }
    })

    return new Response(JSON.stringify({ success: true, count: empresas.length }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
