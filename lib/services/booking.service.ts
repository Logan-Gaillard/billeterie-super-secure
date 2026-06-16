import { createClient } from "@/lib/supabase/server";

export async function getUserCommands(userId: string) {
  try {
    const supabase = await createClient();
    const { data: commands, error } = await supabase
      .from("commands")
      .select(`
        *,
        tickets:ticket (
          *,
          tier:tier_id (
            *,
            event:event_id (*)
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[BookingService] Error fetching commands for user ${userId}:`, error.message);
      return { commands: null, error };
    }

    return { commands, error: null };
  } catch (err) {
    console.error(`[BookingService] Unexpected error:`, err);
    return { commands: null, error: err };
  }
}
