import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const t = process.env.VITE_BRASILIO_TOKEN;
  const slugs = ['socios-brasil', 'receita-federal', 'cnpj', 'dados-cnpj', 'empresas-brasil'];
  
  for (const slug of slugs) {
    const res = await fetch(`https://api.brasil.io/v1/dataset/${slug}/`, {
      headers: { 'Authorization': `Token ${t}` }
    });
    console.log(`Slug ${slug}: ${res.status}`);
    if (res.status === 200) {
        const data = await res.json();
        console.log(`Tables in ${slug}:`, data.tables.map(t => t.name));
    }
  }
}

run();
