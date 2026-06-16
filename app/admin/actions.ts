"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialisation du client admin (contourne les règles de sécurité)
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

export async function deleteUserAction(userId: string) {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin"); 
}

// Remplace banUser24hAction par celle-ci
export async function banUserAction(userId: string, formData: FormData) {
  // Récupère la durée (par défaut 24h si rien n'est sélectionné)
  const durationStr = formData.get("duration") as string;
  const hours = durationStr ? parseInt(durationStr) : 24;

  const supabaseAdmin = getAdminClient();
  const bannedUntil = new Date();
  bannedUntil.setHours(bannedUntil.getHours() + hours);

  // Met à jour la table profiles
  await supabaseAdmin.from("profiles").update({ 
    is_banned: true, 
    banned_until: bannedUntil.toISOString() 
  }).eq("id", userId);
  
  // Suspend le compte dans l'authentification Supabase avec la durée exacte
  await supabaseAdmin.auth.admin.updateUserById(userId, { 
    ban_duration: `${hours}h` 
  });
  
  revalidatePath("/admin");
}

export async function unbanUserAction(userId: string) {
  const supabaseAdmin = getAdminClient();
  await supabaseAdmin.from("profiles").update({ is_banned: false, banned_until: null }).eq("id", userId);
  await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  revalidatePath("/admin");
}