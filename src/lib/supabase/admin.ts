import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const AGENCY_ID = "ag_masar";

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return (
    msg.includes("pgrst205") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache") ||
    msg.includes("does not exist")
  );
}
