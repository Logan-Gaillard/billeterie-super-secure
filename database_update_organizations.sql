-- SCRIPT SQL: Ajout des organisations et mise à jour des évènements
-- À exécuter dans le SQL Editor de Supabase

-- 0. S'assurer que la fonction is_admin existe pour les RLS
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

-- 1. Création de la table des organisations
CREATE TABLE IF NOT EXISTS public.organizations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name character varying NOT NULL,
    description text,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Liaison des évènements aux organisations
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization_id bigint REFERENCES public.organizations(id);

-- 3. Sécurité (RLS) pour les organisations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir toutes les organisations
DROP POLICY IF EXISTS "Organisations visibles par tous" ON public.organizations;
CREATE POLICY "Organisations visibles par tous" ON public.organizations FOR SELECT USING (true);

-- Seul le propriétaire (ou admin) peut modifier son organisation
DROP POLICY IF EXISTS "Modification par le propriétaire" ON public.organizations;
CREATE POLICY "Modification par le propriétaire" ON public.organizations 
FOR ALL USING (auth.uid() = owner_id OR public.is_admin());

-- 4. Génération aléatoire avancée (utile pour les QR codes)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
