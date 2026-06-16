import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

export function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-bold text-xl tracking-tight">
          <Link href={"/"}>Billeterie <span className="text-primary">Super Secure</span></Link>
        </div>
        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="h-8 w-20 animate-pulse bg-muted rounded" />}>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
