import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionDetails } from "@/lib/services/auth.service";
import { BackupButton } from "@/components/BackupButton";
import { createClient } from "@/lib/supabase/server";
import { updateUserEmailAction, resetUserPasswordAction } from "./actions"; // Import de l'action pour modifier l'email et réinitialiser le mot de passe
import { EditUserButton } from "./edit-user-button";

// IMPORT CORRIGÉ : On utilise bien banUserAction ici !
import { deleteUserAction, banUserAction, unbanUserAction } from "./actions";

export default async function AdminPage() {
  const { user, profile } = await getSessionDetails();

  if (!user || profile?.role !== 'admin') {
    return redirect("/");
  }

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

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
                { title: "Utilisateurs", value: profiles?.length || "0", description: "Inscrits au total", color: "text-purple-500" },
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
                    <Button className="justify-start" variant="outline">Gérer les utilisateurs</Button>
                    <Button className="justify-start" variant="outline">Consulter les logs système</Button>
                    <Button className="justify-start" variant="outline">Gérer les bannissements</Button>
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

        {/* TABLEAU DES UTILISATEURS CORRIGÉ */}
        <section className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Utilisateurs</CardTitle>
                    <CardDescription>Gérez les accès, rôles et bannissements des membres inscrits.</CardDescription>
                    {error && <p className="text-sm text-destructive mt-2">Erreur : {error.message}</p>}
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Utilisateur</th>
                                    <th className="p-4">Rôle</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {profiles?.map((p) => {
                                    // Logique de vérification de date
                                    const now = new Date();
                                    const isCurrentlyBanned = p.is_banned && p.banned_until && new Date(p.banned_until) > now;

                                    return (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            {/* COLONNE 1 : NOM ET EMAIL RÉINTÉGRÉS */}
                                            <td className="p-4">
                                                <div className="font-semibold text-foreground">
                                                    {p.first_name || p.name ? `${p.first_name} ${p.name}`.trim() : "Non renseigné"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{p.email}</div>
                                            </td>
                                            
                                            {/* COLONNE 2 : ROLE RÉINTÉGRÉ */}
                                            <td className="p-4">
                                                <Badge variant={p.role === 'admin' ? 'default' : p.role === 'organisation' ? 'secondary' : 'outline'}>
                                                    {p.role}
                                                </Badge>
                                            </td>

                                            <td className="p-4">
                                                {isCurrentlyBanned ? (
                                                    <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">
                                                        Bloqué (jusqu'au {new Date(p.banned_until as string).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })})
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none">
                                                        Actif
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="p-4 text-right">
                                                {p.role !== 'admin' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        
                                                        {/* Le bouton Modifier que l'on vient de créer */}
                                                        <EditUserButton user={p} />

                                                        {isCurrentlyBanned ? (
                                                            <form action={unbanUserAction.bind(null, p.id)}>
                                                                <Button type="submit" size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                                                                    Débloquer
                                                                </Button>
                                                            </form>
                                                        ) : (
                                                            <form action={banUserAction.bind(null, p.id)} className="flex items-center gap-2">
                                                                <select name="duration" className="h-8 text-xs border rounded-md px-2 bg-background text-foreground">
                                                                    <option value="2">2H</option>
                                                                    <option value="24">24H</option>
                                                                    <option value="168">7J</option>
                                                                </select>
                                                                <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-none">
                                                                    Bloquer
                                                                </Button>
                                                            </form>
                                                        )}

                                                        <form action={deleteUserAction.bind(null, p.id)}>
                                                            <Button type="submit" size="sm" variant="destructive">
                                                                Supprimer
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {profiles?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </section>

      </main>
      <Footer />
    </div>
  );
}