"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logAction } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await logAction({ action: "LOGOUT", user_id: user.id });
    }
    
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh(); // Force refresh to update server components like AuthButton
  };

  return (
    <Button 
      variant={variant} 
      size="sm" 
      onClick={logout}
      className={cn(className)}
    >
      Déconnexion
    </Button>
  );
}
