import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase: SupabaseClient = url && key
  ? createClient(url, key)
  : new Proxy({} as SupabaseClient, {
      get() {
        return () => ({
          data: null,
          error: { message: "Supabase not configured" },
          count: 0,
          select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }),
          single: () => ({ data: null, error: { message: "Supabase not configured" } }),
          eq: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }),
          gt: () => ({ data: null, count: 0 }),
          order: () => ({ limit: () => ({ data: [], error: null }) }),
        });
      },
    });
