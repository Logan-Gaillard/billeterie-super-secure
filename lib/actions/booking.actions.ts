"use server";

import { createClient } from "@/lib/supabase/server";
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
      for (let i = 0; i < selection.quantity; i++) {
          ticketsToCreate.push({
              tier_id: tier.id,
              seat_number: i + 1, // Logique basique de siège
              seat_row: 'A', // Logique basique de rangée
              qr_code: crypto.randomUUID(), // QR code unique par ticket
          });
      }
  }

  if (ticketsToCreate.length === 0) {
      return { error: "Veuillez sélectionner au moins une place." };
  }

  // Transaction via RPC ou appels successifs (Attention: sans RPC, c'est pas atomique, on simule)
  // 2. Créer la commande
  const { data: command, error: commandError } = await supabase
      .from('commands')
      .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'completed' // On simule un paiement réussi directement
      })
      .select()
      .single();

  if (commandError || !command) {
      return { error: "Erreur lors de la création de la commande." };
  }

  // 3. Ajouter l'ID de commande aux tickets et les insérer
  const finalTickets = ticketsToCreate.map(t => ({ ...t, order_id: command.id }));
  
  const { error: ticketsError } = await supabase
      .from('ticket')
      .insert(finalTickets);

  if (ticketsError) {
      // En cas d'erreur, idéalement on annule la commande (rollback)
      return { error: "Erreur lors de la génération des tickets." };
  }

  // 4. Mettre à jour l'inventaire
  for (const selection of tiersSelections) {
      if (selection.quantity <= 0) continue;
      
      const { data: tier } = await supabase.from('ticket_tiers').select('total_inventory').eq('id', selection.tierId).single();
      if (tier) {
          await supabase.from('ticket_tiers').update({
              total_inventory: tier.total_inventory - selection.quantity
          }).eq('id', selection.tierId);
      }
  }

  revalidatePath('/profile');
  revalidatePath(`/events/${eventId}`);

  return { success: true, commandId: command.id };
}
