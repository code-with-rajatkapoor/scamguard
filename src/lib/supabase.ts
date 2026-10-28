import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

// Provide a no-op fallback if not configured so the UI renders without Supabase.
// The fallback mimics the real Supabase client's chainable API (select/insert/delete)
// and resolves to a result when awaited, so every call site works unchanged.
const noopChain = (result: { data: null; error: null }) => {
  const chain = {
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    then: (resolve: (value: { data: null; error: null }) => void, reject: (reason: unknown) => void) =>
      Promise.resolve(result).then(resolve, reject),
    catch: (fn: (reason: unknown) => void) => Promise.resolve(result).catch(fn),
  };
  return chain;
};

export const supabase = client || {
  from: () => ({
    select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    // delete() must return a chainable object (like select/insert do) so that
    // `delete().eq('id', id)` resolves without throwing on the Promise object.
    delete: () => noopChain({ data: null, error: null }),
  }),
};
