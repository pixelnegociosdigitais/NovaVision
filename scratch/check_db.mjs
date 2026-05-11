import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { count, error } = await supabase.from('empresas').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error fetching count:', error);
  } else {
    console.log('Total companies in DB:', count);
  }

  const { data: samples, error: err2 } = await supabase.from('empresas').select('*').limit(5);
  if (err2) {
    console.error('Error fetching samples:', err2);
  } else {
    console.log('Samples:', JSON.stringify(samples, null, 2));
  }
}

checkData();
