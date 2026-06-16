import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Event } from "@/lib/types";
import { getAllEvents } from "@/lib/services/event.service";

export async function EventList() {
  const { events, error } = await getAllEvents();

  if (error) {
    return <p className="text-destructive">Erreur lors du chargement des évènements.</p>;
  }

  if (!events?.length) {
    return (
      <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
        <p className="text-muted-foreground">Aucun évènement disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: Event) => {
        const minPrice = event.ticket_tiers && event.ticket_tiers.length > 0 
          ? Math.min(...event.ticket_tiers.map(t => t.price)) 
          : 0;
        
        const remainingTickets = event.ticket_tiers?.reduce((acc, curr) => acc + curr.total_inventory, 0) || 0;

        return (
          <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-all border-muted group">
            <div className="aspect-video bg-muted relative overflow-hidden">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <span className="text-4xl">📅</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge className={remainingTickets > 0 ? "bg-green-500 hover:bg-green-600" : "bg-destructive"}>
                  {remainingTickets > 0 ? `${remainingTickets} places` : "Complet"}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest">{event.organizer}</Badge>
                <span className="font-black text-primary">{minPrice > 0 ? `Dès ${minPrice}€` : "Gratuit"}</span>
              </div>
              <CardTitle className="text-xl font-bold line-clamp-1">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {event.short_description || "Aucune description disponible pour cet évènement."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span className="font-medium text-foreground">
                    {new Date(event.start_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="line-clamp-1">{event.place?.name} - {event.place?.address}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/5">
              <Button asChild className="w-full font-bold">
                <Link href={`/events/${event.id}`}>Voir les détails</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-col overflow-hidden border-muted animate-pulse">
          <div className="aspect-video bg-muted" />
          <CardHeader>
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <div className="h-10 w-full bg-muted rounded" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
