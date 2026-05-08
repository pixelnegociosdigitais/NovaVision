import fetch from 'node-fetch';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bmxvZ2loa2dxaHZqZ213bG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODIxODgsImV4cCI6MjA5Mzc1ODE4OH0.W3OBtSe-gSIXaYORh5c0iZGMh_HfdCjNaHr4ypMZcUU'; // fake token from earlier or read from env
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const t = process.env.VITE_BRASILIO_TOKEN;
  
  const res = await fetch('https://api.brasil.io/v1/dataset/socios-brasil/estabelecimentos/data/?uf=RS', {
    headers: { 'Authorization': `Token ${t}` }
  });
  
  const data = await res.json();
  console.log("estabelecimentos:", res.status, data.results ? data.results[0] : data);
}

run();
