const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar Supabase:', error.message);
  }
} else {
  console.warn('⚠️  Supabase não está configurado');
  console.warn('Configure SUPABASE_URL e SUPABASE_ANON_KEY em .env para usar Storage');
}

module.exports = { supabase };
