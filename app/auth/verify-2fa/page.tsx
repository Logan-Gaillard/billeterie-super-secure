import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MfaVerification } from "@/components/mfa-verification";
import { Suspense } from "react";

export default function Verify2faPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-5 w-full max-w-7xl">
        <Suspense fallback={<div>Chargement sécurisé...</div>}>
            <MfaVerification />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
