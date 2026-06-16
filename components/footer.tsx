import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer className="w-full flex flex-col items-center justify-center border-t mt-20 bg-muted/30">
      <div className="w-full max-w-7xl py-12 px-5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
            <span className="font-bold text-xl">Billeterie Super Secure</span>
            <p className="text-sm text-muted-foreground max-w-xs">La plateforme de réservation la plus sûre pour vos évènements préférés.</p>
        </div>
        <div className="flex items-center gap-6">
            <ThemeSwitcher />
        </div>
      </div>
      <div className="w-full border-t py-6 text-center text-xs text-muted-foreground">
        <p>Made with ❤️ by Logan Gaillard / Louis Tinka / Alexis Le-Rocheleuil / Mathéo lescouzère</p>
      </div>
    </footer>
  );
}
