"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createPlaceAction } from "@/lib/actions/organization.actions";

export function AddPlaceForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const res = await createPlaceAction(formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            // Success - the page will revalidate due to revalidatePath in the action
            const form = document.getElementById("add-place-form") as HTMLFormElement;
            form.reset();
        }
    }

    return (
        <form id="add-place-form" action={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
            <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-xs">Nom du lieu</Label>
                <Input id="name" name="name" placeholder="Ex: Zenith de Paris" className="bg-muted/20 border-none" required />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="address" className="text-xs">Adresse</Label>
                <Input id="address" name="address" placeholder="Rue, Ville" className="bg-muted/20 border-none" required />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="max_capacity" className="text-xs">Capacité max</Label>
                <Input id="max_capacity" name="max_capacity" type="number" placeholder="5000" className="bg-muted/20 border-none" required />
            </div>
            <Button type="submit" variant="secondary" className="w-full font-bold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus size={16} className="mr-2" />}
                Enregistrer le lieu
            </Button>
        </form>
    );
}
