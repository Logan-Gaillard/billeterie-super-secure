import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      {events.map((event: Event) => (
        <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-muted">
          <div className="aspect-video bg-muted relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                {event.open ? "Ouvert" : "Complet"}
              </span>
            </div>
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
            </div>
            <CardDescription className="flex flex-col gap-1">
              <span className="flex items-center gap-1 font-semibold text-primary">
                {new Date(event.start_time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span>Organisé par : {event.oragnizer}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{event.place?.name} - {event.place?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Capacité: {event.place?.max_capacity} places</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button asChild className="w-full">
              <Link href={`/events/${event.id}`}>Réserver mes places</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
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
