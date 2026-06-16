import Link from "next/link";
import { Button } from "./ui/button";
import { getSessionDetails } from "@/lib/services/auth.service";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { LogoutButton } from "./logout-button";
import { User } from "lucide-react";

export async function AuthButton() {
  const { user, profile } = await getSessionDetails();

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"ghost"} className="font-semibold">
          <Link href="/auth/login">Connexion</Link>
        </Button>
        <Button asChild size="sm" className="font-semibold">
          <Link href="/auth/sign-up">S'inscrire</Link>
        </Button>
      </div>
    );
  }

  const displayName = profile?.first_name && profile?.name 
    ? `${profile.first_name} ${profile.name}` 
    : user.email; // Fallback sur l'email uniquement si le profil n'existe pas encore

  const role = profile?.role || 'user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 font-semibold hover:bg-muted transition-colors px-4">
          <div className="bg-primary/10 p-1.5 rounded-full text-primary">
            <User size={18} />
          </div>
          <span className="max-w-[150px] truncate">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground italic truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer w-full">Mon profil</Link>
        </DropdownMenuItem>
        
        {role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer w-full text-primary">Espace administrateur</Link>
          </DropdownMenuItem>
        )}

        {(role === 'admin' || role === 'organisation') && (
           <DropdownMenuItem asChild>
            <Link href="/organiser" className="cursor-pointer w-full">Espace organisateur</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <div className="p-1 w-full">
            <LogoutButton variant="ghost" className="w-full justify-start text-sm h-8 px-2 font-normal" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
