import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TicketTier } from "@/lib/types";
import { getEventById, getEventTiers } from "@/lib/services/event.service";

import { TicketBookingForm } from "@/components/ticket-booking-form";

export async function EventDetails({ id, user }: { id: string, user: any }) {
  const { event, error: eventError } = await getEventById(id);

  if (eventError || !event) {
    notFound();
  }

  const tiers = event.ticket_tiers || [];
  const minPrice = tiers.length > 0 ? Math.min(...tiers.map(t => t.price)) : 0;
  const remainingTickets = tiers.reduce((acc, curr) => acc + curr.total_inventory, 0);

  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* Left Column: Image & Details */}
      <div className="flex-1 flex flex-col gap-8">
        <div className="aspect-video w-full bg-muted rounded-2xl overflow-hidden relative shadow-2xl">
            {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="object-cover w-full h-full" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <span className="text-8xl">📅</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Badge className="w-fit">{event.open ? "Ouvert" : "Complet"}</Badge>
                        {remainingTickets > 0 && (
                            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                                {remainingTickets} places restantes
                            </Badge>
                        )}
                        <Badge variant="outline" className="bg-primary text-primary-foreground border-none font-bold">
                            {minPrice > 0 ? `${minPrice}€` : "Gratuit"}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{event.title}</h1>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-8">
            {event.short_description && (
                <section>
                    <p className="text-xl font-medium text-primary border-l-4 border-primary pl-4 py-1 italic">
                        "{event.short_description}"
                    </p>
                </section>
            )}

            <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    À propos de l'évènement
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    {event.long_description ? (
                        <p className="whitespace-pre-wrap">{event.long_description}</p>
                    ) : (
                        <p>
                            Rejoignez-nous pour {event.title}, un évènement exceptionnel organisé par <span className="font-semibold text-foreground">{event.organizer}</span>. 
                            Préparez-vous à vivre une expérience inoubliable dans un cadre prestigieux.
                        </p>
                    )}
                </div>
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
      <div className="w-full md:w-[400px] flex flex-col gap-6">
        <Card className="sticky top-24 border-muted shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight">Billetterie</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {!user ? (
                    <div className="flex flex-col gap-4 text-center py-6">
                        <p className="text-sm text-muted-foreground">Vous devez être connecté pour réserver vos places.</p>
                        <div className="flex flex-col gap-2">
                            <Button asChild className="w-full">
                                <Link href="/auth/login">Se connecter</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/sign-up">Créer un compte</Link>
                            </Button>
                        </div>
                    </div>
                ) : !tiers?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun billet disponible pour le moment.</p>
                ) : (
                    <TicketBookingForm tiers={tiers} eventId={id} isOpen={event.open} />
                )}
            </CardContent>
        </Card>

        <div className="p-4 rounded-xl border border-dashed border-muted-foreground/20 flex flex-col gap-2 bg-primary/5">
            <span className="text-xs font-bold uppercase text-primary">Sécurité & Confiance</span>
            <p className="text-xs text-muted-foreground">
                Vos transactions sont protégées. Les billets sont nominatifs et dotés d'un QR code unique.
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
