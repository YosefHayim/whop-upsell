import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set in environment variables");
  }

  if (!supabaseAnonKey && !supabaseServiceKey) {
    throw new Error("Either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY must be set in environment variables");
  }

  // Use service role key for server-side operations (bypasses RLS)
  // Use anon key for client-side operations (respects RLS)
  const key = supabaseServiceKey || supabaseAnonKey;

  if (!key) {
    throw new Error("Supabase API key is required");
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false, // Server-side doesn't need session persistence
    },
  });
}

// Export client getter for server-side use
export function getSupabase() {
  return getSupabaseClient();
}