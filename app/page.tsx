import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { EventList, EventListSkeleton } from "@/components/event-list";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Navbar />

        <div className="w-full max-w-7xl p-5 flex flex-col gap-12 py-12">
          {/* Hero Section */}
          <header className="flex flex-col gap-4 text-center items-center">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter">
              Réservez vos <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">évènements</span> préférés
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Découvrez les meilleurs évènements, concerts et spectacles. Une expérience de réservation simple, rapide et ultra-sécurisée.
            </p>
          </header>

          {/* Events Grid */}
          <section className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Prochains Évènements</h2>
                <p className="text-muted-foreground">Ne manquez pas les meilleures opportunités</p>
              </div>
              <Button variant="outline">Voir tout</Button>
            </div>

            <Suspense fallback={<EventListSkeleton />}>
              <EventList />
            </Suspense>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  );
}
