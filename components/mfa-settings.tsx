"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";
import { disableTotpAction, toggleEmailMfaAction } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";

export function MfaSettings() {
  const [loading, setLoading] = useState(false);
  
  // States pour TOTP
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [totpEnabled, setTotpEnabled] = useState(false);
  
  // State pour Email
  const [emailEnabled, setEmailEnabled] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    // Check TOTP
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors && factors.totp.length > 0) {
      setTotpEnabled(true);
    }

    // Check Email MFA dans la DB
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: mfaSettings } = await supabase.from('mfa_settings').select('email_mfa_enabled').eq('user_id', user.id).single();
        if (mfaSettings?.email_mfa_enabled) {
            setEmailEnabled(true);
        }
    }
  };

  // --- LOGIQUE TOTP ---
  const enrollTotp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Billeterie Super Secure',
        friendlyName: 'Mon Authenticator'
      });
      if (error) throw error;

      setFactorId(data.id);
      if (data.totp.qr_code) setQrCodeUrl(data.totp.qr_code);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyTotp = async () => {
    if (!factorId) return;
    setLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });
      if (verifyError) throw verifyError;

      setTotpEnabled(true);
      setFactorId(null);
      setQrCodeUrl(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disableTotp = async () => {
      setLoading(true);
      const res = await disableTotpAction();
      if (res?.error) alert(res.error);
      else setTotpEnabled(false);
      setLoading(false);
      router.refresh();
  };

  // --- LOGIQUE EMAIL ---
  const toggleEmailMfa = async () => {
      setLoading(true);
      const newValue = !emailEnabled;
      const res = await toggleEmailMfaAction(newValue);
      if (res?.error) alert(res.error);
      else setEmailEnabled(newValue);
      setLoading(false);
      router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité 2FA (Multi-Facteurs)</CardTitle>
        <CardDescription>Protégez votre compte en activant l'une de ces méthodes.</CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-8">
        
        {/* SECTION TOTP */}
        <div className="flex flex-col gap-4 border p-4 rounded-xl">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Application d'authentification</h3>
                    <p className="text-sm text-muted-foreground">Google Authenticator, Authy, etc.</p>
                </div>
                {totpEnabled ? (
                    <Button variant="destructive" size="sm" onClick={disableTotp} disabled={loading}>Désactiver</Button>
                ) : !qrCodeUrl && (
                    <Button variant="outline" size="sm" onClick={enrollTotp} disabled={loading}>Activer</Button>
                )}
            </div>

            {/* Affiche le QR Code si en cours d'activation */}
            {qrCodeUrl && !totpEnabled && (
                <div className="flex flex-col gap-4 items-center mt-4 border-t pt-4">
                    <p className="text-sm text-center">Scannez ce QR Code avec votre application</p>
                    <div className="bg-white p-4 rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code MFA" className="w-48 h-48" />
                    </div>
                    <div className="w-full flex flex-col gap-2 max-w-xs">
                        <Label htmlFor="code">Code de vérification</Label>
                        <Input id="code" placeholder="000000" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
                        <Button onClick={verifyTotp} disabled={loading || verifyCode.length < 6}>Confirmer l'activation</Button>
                        <Button variant="ghost" onClick={() => {setQrCodeUrl(null); setFactorId(null);}}>Annuler</Button>
                    </div>
                </div>
            )}
            
            {totpEnabled && (
                <div className="text-sm font-medium text-green-600 flex items-center gap-2 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 15 11"/></svg>
                    TOTP Activé (Prioritaire)
                </div>
            )}
        </div>

        {/* SECTION EMAIL */}
        <div className="flex flex-col gap-4 border p-4 rounded-xl">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Code par Email</h3>
                    <p className="text-sm text-muted-foreground">Recevez un code temporaire par email à chaque connexion.</p>
                </div>
                <Button 
                    variant={emailEnabled ? "destructive" : "outline"} 
                    size="sm" 
                    onClick={toggleEmailMfa} 
                    disabled={loading}
                >
                    {emailEnabled ? "Désactiver" : "Activer"}
                </Button>
            </div>
            {emailEnabled && (
                <div className="text-sm font-medium text-green-600 flex items-center gap-2 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    Email 2FA Activé
                </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}
