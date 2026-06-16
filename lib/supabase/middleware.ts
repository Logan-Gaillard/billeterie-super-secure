import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protection MFA (Multi-Factor Authentication)
  if (user && !request.nextUrl.pathname.startsWith('/auth/verify-2fa') && !request.nextUrl.pathname.startsWith('/auth/confirm')) {
    
    // 1. Check TOTP (Natif Supabase)
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
       return NextResponse.redirect(new URL('/auth/verify-2fa?type=totp', request.url));
    }
    
    // 2. Check Email OTP Custom
    // On vérifie si l'utilisateur a activé le MFA par email en lisant mfa_settings
    // Note: Pour optimiser, on pourrait vérifier le cookie "email_mfa_verified" AVANT de requêter la BDD
    const isEmailVerified = request.cookies.get('email_mfa_verified')?.value === 'true';
    
    if (!isEmailVerified && mfaData?.nextLevel !== 'aal2') {
        const { data: mfaSettings } = await supabase.from('mfa_settings').select('email_mfa_enabled').eq('user_id', user.id).single();
        if (mfaSettings?.email_mfa_enabled) {
            return NextResponse.redirect(new URL('/auth/verify-2fa?type=email', request.url));
        }
    }
  }

  return response;
}
