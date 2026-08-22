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

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
