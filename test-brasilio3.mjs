import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const t = process.env.VITE_BRASILIO_TOKEN;
  
  const res = await fetch('https://api.brasil.io/v1/dataset/socios-brasil/empresas/data/?municipio=MARAU', {
    headers: { 'Authorization': `Token ${t}` }
  });
  
  const data = await res.json();
  console.log("empresas by municipio:", res.status, data);
}

run();
