import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase;

try {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase URL or Key in environment variables.");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    });
} catch (e) {
    console.error("Supabase Initialization Error:", e);
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
    const dummyAuth = {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ error: null })
    };
    supabase = {
        from: () => dummyChain,
        channel: () => dummyChain,
        removeChannel: () => { },
        auth: dummyAuth
    };
}

export { supabase };
