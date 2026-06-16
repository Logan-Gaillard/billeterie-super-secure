-- SCRIPT DE MISE À JOUR : ÉVÈNEMENTS ET ORGANISATIONS
-- À exécuter dans le SQL Editor de Supabase

-- 1. Mise à jour de la table events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS long_description text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;

-- Correction de la faute de frappe si elle existe
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='oragnizer') THEN
    ALTER TABLE public.events RENAME COLUMN oragnizer TO organizer;
  END IF;
END $$;

-- 2. Mise à jour des types de profils (déjà fait via CHECK, mais on s'assure)
-- La table profiles a déjà : role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'organisation'::text]))

-- 3. Ajout de colonnes utiles pour les lieux si manquantes
ALTER TABLE public.place ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.place ADD COLUMN IF NOT EXISTS image_url text;

-- 4. Contrainte d'unicité pour les tiers de billets
ALTER TABLE public.ticket_tiers DROP CONSTRAINT IF EXISTS ticket_tiers_event_id_name_key;
ALTER TABLE public.ticket_tiers ADD CONSTRAINT ticket_tiers_event_id_name_key UNIQUE (event_id, name);
