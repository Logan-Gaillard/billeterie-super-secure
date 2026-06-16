import { createClient } from "@supabase/supabase-js";
import { getSessionDetails } from "@/lib/services/auth.service";

export async function GET() {
  try {
    const { user, profile } = await getSessionDetails();

    if (!user || profile?.role !== 'admin') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("Backup Supabase started...");

    const tables = [
      "place",
      "events",
      "ticket_tiers",
      "ticket",
      "commands",
      "payments",
      "logs",
      "profiles",
      "email_otps",
      "mfa_settings",
    ];

    const backup: Record<string, any> = {
      date: new Date().toISOString(),
    };

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*");

      if (error) {
        return Response.json(
          {
            error: `Error fetching table: ${table}`,
            details: error,
          },
          { status: 500 }
        );
      }

      backup[table] = data;
    }

    console.log("✅ Backup generated");

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=backup-${
          new Date().toISOString().split("T")[0]
        }.json`,
      },
    });
  } catch (e: any) {
    console.error("❌ Backup error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}