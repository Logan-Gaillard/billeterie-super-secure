"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertEventAction } from "@/lib/actions/organization.actions";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Type, 
  AlignLeft, 
  Image as ImageIcon, 
  Ticket,
  X,
  Pencil
} from "lucide-react";

export function EventFormModal({ places, event }: { places: any[], event?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const res = await upsertEventAction(formData);
    setIsLoading(false);
    if (res.success) {
      setIsOpen(false);
    } else if (res.error) {
      alert(res.error);
    }
  };

  const isEditing = !!event;
  const mainTier = event?.ticket_tiers?.[0];

  return (
    <>
      {isEditing ? (
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-8 gap-1" 
          onClick={() => setIsOpen(true)}
        >
          <Pencil size={14} />
          Modifier
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} className="font-bold gap-2">
          <Plus size={18} />
          Créer un évènement
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border p-0 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-muted/20">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {isEditing ? "Modifier l'évènement" : "Nouvel Évènement"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? "Mettez à jour les informations de votre évènement." : "Remplissez les informations pour publier votre évènement."}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                <X size={20} />
              </Button>
            </div>
            
            <form action={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              {isEditing && <input type="hidden" name="id" value={event.id} />}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                            <Type size={14} className="text-primary" /> Titre
                        </Label>
                        <Input id="title" name="title" required placeholder="Ex: Festival de Jazz" defaultValue={event?.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="short_description" className="flex items-center gap-2">
                            <AlignLeft size={14} className="text-primary" /> Accroche
                        </Label>
                        <Input id="short_description" name="short_description" placeholder="Une phrase courte et percutante" defaultValue={event?.short_description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="start_time" className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary" /> Date
                        </Label>
                        <Input id="start_time" name="start_time" type="date" required defaultValue={event?.start_time ? new Date(event.start_time).toISOString().split('T')[0] : ''} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="place_id" className="flex items-center gap-2">
                            <MapPin size={14} className="text-primary" /> Lieu
                        </Label>
                        <select id="place_id" name="place_id" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" defaultValue={event?.place_id}>
                            <option value="">Sélectionnez un lieu</option>
                            {places?.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Image et Billetterie */}
                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="image_url" className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-primary" /> URL de l'image
                        </Label>
                        <Input id="image_url" name="image_url" placeholder="https://image.com/photo.jpg" defaultValue={event?.image_url} />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-primary/20 flex flex-col gap-4">
                        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Ticket size={14} /> Billetterie Standard
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="tier_price" className="text-xs">Prix (€)</Label>
                                <Input id="tier_price" name="tier_price" type="number" step="0.01" required placeholder="0.00" defaultValue={mainTier?.price} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="tier_capacity" className="text-xs">Places</Label>
                                <Input id="tier_capacity" name="tier_capacity" type="number" required placeholder="100" defaultValue={mainTier?.total_inventory} />
                            </div>
                            <input type="hidden" name="tier_name" value={mainTier?.name || "Billet Standard"} />
                        </div>
                    </div>
                </div>
              </div>

              {/* Description détaillée */}
              <div className="grid gap-2">
                <Label htmlFor="long_description" className="flex items-center gap-2">
                    <AlignLeft size={14} className="text-primary" /> Description détaillée
                </Label>
                <textarea 
                  id="long_description" 
                  name="long_description" 
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Décrivez votre évènement, le programme, les artistes..."
                  defaultValue={event?.long_description}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="px-8 font-bold">
                    {isLoading ? "Enregistrement..." : (isEditing ? "Mettre à jour" : "Publier l'évènement")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
