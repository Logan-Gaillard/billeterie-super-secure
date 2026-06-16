import { Resend } from 'resend';

/**
 * Service pour l'envoi d'emails via Resend.
 * Nécessite la variable d'environnement RESEND_API_KEY.
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.MAIL_FROM || 'Billeterie Super Secure <onboarding@resend.dev>';

export async function sendVerificationEmail(email: string, link: string) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY manquante. Email de vérification non envoyé.");
    return { error: "Configuration manquante" };
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Vérifiez votre adresse email - Billeterie Super Secure',
    html: `
      <h1>Bienvenue sur Billeterie Super Secure !</h1>
      <p>Merci de cliquer sur le lien ci-dessous pour vérifier votre adresse email et activer votre compte :</p>
      <a href="${link}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon compte</a>
      <p>Si le bouton ne fonctionne pas, copiez ce lien : ${link}</p>
    `,
  });
}

export async function sendOtpEmail(email: string, code: string) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY manquante. Email OTP non envoyé.");
    return { error: "Configuration manquante" };
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Votre code de sécurité - Billeterie Super Secure',
    html: `
      <h1>Code de sécurité</h1>
      <p>Voici votre code de vérification pour vous connecter :</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background-color: #f4f4f4; text-align: center; border-radius: 10px;">
        ${code}
      </div>
      <p>Ce code expirera dans 10 minutes.</p>
    `,
  });
}
