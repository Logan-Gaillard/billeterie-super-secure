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

// Action pour modifier l'email d'un utilisateur
export async function updateUserEmailAction(userId: string, formData: FormData) {
  const newEmail = formData.get("newEmail") as string;
  if (!newEmail) return;

  const supabaseAdmin = getAdminClient();
  
  // 1. Modifier l'email dans l'authentification Supabase
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { 
    email: newEmail,
    email_confirm: true // Force la confirmation pour ne pas bloquer l'utilisateur
  });
  if (authError) throw new Error(authError.message);

  // 2. Modifier l'email dans le profil public
  const { error: dbError } = await supabaseAdmin
    .from("profiles")
    .update({ email: newEmail })
    .eq("id", userId);
  if (dbError) throw new Error(dbError.message);

  revalidatePath("/admin");
}

// Action pour forcer un nouveau mot de passe
export async function resetUserPasswordAction(userId: string, formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Le mot de passe doit faire au moins 6 caractères.");
  }

  const supabaseAdmin = getAdminClient();
  
  // Modifie directement le mot de passe sans demander l'ancien
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { 
    password: newPassword 
  });
  
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
// Action pour tout modifier d'un coup depuis la modale
export async function updateUserDetailsAction(userId: string, formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const first_name = formData.get("first_name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const supabaseAdmin = getAdminClient();

  // 1. Mise à jour de l'authentification (email / mdp)
  const authUpdates: any = {};
  if (email) {
    authUpdates.email = email;
    authUpdates.email_confirm = true; // On valide l'email auto
  }
  if (password && password.length >= 6) {
    authUpdates.password = password;
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
    if (authError) throw new Error(authError.message);
  }

  // 2. Mise à jour du profil public (nom, prénom, email, rôle)
  const updateData: any = { email, name, first_name };
  if (role) updateData.role = role;

  const { error: dbError } = await supabaseAdmin
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (dbError) throw new Error(dbError.message);

  revalidatePath("/admin");
}