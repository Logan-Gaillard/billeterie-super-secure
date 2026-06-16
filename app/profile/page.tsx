import { ProfileContent, ProfileSkeleton } from "@/components/profile-content";
import { Suspense } from "react";

export default async function ProfilePage() {
 
  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* NOUVELLE SECTION : Titre et bouton Paramètres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black">Mon Espace</h1>
          <p className="text-muted-foreground">Gérez vos réservations et vos informations personnelles.</p>
        </div>
      </div>

      {/* TON ANCIEN CODE INTACT : Affichage des réservations */}
      <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
      </Suspense>

    </div>
  );
}