-- Script SQL corrigé pour la mise en place du 2FA et de la vérification par email
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajout de la colonne 'verified' à la table profiles
-- Utilisation de IF NOT EXISTS pour éviter les erreurs si la colonne est déjà présente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- 2. Table pour stocker les codes OTP par email temporaires
CREATE TABLE IF NOT EXISTS public.email_otps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Index pour accélérer la recherche et le nettoyage
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps (expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otps_user_code ON public.email_otps (user_id, code);

-- 3. Table pour la configuration MFA des utilisateurs
CREATE TABLE IF NOT EXISTS public.mfa_settings (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    prefer_totp boolean DEFAULT true,
    email_mfa_enabled boolean DEFAULT false,
    totp_mfa_enabled boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS pour mfa_settings
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques pour éviter les doublons lors des mises à jour
DROP POLICY IF EXISTS "Users can view their own MFA settings" ON public.mfa_settings;
CREATE POLICY "Users can view their own MFA settings" 
ON public.mfa_settings FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own MFA settings" ON public.mfa_settings;
CREATE POLICY "Users can update their own MFA settings" 
ON public.mfa_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Fonction et Trigger pour nettoyer les anciens codes automatiquement
CREATE OR REPLACE FUNCTION public.delete_expired_otps() 
RETURNS trigger AS $$
BEGIN
    DELETE FROM public.email_otps WHERE expires_at < now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS cleanup_otps_trigger ON public.email_otps;
CREATE TRIGGER cleanup_otps_trigger
    AFTER INSERT ON public.email_otps
    FOR EACH STATEMENT
    EXECUTE PROCEDURE public.delete_expired_otps();
