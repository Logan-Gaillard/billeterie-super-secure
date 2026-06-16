import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import { User } from "@supabase/supabase-js";

export async function getMfaSettings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mfa_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    return {
      user_id: userId,
      prefer_totp: true,
      email_mfa_enabled: false,
      totp_mfa_enabled: false
    };
  }
  return data;
}

export async function isMfaRequired(userId: string): Promise<boolean> {
  const settings = await getMfaSettings(userId);
  return settings.email_mfa_enabled || settings.totp_mfa_enabled;
}

/**
 * Vérifie si l'utilisateur a passé le MFA lors de cette session.
 * Utilise l'API native de Supabase pour le TOTP.
 */
export async function checkMfaStatus() {
  const supabase = await createClient();
  
  // getAuthenticatorAssuranceLevel renvoie :
  // currentLevel: 'aal1' (passé email/pass) ou 'aal2' (passé MFA)
  // nextLevel: 'aal2' si le MFA est configuré pour l'utilisateur
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  
  if (error) return { aal: 'aal1', next: 'aal1' };
  
  return {
    current: data.currentLevel,
    next: data.nextLevel
  };
}
