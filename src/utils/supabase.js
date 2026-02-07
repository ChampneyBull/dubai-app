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
    // Create a robust dummy object to prevent app-wide crashes
    const dummyResponse = { data: [], error: null, count: 0 };
    const dummyChain = {
        select: () => dummyChain,
        eq: () => dummyChain,
        order: () => dummyChain,
        single: () => dummyChain,
        maybeSingle: () => dummyChain,
        limit: () => dummyChain,
        insert: () => dummyChain,
        update: () => dummyChain,
        on: () => dummyChain,
        subscribe: () => dummyChain,
        channel: () => dummyChain,
        then: (fn) => Promise.resolve(fn(dummyResponse))
    };
    supabase = { from: () => dummyChain, channel: () => dummyChain, removeChannel: () => { } };
}

export { supabase };
