"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfileAction } from "./actions"; // Importe l'action qu'on a créée

export function EditAccountButton({ user, profile }: { user: any, profile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        ⚙️ Paramètres du compte
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier mes informations</h2>
            
            <form 
              action={async (formData) => {
                setIsLoading(true);
                await updateUserProfileAction(formData);
                setIsLoading(false);
                setIsOpen(false); // Ferme la fenêtre quand c'est sauvegardé
              }} 
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label className="text-sm">Prénom</Label>
                  <Input type="text" name="first_name" defaultValue={profile?.first_name || ""} />
                </div>
                <div className="grid gap-1">
                  <Label className="text-sm">Nom</Label>
                  <Input type="text" name="name" defaultValue={profile?.name || ""} />
                </div>
              </div>

              <div className="grid gap-1">
                <Label className="text-sm">Email</Label>
                <Input type="email" name="email" defaultValue={user?.email || ""} required />
              </div>

              <div className="grid gap-1 border-t pt-4 mt-2">
                <Label className="text-sm">Nouveau mot de passe</Label>
                <Input type="password" name="password" placeholder="Laisser vide pour ne pas changer" minLength={6} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}