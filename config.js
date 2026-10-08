// ============================================
// YURI PERSONAL - Config Supabase (com fallback mock)
// 1. Crie projeto em https://supabase.com > Settings > API
// 2. Cole URL + anon key aqui
// 3. Rode supabase-setup.sql no SQL Editor
// Enquanto não configurar, o site roda em MODO DEMO (mock).
// ============================================
const SUPABASE_URL = "https://qxipwnyxwrwfvspbjtpx.supabase.co"; // ex: "https://xyz.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aXB3bnl4d3J3ZnZzcGJqdHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzcyOTksImV4cCI6MjEwNzA1MzI5OX0.mwtttWYmGcqgL2R6Ks8ebphk3ooARNo87DBJAcioz30"; // ex: "eyJ..."

let supa = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("[yuri] Supabase conectado");
} else {
  console.log("[yuri] MODO DEMO (sem Supabase configurado)");
}

const DEMO_MODE = !supa;

// Converte qualquer link YT em embed + mantém link original
function ytEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
function isDirectVideo(url) {
  return /\.mp4(\?|$)/i.test(url || "");
}
