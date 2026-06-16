"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPlaceAction(formData: FormData) {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const max_capacity = parseInt(formData.get("max_capacity") as string, 10);

    if (!name || !address || isNaN(max_capacity)) {
        return { error: "Tous les champs sont requis et valides." };
    }

    const supabase = await createAdminClient();
    const { error } = await supabase.from('place').insert({ name, address, max_capacity });

    if (error) return { error: "Erreur lors de la création du lieu." };

    revalidatePath('/admin');
    return { success: true };
}

export async function createEventAction(formData: FormData) {
    const title = formData.get("title") as string;
    const start_time = formData.get("start_time") as string;
    const place_id = parseInt(formData.get("place_id") as string, 10);
    const organization_id = parseInt(formData.get("organization_id") as string, 10);

    if (!title || !start_time || isNaN(place_id)) {
        return { error: "Champs requis manquants." };
    }

    const supabase = await createAdminClient();
    const { error } = await supabase.from('events').insert({ 
        title, 
        start_time, 
        place_id, 
        organization_id: isNaN(organization_id) ? null : organization_id,
        open: true 
    });

    if (error) return { error: "Erreur lors de la création de l'évènement." };

    revalidatePath('/admin');
    return { success: true };
}
