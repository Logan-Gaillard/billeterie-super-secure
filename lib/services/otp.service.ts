import { createAdminClient } from "@/lib/supabase/server";
import { sendOtpEmail } from "./mail.service";

/**
 * Service pour la gestion des codes OTP par email.
 */

export async function generateAndSendEmailOtp(userId: string, email: string) {
  const adminSupabase = await createAdminClient();
  
  // Générer un code à 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Expiration dans 10 minutes
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Sauvegarder en base (Service Role pour bypass RLS)
  const { error: dbError } = await adminSupabase
    .from('email_otps')
    .insert({
      user_id: userId,
      code,
      expires_at: expiresAt.toISOString()
    });

  if (dbError) {
    console.error("[OTP Service] Error saving OTP:", dbError.message);
    return { error: "Erreur lors de la génération du code" };
  }

  // Envoyer par email via Resend
  const { error: mailError } = await sendOtpEmail(email, code);

  if (mailError) {
    console.error("[OTP Service] Error sending mail:", mailError);
    return { error: "Erreur lors de l'envoi de l'email" };
  }

  return { success: true };
}

export async function verifyEmailOtp(userId: string, code: string) {
  const adminSupabase = await createAdminClient();

  const { data, error } = await adminSupabase
    .from('email_otps')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return { valid: false, error: "Code invalide ou expiré" };
  }

  // Supprimer le code après usage
  await adminSupabase.from('email_otps').delete().eq('id', data.id);

  return { valid: true };
}
