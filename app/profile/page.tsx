import { ProfileContent, ProfileSkeleton } from "@/components/profile-content";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

// On importe le bouton qu'on vient de créer
import { EditAccountButton } from "./edit-account-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // On récupère l'utilisateur et son profil pour les envoyer au bouton
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* NOUVELLE SECTION : Titre et bouton Paramètres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black">Mon Espace</h1>
          <p className="text-muted-foreground">Gérez vos réservations et vos informations personnelles.</p>
        </div>
        
        {/* Le bouton s'affiche ici si l'utilisateur est bien connecté */}
        {user && profile && <EditAccountButton user={user} profile={profile} />}
      </div>

      {/* TON ANCIEN CODE INTACT : Affichage des réservations */}
      <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
      </Suspense>

    </div>
  );
}