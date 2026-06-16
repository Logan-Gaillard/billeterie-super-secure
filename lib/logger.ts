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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const headersList = await headers();
  const ip_address = entry.ip_address || headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;

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
    console.error("Failed to insert log entry:", error);
  }
}
