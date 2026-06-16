import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionDetails } from "@/lib/services/auth.service";
import Link from "next/link";
import { EditUserButton } from "../edit-user-button";
import { DeleteUserButton } from "./delete-user-button";
import { banUserAction, unbanUserAction } from "../actions";

export default async function AdminUsersPage() {
  const { user, profile } = await getSessionDetails();

  if (!user || profile?.role !== 'admin') {
    return redirect("/");
  }

  const supabase = await createClient();
  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">← Retour au dashboard</Link>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Administration</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground text-lg">Liste complète des membres inscrits sur la plateforme.</p>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Liste des membres ({users?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-3">Utilisateur</th>
                                <th className="px-6 py-3">Rôle</th>
                                <th className="px-6 py-3">Statut</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((u) => (
                                <tr key={u.id} className="bg-background border-b hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{u.first_name} {u.name}</span>
                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                            {u.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_banned ? (
                                            <Badge variant="destructive">Banni</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Actif</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <EditUserButton user={u} />
                                        
                                        {u.is_banned ? (
                                            <form action={async () => { "use server"; await unbanUserAction(u.id); }}>
                                                <Button type="submit" size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                                    Débannir
                                                </Button>
                                            </form>
                                        ) : (
                                            <form action={banUserAction.bind(null, u.id)}>
                                                <input type="hidden" name="duration" value="24" />
                                                <Button type="submit" size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                                                    Bannir (24h)
                                                </Button>
                                            </form>
                                        )}

                                        <DeleteUserButton userId={u.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
