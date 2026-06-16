import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionDetails } from "@/lib/services/auth.service";
import { getUserCommands } from "@/lib/services/booking.service";
import { MfaSettings } from "@/components/mfa-settings";
import { ReservationList } from "@/components/reservation-list";
import { EditAccountButton } from "@/app/profile/edit-account-button";
import { User, Mail, ShieldCheck } from "lucide-react";

export async function ProfileContent() {
  const { user, profile } = await getSessionDetails();

  if (!user) {
    return redirect("/auth/login");
  }

  const { commands } = await getUserCommands(user.id);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">Mon Espace Personnel</h1>
        <p className="text-muted-foreground text-lg">Retrouvez vos réservations et gérez votre compte.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Colonne Gauche: Sécurité & Réservations */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-primary" size={24} />
              <h2 className="text-2xl font-bold tracking-tight">Sécurité du compte</h2>
            </div>
            <MfaSettings />
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight">Mes Réservations</h2>
            <ReservationList commands={commands || []} />
          </section>
        </div>

        {/* Colonne Droite: Profil */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-primary" size={24} />
              <h2 className="text-2xl font-bold tracking-tight">Mon Profil</h2>
            </div>
            
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Informations</CardTitle>
                        <EditAccountButton user={user} profile={profile} variant="icon" />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 pt-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <User size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Identité</span>
                            <span className="font-bold text-base">{profile?.first_name} {profile?.name}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Mail size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Email</span>
                            <span className="font-medium text-sm break-all">{user.email}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-3">
                         <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Rôle plateforme</span>
                         <Badge className="w-fit font-bold" variant="secondary">
                            {profile?.role === 'admin' ? '🛡️ Administrateur' : profile?.role === 'organisation' ? '🏢 Organisateur' : '👤 Utilisateur'}
                         </Badge>
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
