import fetch from 'node-fetch';

async function run() {
  const url = 'https://minhareceita.org/search?uf=RS&municipio=MARAU';
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log("Results count:", data.length);
      if (data.length > 0) console.log("Sample:", data[0]);
    }
  } catch (e) { console.log(e); }
}

run();
