"use client";

import { useEffect } from "react";

export function EnvCheck() {
  useEffect(() => {
    // Vérification des variables côté client (celles qui commencent par NEXT_PUBLIC)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || url === "your-project-url" || !key || key === "your-publishable-or-anon-key") {
      alert("❌ ERREUR CONFIGURATION : Les variables d'environnement Supabase sont manquantes ou non configurées dans le fichier .env");
    }
  }, []);

  return null;
}
