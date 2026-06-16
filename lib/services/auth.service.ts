import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import { User } from "@supabase/supabase-js";

/**
 * Récupère l'utilisateur de la session actuelle (Auth technique).
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: any }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) return { user: null, error };
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

/**
 * Récupère le profil utilisateur depuis la table public.profiles.
 * Utilise le client ADMIN pour éviter les erreurs de récursion RLS.
 */
export async function getUserProfile(userId: string): Promise<{ profile: Profile | null; error: any }> {
  try {
    const adminSupabase = await createAdminClient();
    const { data: profile, error } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(`[AuthService] Error fetching profile for user ${userId}:`, error.message);
      return { profile: null, error };
    }

    return { profile, error: null };
  } catch (err) {
    console.error("[AuthService] Unexpected profile error:", err);
    return { profile: null, error: err };
  }
}

/**
 * Combine Auth + Profile pour obtenir une session complète.
 */
export async function getSessionDetails() {
  const { user } = await getCurrentUser();
  if (!user) return { user: null, profile: null };

  const { profile } = await getUserProfile(user.id);
  
  return { user, profile };
}
