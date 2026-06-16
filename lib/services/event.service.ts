import { createClient } from "@/lib/supabase/server";
import { Event, TicketTier } from "@/lib/types";

export async function getAllEvents(): Promise<{ events: Event[] | null; error: any }> {
  try {
    const supabase = await createClient();
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        *,
        place:place_id (*),
        ticket_tiers (*)
      `)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[EventService] Error fetching events:", error.message);
      return { events: null, error };
    }

    return { events, error: null };
  } catch (err) {
    console.error("[EventService] Unexpected error:", err);
    return { events: null, error: err };
  }
}

export async function getEventById(id: string): Promise<{ event: Event | null; error: any }> {
  try {
    const supabase = await createClient();
    const { data: event, error } = await supabase
      .from("events")
      .select(`
        *,
        place:place_id (*),
        ticket_tiers (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[EventService] Error fetching event ${id}:`, error.message);
      return { event: null, error };
    }

    return { event, error: null };
  } catch (err) {
    console.error(`[EventService] Unexpected error for event ${id}:`, err);
    return { event: null, error: err };
  }
}

export async function getEventTiers(eventId: string): Promise<{ tiers: TicketTier[] | null; error: any }> {
  try {
    const supabase = await createClient();
    const { data: tiers, error } = await supabase
      .from("ticket_tiers")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error(`[EventService] Error fetching tiers for event ${eventId}:`, error.message);
      return { tiers: null, error };
    }

    return { tiers, error: null };
  } catch (err) {
    console.error(`[EventService] Unexpected error for tiers ${eventId}:`, err);
    return { tiers: null, error: err };
  }
}
