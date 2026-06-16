import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EventDetails, EventDetailsSkeleton } from "@/components/event-details";
import { Suspense } from "react";
import { getSessionDetails } from "@/lib/services/auth.service";

export default async function EventPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const { user } = await getSessionDetails();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-7xl p-5 flex flex-col gap-8 py-12">
        <Suspense fallback={<EventDetailsSkeleton />}>
            <EventDetails id={params.id} user={user} />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
