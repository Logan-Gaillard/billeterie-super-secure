import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import { User } from "@supabase/supabase-js";

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
 * Récupère le profil avec le client Admin pour éviter les erreurs RLS 
 * et les récursions infinies. Sécurisé car exécuté uniquement côté serveur.
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
      console.error(`[AuthService] Error fetching profile:`, error.message);
      return { profile: null, error };
    }

    return { profile, error: null };
  } catch (err) {
    return { profile: null, error: err };
  }
}

export async function getSessionDetails() {
  const { user } = await getCurrentUser();
  if (!user) return { user: null, profile: null };

  const { profile } = await getUserProfile(user.id);
  
  return { user, profile };
}
