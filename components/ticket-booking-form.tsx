"use client";

import { useState } from "react";
import { TicketTier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createReservationAction } from "@/lib/actions/booking.actions";
import { useRouter } from "next/navigation";
import { Minus, Plus, Ticket, ShoppingCart, Info } from "lucide-react";

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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    };

    return (
        <div className="flex flex-col gap-8">
            {error && (
                <div className="flex items-center gap-3 text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                    <Info size={18} />
                    {error}
                </div>
            )}
            
            <div className="flex flex-col gap-4">
                {tiers.map((tier) => {
                    const qty = selections[tier.id] || 0;
                    const isSoldOut = tier.total_inventory <= 0;
                    const subtotal = tier.price * qty;

                    return (
                        <div 
                            key={tier.id} 
                            className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                                qty > 0 
                                ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' 
                                : 'border-muted bg-background hover:border-primary/40 hover:bg-muted/30'
                            } ${isSoldOut ? 'opacity-60 grayscale' : ''}`}
                        >
                            <div className="flex flex-col gap-1 mb-4 sm:mb-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-lg tracking-tight">{tier.name}</span>
                                    {isSoldOut && <Badge variant="destructive" className="text-[10px] uppercase">Complet</Badge>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">

                                <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-muted-foreground/10">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 rounded-lg hover:bg-background hover:shadow-sm" 
                                        onClick={() => updateQuantity(tier.id, qty - 1, tier.total_inventory)}
                                        disabled={qty <= 0 || !isOpen || isSoldOut}
                                    >
                                        <Minus size={16} />
                                    </Button>
                                    
                                    <input 
                                        type="number" 
                                        value={qty} 
                                        onChange={(e) => updateQuantity(tier.id, parseInt(e.target.value) || 0, tier.total_inventory)}
                                        className="w-12 text-center bg-transparent font-black text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        disabled={!isOpen || isSoldOut}
                                    />
                                    
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 rounded-lg hover:bg-background hover:shadow-sm" 
                                        onClick={() => updateQuantity(tier.id, qty + 1, tier.total_inventory)}
                                        disabled={qty >= tier.total_inventory || !isOpen || isSoldOut}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 shadow-inner">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Nombre de billets</span>
                        <span className="font-bold">{totalSelected}</span>
                    </div>
                    <div className="h-px bg-primary/10 w-full" />
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">Total à régler</span>
                            <span className="text-3xl font-black text-primary tracking-tighter">{formatPrice(totalPrice)}</span>
                        </div>
                        <ShoppingCart className="text-primary/20 w-12 h-12" />
                    </div>
                </div>

                <Button 
                    className="w-full font-black h-14 text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] rounded-2xl group" 
                    disabled={!isOpen || totalSelected === 0 || loading}
                    onClick={handleBooking}
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Traitement...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Réserver maintenant
                        </div>
                    )}
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
                    Paiement sécurisé par cryptage SSL 256 bits
                </p>
            </div>
        </div>
    );
}
