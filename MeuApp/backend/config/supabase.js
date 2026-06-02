const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Variáveis de ambiente do Supabase não configuradas');
  console.warn('Configure SUPABASE_URL e SUPABASE_ANON_KEY em .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
