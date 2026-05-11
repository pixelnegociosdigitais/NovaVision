import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const t = process.env.VITE_BRASILIO_TOKEN;
  
  // Try receita-federal/estabelecimentos
  const res = await fetch('https://api.brasil.io/v1/dataset/receita-federal/estabelecimentos/data/?uf=RS&limit=1', {
    headers: { 'Authorization': `Token ${t}` }
  });
  
  console.log("receita-federal/estabelecimentos:", res.status);
  if (res.status === 200) {
      const data = await res.json();
      console.log("Sample:", data.results ? data.results[0] : data);
  }

  // Try socios-brasil/estabelecimentos
  const res2 = await fetch('https://api.brasil.io/v1/dataset/socios-brasil/estabelecimentos/data/?uf=RS&limit=1', {
    headers: { 'Authorization': `Token ${t}` }
  });
  console.log("socios-brasil/estabelecimentos:", res2.status);
}

run();
