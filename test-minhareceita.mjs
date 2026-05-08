import fetch from 'node-fetch';

async function run() {
  const cn = ['12146377000132', '00000000000191']; // Test multiple cnps if search doesn't work.
  // Wait, let's just check if Minha Receita search endpoint exists.
  try {
    const res = await fetch('https://minhareceita.org/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uf: 'RS', municipio: 'MARAU' })
    });
    console.log("Search status:", res.status);
    if(res.status === 200) console.log(await res.json());
  } catch(e) { console.log(e); }
}

run();
