import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
