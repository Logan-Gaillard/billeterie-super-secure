"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrganizationAction(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
        return { error: "Le nom de l'organisation est requis." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Non authentifié." };
    }

    const { error } = await supabase
        .from('organizations')
        .insert({
            name,
            description,
            owner_id: user.id
        });

    if (error) {
        return { error: "Erreur lors de la création de l'organisation." };
    }

    revalidatePath('/organisation');
    return { success: true };
}

export async function upsertEventAction(formData: FormData) {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const short_description = formData.get("short_description") as string;
    const long_description = formData.get("long_description") as string;
    const image_url = formData.get("image_url") as string;
    const start_time = formData.get("start_time") as string;
    const place_id = parseInt(formData.get("place_id") as string, 10);
    
    // Tiers data
    const tier_name = formData.get("tier_name") as string;
    const tier_price = parseFloat(formData.get("tier_price") as string);
    const tier_capacity = parseInt(formData.get("tier_capacity") as string, 10);

    if (!title || !start_time || isNaN(place_id)) {
        return { error: "Champs requis manquants." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié." };

    const supabaseAdmin = await createAdminClient();
    
    const eventData: any = {
        title,
        short_description,
        long_description,
        image_url,
        start_time,
        place_id,
        owner_id: user.id,
        open: true
    };

    let eventId = id ? parseInt(id) : null;

    if (eventId) {
        const { error } = await supabaseAdmin.from('events').update(eventData).eq('id', eventId);
        if (error) return { error: "Erreur lors de la mise à jour." };
    } else {
        const { data, error } = await supabaseAdmin.from('events').insert(eventData).select().single();
        if (error) return { error: "Erreur lors de la création." };
        eventId = data.id;
    }

    if (tier_name && !isNaN(tier_price) && !isNaN(tier_capacity)) {
        await supabaseAdmin.from('ticket_tiers').upsert({
            name: tier_name,
            price: tier_price,
            total_inventory: tier_capacity,
            event_id: eventId
        }, { onConflict: 'event_id, name' });
    }

    revalidatePath('/organiser');
    revalidatePath(`/events/${eventId}`);
    revalidatePath('/');
    
    return { success: true };
}

export async function createPlaceAction(formData: FormData) {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const max_capacity = parseInt(formData.get("max_capacity") as string, 10);

    if (!name || !address || isNaN(max_capacity)) {
        return { error: "Données invalides." };
    }

    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin.from('place').insert({ name, address, max_capacity });

    if (error) return { error: "Erreur lors de la création du lieu." };

    revalidatePath('/organiser');
    return { success: true };
}
