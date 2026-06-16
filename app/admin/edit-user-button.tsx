"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateUserDetailsAction } from "./actions";

export function EditUserButton({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => setIsOpen(true)}
      >
        ✏️ Modifier
      </Button>

      {/* La fenêtre Modale */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>
            
            <form 
              action={async (formData) => {
                setIsLoading(true);
                await updateUserDetailsAction(user.id, formData);
                setIsLoading(false);
                setIsOpen(false); // Ferme la fenêtre quand c'est fini
              }} 
              className="flex flex-col gap-4"
            >
              <div className="grid gap-1">
                <label className="text-sm font-medium">Prénom</label>
                <input 
                  type="text" 
                  name="first_name" 
                  defaultValue={user.first_name || ""} 
                  className="h-9 border rounded-md px-3 bg-transparent"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Nom</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={user.name || ""} 
                  className="h-9 border rounded-md px-3 bg-transparent"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={user.email} 
                  required
                  className="h-9 border rounded-md px-3 bg-transparent"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Nouveau mot de passe (optionnel)</label>
                <input 
                  type="text" 
                  name="password" 
                  placeholder="Laissez vide pour ne pas changer"
                  minLength={6}
                  className="h-9 border rounded-md px-3 bg-transparent"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
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