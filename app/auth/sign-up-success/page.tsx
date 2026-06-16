"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";

function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérification de la clé Resend (Côté Client - Uniquement pour alert)
  useEffect(() => {
    // Note: process.env.RESEND_API_KEY n'est pas accessible ici car il n'est pas NEXT_PUBLIC_
    // Mais on peut vérifier indirectement si l'envoi échoue
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
            }
        });

        if (error) {
            // Si Supabase renvoie une erreur SMTP, c'est souvent lié à la config des clés
            alert("❌ ERREUR D'ENVOI : Impossible d'envoyer l'email. Vérifiez la configuration de Resend/SMTP dans Supabase.");
            throw error;
        }
        setResent(true);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </div>
        <CardTitle className="text-2xl font-bold">Vérifiez vos emails</CardTitle>
        <CardDescription>
          Un lien de confirmation a été envoyé à <br />
          <span className="font-bold text-foreground">{email || "votre adresse email"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Cliquez sur le lien dans l'email pour activer votre compte. Si vous ne trouvez pas l'email, vérifiez vos spams.
        </p>
        
        <div className="flex flex-col gap-2">
            {resent ? (
                <p className="text-sm font-medium text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    Email renvoyé avec succès !
                </p>
            ) : (
                <Button 
                    variant="outline" 
                    onClick={handleResend} 
                    disabled={loading || !email}
                    className="w-full"
                >
                    {loading ? "Envoi..." : "Renvoyer l'email de confirmation"}
                </Button>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>

        <Button asChild variant="ghost">
            <Link href="/auth/login">Retour à la connexion</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-muted/30">
      <Suspense fallback={<div>Chargement...</div>}>
        <SignUpSuccessContent />
      </Suspense>
    </div>
  );
}
