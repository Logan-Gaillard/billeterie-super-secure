"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfileAction(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Récupérer l'utilisateur connecté de manière sécurisée
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Non autorisé");

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const first_name = formData.get("first_name") as string;
  const password = formData.get("password") as string;

  // 2. Mise à jour de l'authentification (Email & Mot de passe)
  const authUpdates: any = {};
  if (email && email !== user.email) {
    authUpdates.email = email;
  }
  if (password && password.length >= 6) {
    authUpdates.password = password;
  }

  if (Object.keys(authUpdates).length > 0) {
    // L'utilisateur a le droit natif de modifier ses propres identifiants
    const { error: authError } = await supabase.auth.updateUser(authUpdates);
    if (authError) throw new Error(authError.message);
  }

  // 3. Mise à jour du profil public (Nom & Prénom)
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ name, first_name })
    .eq("id", user.id);

  if (dbError) throw new Error(dbError.message);

  // Rafraîchir la page (Ajuste "/protected" par le nom du dossier de ta page si besoin)
  revalidatePath("/protected"); 
}