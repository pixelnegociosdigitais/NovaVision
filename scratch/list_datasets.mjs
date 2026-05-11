import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const t = process.env.VITE_BRASILIO_TOKEN;
  
  // Try to find the root of datasets
  const res = await fetch('https://api.brasil.io/v1/dataset/', {
    headers: { 'Authorization': `Token ${t}` }
  });
  
  const data = await res.json();
  console.log("Full response from /dataset/:", data);
}

run();
