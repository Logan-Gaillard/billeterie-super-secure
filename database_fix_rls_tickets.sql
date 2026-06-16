-- SCRIPT DE FIX RLS : BILLETS ET TIERS
-- À exécuter dans le SQL Editor de Supabase

-- 1. RLS pour les tiers de billets (Lecture pour tous)
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tiers visibles par tous" ON public.ticket_tiers;
CREATE POLICY "Tiers visibles par tous" ON public.ticket_tiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des tiers par l'organisateur" ON public.ticket_tiers;
CREATE POLICY "Gestion des tiers par l'organisateur" ON public.ticket_tiers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = ticket_tiers.event_id 
    AND (events.owner_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  )
);

-- 2. RLS pour les tickets (Lecture pour le propriétaire et l'organisateur)
ALTER TABLE public.ticket ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tickets visibles par l'acheteur" ON public.ticket;
CREATE POLICY "Tickets visibles par l'acheteur" ON public.ticket
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.commands 
    WHERE commands.id = ticket.order_id AND commands.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tickets visibles par l'organisateur" ON public.ticket;
CREATE POLICY "Tickets visibles par l'organisateur" ON public.ticket
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ticket_tiers
    JOIN public.events ON events.id = ticket_tiers.event_id
    WHERE ticket_tiers.id = ticket.tier_id 
    AND (events.owner_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  )
);
