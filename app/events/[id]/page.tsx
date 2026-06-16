import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EventDetails, EventDetailsSkeleton } from "@/components/event-details";
import { Suspense } from "react";

export default async function EventPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-7xl p-5 flex flex-col gap-8 py-12">
        <Suspense fallback={<EventDetailsSkeleton />}>
            <EventDetails id={params.id} />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
