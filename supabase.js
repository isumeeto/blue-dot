import { createClient } from '@supabase/supabase-js';

// Support both Node.js (process.env) and Vite (import.meta.env) environment variables safely
let supabaseUrl = '';
let supabaseKey = '';

try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
} catch (e) {
    // Ignore error
}

if (!supabaseUrl && typeof process !== 'undefined' && process.env) {
    supabaseUrl = process.env.SUPABASE_URL;
    supabaseKey = process.env.SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Make sure your environment variables are set.');
}

console.log("=== SUPABASE INITIALIZATION ===");
console.log("Checking Environment Variables:");
console.log("URL is", supabaseUrl ? "SET (starts with " + supabaseUrl.substring(0, 15) + ")" : "NOT SET");
console.log("Anon Key is", supabaseKey ? "SET (starts with " + supabaseKey.substring(0, 10) + ")" : "NOT SET");
console.log("IMPORTANT: If deploying to Netlify using Vite, make sure your variables are named VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Variables without the VITE_ prefix will NOT be bundled by Vite!");
console.log("===============================");

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
