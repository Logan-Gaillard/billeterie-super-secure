import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionDetails } from "@/lib/services/auth.service";

export default async function AdminPage() {
  const { user, profile } = await getSessionDetails();

  if (!user || profile?.role !== 'admin') {
    return redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Administration</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Tableau de Bord Admin</h1>
            <p className="text-muted-foreground text-lg">Gérez les évènements, les utilisateurs et les réservations de la plateforme.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { title: "Évènements", value: "12", description: "Évènements actifs", color: "text-blue-500" },
                { title: "Utilisateurs", value: "450", description: "Inscrits au total", color: "text-purple-500" },
                { title: "Ventes", value: "2,450€", description: "Chiffre d'affaires", color: "text-green-500" },
                { title: "Tickets", value: "156", description: "Vendus ce mois", color: "text-orange-500" },
            ].map((stat, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <CardDescription>{stat.title}</CardDescription>
                        <CardTitle className={`text-3xl font-black ${stat.color}`}>{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Actions Rapides</CardTitle>
                    <CardDescription>Outils de gestion prioritaires</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button className="justify-start" variant="outline">Créer un nouvel évènement</Button>
                    <Button className="justify-start" variant="outline">Gérer les lieux (Places)</Button>
                    <Button className="justify-start" variant="outline">Consulter les logs système</Button>
                    <Button className="justify-start text-destructive hover:bg-destructive/10" variant="outline">Gérer les bannissements</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dernières Activités</CardTitle>
                    <CardDescription>Flux en temps réel des actions sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {[
                            "Nouvelle réservation pour 'Concert Rock'",
                            "Utilisateur m@ex.com a rejoint la plateforme",
                            "Paiement de 45€ confirmé pour #CMD-892",
                            "L'évènement 'Théâtre' est désormais complet",
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm border-b pb-2 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span>{activity}</span>
                                <span className="ml-auto text-xs text-muted-foreground">Il y a 2m</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
