import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("Supabase URL present:", !!supabaseUrl);

let supabase;

try {
    supabase = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder'
    );
} catch (e) {
    console.error("Supabase Initialization Error:", e);
    // Create a dummy object to prevent crashes on method calls
    supabase = { from: () => ({ select: () => ({ order: () => ({}) }) }) };
}

export { supabase };
