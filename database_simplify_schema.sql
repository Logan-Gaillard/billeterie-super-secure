-- SCRIPT DE SIMPLIFICATION : SUPPRESSION DES ORGANISATIONS (CORRIGÉ)
-- À exécuter dans le SQL Editor de Supabase

-- 1. Mise à jour de la table events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Optionnel : Migration des données si nécessaire (on lie les events existants à l'owner de leur organisation)
-- Note: Ce bloc est sécurisé si organizations existe encore
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    UPDATE public.events e
    SET owner_id = o.owner_id
    FROM public.organizations o
    WHERE e.organization_id = o.id;
  END IF;
END $$;

-- 2. Suppression de la liaison et de la table organizations
ALTER TABLE public.events DROP COLUMN IF EXISTS organization_id;
DROP TABLE IF EXISTS public.organizations;

-- 3. Mise à jour des RLS pour les évènements
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events visibles par tous" ON public.events;
CREATE POLICY "Events visibles par tous" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Modification par l'organisateur" ON public.events;
CREATE POLICY "Modification par l'organisateur" ON public.events
FOR ALL USING (auth.uid() = owner_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. RLS pour les lieux (Lecture pour tous, Écriture pour admin/organisateur)
ALTER TABLE public.place ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lieux visibles par tous" ON public.place;
CREATE POLICY "Lieux visibles par tous" ON public.place FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des lieux par admin et organisateur" ON public.place;
CREATE POLICY "Gestion des lieux par admin et organisateur" ON public.place
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'organisation'));
