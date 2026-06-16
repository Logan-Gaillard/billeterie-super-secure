"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

export type LogAction = "LOGIN" | "LOGOUT" | "PAY" | string;

export interface LogEntry {
  user_id?: string | null;
  action: LogAction;
  ip_address?: string | null;
  details?: Record<string, unknown> | string | null;
}

export async function logAction(entry: LogEntry) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️ Logging skipped: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing in environment variables.");
    console.info("Action attempted:", entry.action, "User:", entry.user_id);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const headersList = await headers();
  const ip_address = entry.ip_address || headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;

  try {
    const { error } = await supabase
      .from("logs")
      .insert([
        {
          user_id: entry.user_id,
          action: entry.action,
          ip_address: ip_address,
          details: entry.details,
        },
      ]);

    if (error) {
      console.error("❌ Failed to insert log entry into Supabase:", error);
    }
  } catch (err) {
    console.error("❌ Unexpected error during logging:", err);
  }
}
