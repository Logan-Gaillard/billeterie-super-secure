"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailOtpAction, resendEmailOtpAction } from "@/lib/actions/auth.actions";

export function MfaVerification() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "totp"; // 'totp' ou 'email'
  const altType = searchParams.get("altType");

  const [type, setType] = useState<"totp" | "email">(initialType as "totp" | "email");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [factorId, setFactorId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (type === "totp") {
      fetchTotpFactor();
    }
  }, [type]);

  const fetchTotpFactor = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
        setError(error.message);
        return;
    }
    if (data.totp && data.totp.length > 0) {
        setFactorId(data.totp[0].id);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === "totp") {
          if (!factorId) throw new Error("Facteur TOTP introuvable.");
          
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
          if (challengeError) throw challengeError;

          const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeData.id,
            code: code
          });
          if (verifyError) throw verifyError;

      } else {
          // Verification Email Custom via Server Action
          const res = await verifyEmailOtpAction(code);
          if (res.error) throw new Error(res.error);
      }

      // Succès commun
      router.push("/profile");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      try {
          const res = await resendEmailOtpAction();
          if (res.error) throw new Error(res.error);
          setSuccessMsg("Un nouveau code a été envoyé !");
      } catch(err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Vérification de sécurité</CardTitle>
        <CardDescription>
            {type === "totp" 
                ? "Entrez le code généré par votre application d'authentification."
                : "Entrez le code à 6 chiffres reçu par email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Code de sécurité</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-2xl tracking-[10px] h-14 font-mono"
              maxLength={6}
            />
          </div>
          
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          {successMsg && <p className="text-sm text-green-600 font-medium">{successMsg}</p>}

          <Button type="submit" className="w-full font-bold h-12" disabled={loading || (type === 'totp' && !factorId)}>
            {loading ? "Vérification..." : "Valider et se connecter"}
          </Button>

          <div className="flex flex-col gap-2 mt-4 text-center">
              {type === "email" && (
                  <Button variant="outline" size="sm" type="button" onClick={handleResendEmail} disabled={loading}>
                      Renvoyer le code par email
                  </Button>
              )}

              {altType === 'email' && type === 'totp' && (
                  <Button variant="link" size="sm" type="button" onClick={() => setType('email')} className="text-muted-foreground">
                      Utiliser le code par email à la place
                  </Button>
              )}
              
              {altType === 'totp' && type === 'email' && (
                  <Button variant="link" size="sm" type="button" onClick={() => setType('totp')} className="text-muted-foreground">
                      Utiliser mon application d'authentification
                  </Button>
              )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
