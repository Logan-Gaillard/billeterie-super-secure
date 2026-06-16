-- SCRIPT DE FIX RLS : COMMANDES ET TICKETS (COMPLÉMENT)
-- À exécuter dans le SQL Editor de Supabase pour sécuriser les tables de commandes et tickets

-- 1. RLS pour les commandes
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres commandes" ON public.commands;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres commandes" ON public.commands
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres commandes" ON public.commands;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres commandes" ON public.commands
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les admins peuvent tout voir sur les commandes" ON public.commands;
CREATE POLICY "Les admins peuvent tout voir sur les commandes" ON public.commands
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- 2. RLS pour les tickets (INSERT)
-- On a déjà SELECT dans database_fix_rls_tickets.sql, on ajoute INSERT
ALTER TABLE public.ticket ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leurs tickets" ON public.ticket;
CREATE POLICY "Les utilisateurs peuvent insérer leurs tickets" ON public.ticket
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.commands 
    WHERE commands.id = order_id AND commands.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Les admins peuvent tout voir sur les tickets" ON public.ticket;
CREATE POLICY "Les admins peuvent tout voir sur les tickets" ON public.ticket
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
