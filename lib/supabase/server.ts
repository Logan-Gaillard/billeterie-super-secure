import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client standard qui respecte les RLS et utilise la session de l'utilisateur.
 * Utilisé pour la majorité des opérations liées à l'utilisateur connecté.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Context de Server Component
          }
        },
      },
    },
  );
}

/**
 * Client Admin qui bypass les RLS (Row Level Security). 
 * À utiliser UNIQUEMENT dans les services côté serveur (.service.ts).
 * Utilise la clé secrète SUPABASE_SERVICE_ROLE_KEY.
 */
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() { },
      },
    },
  );
}
