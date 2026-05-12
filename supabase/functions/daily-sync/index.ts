import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BRASILIO_TOKEN = Deno.env.get('BRASILIO_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
    const dataFmt = ontem.toISOString().split('T')[0];
    
    console.log(`Iniciando sync completo para: ${dataFmt}`)

    // 1. Busca no Brasil.IO
    const res = await fetch(`https://api.brasil.io/v1/dataset/socios-brasil/empresas/data/?uf=RS&data_inicio_atividade__gte=${dataFmt}&page_size=30`, {
      headers: { 'Authorization': `Token ${BRASILIO_TOKEN}` }
    })

    const { results } = await res.json()
    if (!results || results.length === 0) return new Response("Sem dados", { status: 200 })

    const empresas = []
    
    // 2. Enriquecimento via BrasilAPI (Socios, Contatos, Endereço)
    for (const item of results) {
      try {
        const detailRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${item.cnpj}`, {
          headers: { 'User-Agent': 'NovaVision/1.0' }
        })
        
        if (detailRes.ok) {
          const d = await detailRes.json()
          empresas.push({
            cnpj: item.cnpj,
            razao_social: d.razao_social || item.razao_social,
            nome_fantasia: d.nome_fantasia,
            uf: d.uf || item.uf,
            municipio: d.municipio || item.municipio,
            logradouro: d.logradouro,
            numero: d.numero,
            bairro: d.bairro,
            cep: d.cep,
            ddd_telefone_1: d.ddd_telefone_1 ? `${d.ddd_telefone_1}${d.telefone_1 || ''}` : d.ddd_telefone_1,
            email: d.email,
            data_abertura: d.data_inicio_atividade || item.data_inicio_atividade,
            socios: d.qsa,
            fonte: 'cron_full_sync',
            importado_em: new Date().toISOString()
          })
        } else {
          // Fallback se a BrasilAPI falhar
          empresas.push({
            cnpj: item.cnpj,
            razao_social: item.razao_social,
            uf: item.uf,
            municipio: item.municipio,
            data_abertura: item.data_inicio_atividade,
            fonte: 'cron_basic_sync',
            importado_em: new Date().toISOString()
          })
        }
        // Espera curta para evitar rate limit
        await new Promise(r => setTimeout(r, 500))
      } catch (e) {
        console.error(`Erro no CNPJ ${item.cnpj}:`, e.message)
      }
    }

    // 3. Upsert no Banco
    const { error } = await supabase.from('empresas').upsert(empresas, { onConflict: 'cnpj' })
    if (error) throw error

    // 4. Registro no Monitor
    await supabase.from('activity_logs').insert({
      acao: 'Sincronização Completa (Sócios/Contatos)',
      entidade: 'Edge Function',
      detalhes: { registros: empresas.length, data: dataFmt },
      status: 'success'
    })

    return new Response(JSON.stringify({ success: true, count: empresas.length }), { status: 200 })

  } catch (err) {
    console.error('Erro fatal:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
