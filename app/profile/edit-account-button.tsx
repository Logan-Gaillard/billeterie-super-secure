"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfileAction } from "./actions"; // Importe l'action qu'on a créée

import { Settings, Loader2 } from "lucide-react";

export function EditAccountButton({ user, profile, variant = "outline" }: { user: any, profile: any, variant?: "outline" | "ghost" | "icon" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <Button onClick={() => setIsOpen(true)} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
          <Settings size={18} className="text-muted-foreground" />
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} variant={variant}>
          <Settings size={16} className="mr-2" /> Paramètres du compte
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background border p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Modifier mon compte</h2>
            
            <form 
              action={async (formData) => {
                setIsLoading(true);
                await updateUserProfileAction(formData);
                setIsLoading(false);
                setIsOpen(false);
              }} 
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prénom</Label>
                  <Input type="text" name="first_name" defaultValue={profile?.first_name || ""} className="bg-muted/30 border-none" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nom</Label>
                  <Input type="text" name="name" defaultValue={profile?.name || ""} className="bg-muted/30 border-none" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input type="email" name="email" defaultValue={user?.email || ""} required className="bg-muted/30 border-none" />
              </div>

              <div className="grid gap-2 border-t pt-5 mt-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nouveau mot de passe</Label>
                <Input type="password" name="password" placeholder="••••••••" minLength={6} className="bg-muted/30 border-none" />
                <p className="text-[10px] text-muted-foreground italic">Laissez vide pour conserver le mot de passe actuel.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading} className="font-bold">
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="font-bold px-8">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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