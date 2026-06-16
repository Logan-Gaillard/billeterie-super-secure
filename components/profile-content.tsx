import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionDetails } from "@/lib/services/auth.service";
import { getUserCommands } from "@/lib/services/booking.service";

export async function ProfileContent() {
  const { user, profile } = await getSessionDetails();

  if (!user) {
    return redirect("/auth/login");
  }

  const { commands, error } = await getUserCommands(user.id);

  console.log(`Profiles : ${profile}`);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">Mon Espace Personnel</h1>
        <p className="text-muted-foreground text-lg">Retrouvez vos réservations et gérez votre compte.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Mes Réservations</h2>
          
          {commands && commands.length > 0 ? (
            <div className="flex flex-col gap-4">
              {commands.map((command) => (
                <Card key={command.id} className="overflow-hidden border-muted">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">Commande #{command.id}</CardTitle>
                            <CardDescription>Passée le {new Date(command.created_at).toLocaleDateString('fr-FR')}</CardDescription>
                        </div>
                        <Badge variant={command.status === 'completed' ? 'default' : 'outline'}>
                            {command.status}
                        </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        {command.tickets?.map((ticket: any) => (
                            <div key={ticket.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex flex-col">
                                    <span className="font-bold">{ticket.tier?.event?.title}</span>
                                    <span className="text-sm text-muted-foreground">{ticket.tier?.name} - Rang {ticket.seat_row}, Siège {ticket.seat_number}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold">{ticket.tier?.price}€</span>
                                </div>
                            </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><path d="M2 9h20"/><path d="M2 15h20"/></svg>
                    </div>
                    <p className="text-muted-foreground">Vous n'avez pas encore de réservations.</p>
                </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Mon Profil</h2>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Prénom</span>
                        <span className="font-medium">{profile?.first_name || 'Non renseigné'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Nom</span>
                        <span className="font-medium">{profile?.name || 'Non renseigné'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Email</span>
                        <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Rôle</span>
                        <Badge className="w-fit" variant="secondary">{profile?.role || 'user'}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
    return (
        <div className="flex flex-col gap-12 animate-pulse">
            <div className="h-12 w-1/2 bg-muted rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-muted rounded-xl" />
                <div className="h-64 bg-muted rounded-xl" />
            </div>
        </div>
    );
}
