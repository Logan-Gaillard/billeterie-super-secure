-- SCRIPT SQL DÉFINITIF POUR LA BILLETERIE (AUTH, PROFILES, MFA)
-- À COPIER ET COLLER INTÉGRALEMENT DANS LE SQL EDITOR DE SUPABASE

-- 1. SECURITÉ DE BASE DE LA TABLE PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- 2. RECRÉATION DU TRIGGER D'INSCRIPTION (Très important pour que l'enregistrement marche)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles from auth.users metadata
  INSERT INTO public.profiles (id, email, name, first_name, role, verified)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'first_name',
    'user',
    false -- Par défaut non vérifié
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- On recrée le trigger pour s'assurer qu'il écoute bien les nouvelles inscriptions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. TABLES POUR LE 2FA ET LA VÉRIFICATION EMAIL
CREATE TABLE IF NOT EXISTS public.email_otps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps (expires_at);

CREATE TABLE IF NOT EXISTS public.mfa_settings (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    prefer_totp boolean DEFAULT true,
    email_mfa_enabled boolean DEFAULT false,
    totp_mfa_enabled boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. GESTION DES RLS (Row Level Security) SANS BOUCLE INFINIE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Fonction super admin (Bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Règles pour Profiles
DROP POLICY IF EXISTS "profiles_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
CREATE POLICY "profiles_owner" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON public.profiles FOR ALL USING (public.is_admin());

-- Règles pour MFA Settings
DROP POLICY IF EXISTS "mfa_settings_owner" ON public.mfa_settings;
CREATE POLICY "mfa_settings_owner" ON public.mfa_settings FOR ALL USING (auth.uid() = user_id);
