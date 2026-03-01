import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Server-side client with service role (bypasses RLS) */
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/** Server-side client with anon key (for auth token validation) */
export function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
