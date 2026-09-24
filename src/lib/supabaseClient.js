import { createClient } from "@supabase/supabase-js";

// These come from Vercel/.env.local — never hardcode real values here.
// REACT_APP_SUPABASE_URL      → Supabase project → Settings → API → Project URL
// REACT_APP_SUPABASE_ANON_KEY → Supabase project → Settings → API → anon/public key
// (The anon key is safe to expose in frontend code — it's designed to be public.
//  Row Level Security on every table is what actually protects the data.
//  Never put the "service_role" key in this file or in REACT_APP_* anything.)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at build/start time instead of silently doing nothing —
  // this is exactly the class of bug that bit the last version of this app.
  throw new Error(
    "Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. " +
    "Add them to .env.local (dev) and Vercel → Settings → Environment Variables (prod), then redeploy."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
