import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionDetails } from "@/lib/services/auth.service";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPlaceAction } from "@/lib/actions/organization.actions";
import { EventFormModal } from "@/components/event-form-modal";
import { MapPin, Calendar, TrendingUp, Users, Wallet, Plus } from "lucide-react";

export default async function OrganiserPage() {
  const { user, profile } = await getSessionDetails();

  if (!user || (profile?.role !== 'admin' && profile?.role !== 'organisation')) {
    return redirect("/");
  }

  const supabaseAdmin = await createAdminClient();
  
  // Récupération des lieux pour le formulaire
  const { data: places } = await supabaseAdmin.from('place').select('*');

  // Récupération des évènements de l'utilisateur
  const { data: events, error: eventsError } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        place:place_id(*),
        ticket_tiers(*)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

  if (eventsError) {
    console.error("[OrganiserPage] Error fetching events:", eventsError);
  }

  // Calcul des stats globales pour l'organisateur
  const totalEvents = events?.length || 0;
  
  // Pour l'instant on met à 0 car le calcul nécessite une jointure complexe
  const totalTicketsSold = 0; 
  const totalRevenue = 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 py-12 flex flex-col gap-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Espace Organisateur</Badge>
                </div>
                <h1 className="text-4xl font-black tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground text-lg">Gérez vos évènements et suivez vos performances en temps réel.</p>
            </div>
            <EventFormModal places={places || []} />
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-widest">Revenu Total</CardDescription>
                    <Wallet size={16} className="text-green-500" />
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-black">{totalRevenue.toLocaleString()}€</span>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-widest">Tickets Vendus</CardDescription>
                    <Users size={16} className="text-blue-500" />
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-black">{totalTicketsSold}</span>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-widest">Évènements</CardDescription>
                    <Calendar size={16} className="text-purple-500" />
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-black">{totalEvents}</span>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Colonne Gauche: Vos Évènements */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-xl">Vos évènements</CardTitle>
                        <CardDescription>Suivi détaillé de vos publications</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {events && events.length > 0 ? (
                                events.map((event: any) => {
                                    const totalSold = event.ticket?.[0]?.count || 0;
                                    const totalCapacity = event.ticket_tiers?.reduce((acc: number, curr: any) => acc + curr.total_inventory, 0) || 0;
                                    const revenue = totalSold * (event.ticket_tiers?.[0]?.price || 0);
                                    const progress = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

                                    return (
                                        <div key={event.id} className="p-6 border-b last:border-0 flex flex-col md:flex-row justify-between gap-6 hover:bg-muted/10 transition-colors bg-background">
                                            <div className="flex flex-col gap-3 flex-1">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-xl">{event.title}</span>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.start_time).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1"><MapPin size={12} /> {event.place?.name}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-1.5 w-full max-w-xs">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                                                        <span>Remplissage</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary transition-all duration-500" 
                                                            style={{ width: `${progress}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                                <div className="flex flex-col md:items-end">
                                                    <span className="text-sm font-bold text-green-600">+{revenue}€</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase">{totalSold} tickets</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="outline" size="sm" className="h-8">
                                                        <Link href={`/events/${event.id}`}>Voir</Link>
                                                    </Button>
                                                    <EventFormModal places={places || []} event={event} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 flex flex-col items-center gap-4">
                                    <div className="p-4 bg-muted rounded-full">
                                        <Calendar size={32} className="text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-lg">Aucun évènement</p>
                                        <p className="text-sm text-muted-foreground">Commencez par créer votre premier évènement.</p>
                                    </div>
                                    <EventFormModal places={places || []} />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Colonne Droite: Lieux & Info */}
            <div className="flex flex-col gap-6">
                <Card className="border-none shadow-sm bg-background">
                    <CardHeader>
                        <CardTitle className="text-lg">Ajouter un lieu</CardTitle>
                        <CardDescription>Si votre salle n'est pas encore listée</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createPlaceAction} className="flex flex-col gap-4">
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
                            <Button type="submit" variant="secondary" className="w-full font-bold">
                                <Plus size={16} className="mr-2" /> Enregistrer le lieu
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
                    <TrendingUp size={80} className="absolute -bottom-4 -right-4 opacity-10" />
                    <CardHeader>
                        <CardTitle className="text-lg">Conseil</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs leading-relaxed opacity-90">
                            Ajoutez une description détaillée et une image attractive pour augmenter vos chances de vente de 40%.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
