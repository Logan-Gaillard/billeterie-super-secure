import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TicketTier } from "@/lib/types";
import { getEventById, getEventTiers } from "@/lib/services/event.service";

export async function EventDetails({ id }: { id: string }) {
  const { event, error: eventError } = await getEventById(id);

  if (eventError || !event) {
    notFound();
  }

  const { tiers, error: tiersError } = await getEventTiers(id);

  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* Left Column: Image & Details */}
      <div className="flex-1 flex flex-col gap-8">
        <div className="aspect-video w-full bg-muted rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                <div className="flex flex-col gap-2">
                    <Badge className="w-fit">{event.open ? "Ouvert" : "Complet"}</Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{event.title}</h1>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <section>
                <h2 className="text-2xl font-bold mb-4">À propos de l'évènement</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Rejoignez-nous pour {event.title}, un évènement exceptionnel organisé par <span className="font-semibold text-foreground">{event.oragnizer}</span>. 
                    Préparez-vous à vivre une expérience inoubliable dans un cadre prestigieux.
                </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-muted/50 border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Date et Heure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold">{new Date(event.start_time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50 border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            Lieu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold">{event.place?.name}</p>
                        <p className="text-sm text-muted-foreground">{event.place?.address}</p>
                    </CardContent>
                </Card>
            </section>
        </div>
      </div>

      {/* Right Column: Tickets */}
      <div className="w-full md:w-96 flex flex-col gap-6">
        <Card className="sticky top-24 border-muted">
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight">Billetterie</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {tiersError || !tiers?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun billet disponible pour le moment.</p>
                ) : (
                    tiers.map((tier: TicketTier) => (
                        <div key={tier.id} className="flex flex-col gap-3 p-4 border rounded-xl hover:border-primary transition-colors bg-muted/20">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="font-bold">{tier.name}</span>
                                    <span className="text-xs text-muted-foreground">{tier.total_inventory} places restantes</span>
                                </div>
                                <span className="text-lg font-black text-primary">{tier.price}€</span>
                            </div>
                            <Button className="w-full font-bold" disabled={!event.open || tier.total_inventory <= 0}>
                                {tier.total_inventory > 0 ? "Réserver" : "Épuisé"}
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>

        <div className="p-4 rounded-xl border border-dashed border-muted-foreground/20 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Information</span>
            <p className="text-xs text-muted-foreground">
                Les billets sont numériques et seront envoyés par email immédiatement après confirmation du paiement.
            </p>
        </div>
      </div>
    </div>
  );
}

export function EventDetailsSkeleton() {
    return (
        <div className="flex flex-col md:flex-row gap-12 animate-pulse">
            <div className="flex-1 flex flex-col gap-8">
                <div className="aspect-video w-full bg-muted rounded-2xl" />
                <div className="space-y-4">
                    <div className="h-8 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                </div>
            </div>
            <div className="w-full md:w-96">
                <div className="h-64 bg-muted rounded-xl" />
            </div>
        </div>
    );
}
