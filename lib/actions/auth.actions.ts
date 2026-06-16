"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateAndSendEmailOtp, verifyEmailOtp } from "@/lib/services/otp.service";
import { cookies } from "next/headers";

/**
 * Inscription de l'utilisateur.
 */
export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !firstName || !name) {
    return { error: "Tous les champs sont requis." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: true, email, existing: true };
    }
    return { error: error.message };
  }

  return { success: true, email, existing: false };
}

/**
 * Connexion de l'utilisateur.
 */
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email et mot de passe requis." };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
        return { error: "Veuillez vérifier votre adresse email avant de vous connecter." };
    }
    return { error: "Identifiants invalides." };
  }

  if (data.user) {
      const { data: mfaSettings } = await supabase.from('mfa_settings').select('*').eq('user_id', data.user.id).single();
      const { data: mfaStatus } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      const hasTotp = mfaStatus?.nextLevel === 'aal2';
      const hasEmail = mfaSettings?.email_mfa_enabled;

      if (hasTotp) {
          return { success: true, requiresMfa: true, mfaType: 'totp', altType: hasEmail ? 'email' : null };
      }

      if (hasEmail) {
          const res = await generateAndSendEmailOtp(data.user.id, email);
          if (res.error) return { error: res.error };
          return { success: true, requiresMfa: true, mfaType: 'email', altType: null };
      }
  }

  return { success: true, requiresMfa: false };
}

/**
 * Vérification du code OTP reçu par email.
 */
export async function verifyEmailOtpAction(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Utilisateur non connecté" };

  const result = await verifyEmailOtp(user.id, code);
  
  if (!result.valid) return { error: result.error };

  // Validation réussie, on place un cookie sécurisé pour le middleware
  const cookieStore = await cookies();
  cookieStore.set('email_mfa_verified', 'true', { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 // 24h
  });

  return { success: true };
}

/**
 * Renvoyer le code email
 */
export async function resendEmailOtpAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user || !user.email) return { error: "Utilisateur non connecté" };
    
    return await generateAndSendEmailOtp(user.id, user.email);
}

/**
 * Mise à jour des paramètres MFA (Activer/Désactiver Email)
 */
export async function toggleEmailMfaAction(enabled: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    const adminClient = await createAdminClient();
    
    const { error } = await adminClient
        .from('mfa_settings')
        .upsert({ 
            user_id: user.id, 
            email_mfa_enabled: enabled,
            updated_at: new Date().toISOString()
        });

    if (error) return { error: "Erreur lors de la mise à jour." };
    return { success: true };
}

/**
 * Désactiver l'authentification TOTP natif Supabase
 */
export async function disableTotpAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) return { error: factorsError.message };

    const totpFactors = factors.totp;
    if (totpFactors.length === 0) return { success: true };

    for (const factor of totpFactors) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) return { error: "Erreur lors de la désactivation du TOTP" };
    }

    return { success: true };
}
