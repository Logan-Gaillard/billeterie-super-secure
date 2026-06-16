import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionDetails } from "@/lib/services/auth.service";
import { BackupButton } from "@/components/BackupButton";
import Link from "next/link";

export default async function AdminPage() {
  const { user, profile } = await getSessionDetails();

  if (!user || profile?.role !== 'admin') {
    return redirect("/");
  }

  const supabaseAdmin = await createAdminClient();
  
  // Statistiques
  const { count: usersCount } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true });
  const { count: eventsCount } = await supabaseAdmin.from('events').select('id', { count: 'exact', head: true });
  const { data: commands } = await supabaseAdmin.from('commands').select('total_amount');
  const { count: ticketsCount } = await supabaseAdmin.from('ticket').select('id', { count: 'exact', head: true });
  
  // Derniers utilisateurs inscrits
  const { data: recentUsers } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const totalRevenue = commands?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Administration</Badge>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Vue d'ensemble</h1>
            <p className="text-muted-foreground text-lg">Suivi global de l'activité et maintenance du système.</p>
        </header>

        {/* Statistiques Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { title: "Évènements", value: eventsCount || 0, description: "Total publiés", color: "text-blue-500", icon: "📅" },
                { title: "Membres", value: usersCount || 0, description: "Utilisateurs actifs", color: "text-purple-500", icon: "👤" },
                { title: "Revenus", value: `${totalRevenue.toLocaleString()}€`, description: "Chiffre d'affaires", color: "text-green-500", icon: "💰" },
                { title: "Ventes", value: ticketsCount || 0, description: "Tickets vendus", color: "text-orange-500", icon: "🎟️" },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm overflow-hidden relative">
                    <div className={`absolute top-0 left-0 w-1 h-full bg-current ${stat.color}`} />
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardDescription className="font-bold uppercase text-[10px] tracking-widest">{stat.title}</CardDescription>
                            <span className="text-xl">{stat.icon}</span>
                        </div>
                        <CardTitle className={`text-3xl font-black ${stat.color}`}>{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Derniers Inscrits */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl">Derniers Utilisateurs</CardTitle>
                                <CardDescription>Les 5 nouveaux membres de la plateforme</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/users">Voir tout →</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase text-muted-foreground border-b bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-3">Utilisateur</th>
                                        <th className="px-4 py-3">Rôle</th>
                                        <th className="px-4 py-3 text-right">Inscription</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentUsers?.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{u.first_name} {u.name}</span>
                                                    <span className="text-xs text-muted-foreground">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right text-muted-foreground">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Système & État */}
            <div className="flex flex-col gap-6">
                <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-lg">Actions Rapides</CardTitle>
                        <CardDescription className="text-primary-foreground/70 text-xs">Outils d'administration prioritaires</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button asChild variant="secondary" className="w-full justify-start font-bold">
                            <Link href="/admin/users">👥 Gestion Utilisateurs</Link>
                        </Button>
                        <BackupButton />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">État du Système</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Base de données</span>
                            <Badge className="bg-green-500">Opérationnel</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Service d'Authentification</span>
                            <Badge className="bg-green-500">Opérationnel</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Passerelle de Paiement</span>
                            <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">Sandbox</Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                             <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Version</span>
                             <span className="text-xs font-mono">v1.4.2-stable</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
