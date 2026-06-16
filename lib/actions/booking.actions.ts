"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createReservationAction(eventId: string, tiersSelections: { tierId: number, quantity: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour réserver." };
  }

  // 1. Calculer le total et vérifier les inventaires
  let totalAmount = 0;
  const ticketsToCreate: any[] = [];

  for (const selection of tiersSelections) {
      if (selection.quantity <= 0) continue;

      const { data: tier, error: tierError } = await supabase
          .from('ticket_tiers')
          .select('*')
          .eq('id', selection.tierId)
          .single();

      if (tierError || !tier) {
          return { error: "Tarif introuvable." };
      }

      if (tier.total_inventory < selection.quantity) {
          return { error: `Pas assez de places disponibles pour le tarif ${tier.name}.` };
      }

      totalAmount += tier.price * selection.quantity;

      // Préparer les tickets
      const rows = ['A', 'B', 'C', 'D', 'E'];
      for (let i = 0; i < selection.quantity; i++) {
          ticketsToCreate.push({
              tier_id: tier.id,
              seat_number: Math.floor(Math.random() * 100) + 1,
              seat_row: rows[Math.floor(Math.random() * rows.length)],
              qr_code: crypto.randomUUID(),
          });
      }
  }

  if (ticketsToCreate.length === 0) {
      return { error: "Veuillez sélectionner au moins une place." };
  }

  // Utilisation du client admin pour bypass les RLS lors de la création technique de la commande et des tickets
  // Sécurisé car on a déjà vérifié l'identité de l'utilisateur au début de l'action
  const supabaseAdmin = await createAdminClient();

  // 2. Créer la commande
  const { data: command, error: commandError } = await supabaseAdmin
      .from('commands')
      .insert({
          user_id: user.id,
          total_amount: Math.round(totalAmount * 100) / 100, // Fix précision flottante
          status: 'completed' // On simule un paiement réussi directement
      })
      .select()
      .single();

  if (commandError || !command) {
      console.error("[BookingAction] Error creating command:", commandError);
      return { error: "Erreur lors de la création de la commande." };
  }

  // 3. Ajouter l'ID de commande aux tickets et les insérer
  const finalTickets = ticketsToCreate.map(t => ({ ...t, order_id: command.id }));
  
  const { error: ticketsError } = await supabaseAdmin
      .from('ticket')
      .insert(finalTickets);

  if (ticketsError) {
      console.error("[BookingAction] Error creating tickets:", ticketsError);
      // En cas d'erreur, idéalement on annule la commande (rollback)
      return { error: "Erreur lors de la génération des tickets." };
  }

  // 4. Mettre à jour l'inventaire
  for (const selection of tiersSelections) {
      if (selection.quantity <= 0) continue;
      
      const { data: tier } = await supabaseAdmin.from('ticket_tiers').select('total_inventory').eq('id', selection.tierId).single();
      if (tier) {
          await supabaseAdmin.from('ticket_tiers').update({
              total_inventory: tier.total_inventory - selection.quantity
          }).eq('id', selection.tierId);
      }
  }

  revalidatePath('/profile');
  revalidatePath(`/events/${eventId}`);

  return { success: true, commandId: command.id };
}
