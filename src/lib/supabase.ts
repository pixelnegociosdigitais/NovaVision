import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Credenciais do Supabase não encontradas! Certifique-se de configurar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.');
}

export const supabase = createClient(
  supabaseUrl || 'https://1xnlogihkgqhvjgmwlnu.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IjF4bmxvZ2loa2dxaHZqZ213bG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODIxODgsImV4cCI6MjA5Mzc1ODE4OH0.W3OBtSe-gSIXaYORh5c0iZGMh_HfdCjNaHr4ypMZcUU'
);
