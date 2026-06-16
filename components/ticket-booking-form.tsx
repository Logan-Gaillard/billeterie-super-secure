"use client";

import { useState } from "react";
import { TicketTier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createReservationAction } from "@/lib/actions/booking.actions";
import { useRouter } from "next/navigation";

export function TicketBookingForm({ tiers, eventId, isOpen }: { tiers: TicketTier[], eventId: string, isOpen: boolean }) {
    const [selections, setSelections] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const updateQuantity = (tierId: number, qty: number, max: number) => {
        const newQty = Math.max(0, Math.min(qty, max));
        setSelections(prev => ({ ...prev, [tierId]: newQty }));
    };

    const handleBooking = async () => {
        const payload = Object.entries(selections)
            .map(([tierId, quantity]) => ({ tierId: Number(tierId), quantity }))
            .filter(item => item.quantity > 0);

        if (payload.length === 0) {
            setError("Veuillez sélectionner au moins un billet.");
            return;
        }

        setLoading(true);
        setError(null);

        const res = await createReservationAction(eventId, payload);

        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            router.push("/profile");
            router.refresh();
        }
    };

    const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0);
    const totalPrice = tiers.reduce((total, tier) => total + (tier.price * (selections[tier.id] || 0)), 0);

    return (
        <div className="flex flex-col gap-6">
            {error && <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
            
            <div className="overflow-hidden border rounded-xl bg-background">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
                        <tr>
                            <th className="px-4 py-3 font-bold">Catégorie</th>
                            <th className="px-4 py-3 font-bold text-center">Prix</th>
                            <th className="px-4 py-3 font-bold text-center">Quantité</th>
                            <th className="px-4 py-3 font-bold text-right">Sous-total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tiers.map((tier) => {
                            const qty = selections[tier.id] || 0;
                            const isSoldOut = tier.total_inventory <= 0;
                            const subtotal = tier.price * qty;

                            return (
                                <tr key={tier.id} className={`transition-colors ${qty > 0 ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{tier.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{tier.total_inventory} restants</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-medium">
                                        {tier.price}€
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-7 w-7 rounded-md" 
                                                onClick={() => updateQuantity(tier.id, qty - 1, tier.total_inventory)}
                                                disabled={qty <= 0 || !isOpen || isSoldOut}
                                            >
                                                -
                                            </Button>
                                            <input 
                                                type="number" 
                                                value={qty} 
                                                onChange={(e) => updateQuantity(tier.id, parseInt(e.target.value) || 0, tier.total_inventory)}
                                                className="w-10 text-center bg-transparent font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                disabled={!isOpen || isSoldOut}
                                            />
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-7 w-7 rounded-md" 
                                                onClick={() => updateQuantity(tier.id, qty + 1, tier.total_inventory)}
                                                disabled={qty >= tier.total_inventory || !isOpen || isSoldOut}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-primary">
                                        {subtotal > 0 ? `${subtotal}€` : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end p-4 bg-muted/50 rounded-xl border border-dashed border-primary/20">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total à payer</span>
                        <span className="text-sm font-medium">{totalSelected} billet{totalSelected > 1 ? 's' : ''} sélectionné{totalSelected > 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-3xl font-black text-primary">{totalPrice}€</span>
                </div>

                <Button 
                    className="w-full font-bold h-12 text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                    disabled={!isOpen || totalSelected === 0 || loading}
                    onClick={handleBooking}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Réservation...
                        </div>
                    ) : (
                        "Confirmer ma commande"
                    )}
                </Button>
            </div>
        </div>
    );
}
