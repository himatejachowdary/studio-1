'use client';

import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Loader, AlertTriangle, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import Image from 'next/image';
import {
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
  verifyTotpEnrollment
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

type MfaEnrollmentProps = {
  user: User;
};

export function MfaEnrollment({ user }: MfaEnrollmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();

  const isEnrolled = user.multiFactor?.enrolledFactors.length > 0;

  const handleStartEnrollment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await multiFactor(user).getSession();
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(session);
      setSecret(totpSecret);
      const uri = totpSecret.toUri();
      const qrCode = await QRCode.toDataURL(uri);
      setQrCodeDataUrl(qrCode);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to start MFA enrollment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (!verificationCode || !secret) {
        setError('Please enter the verification code.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, verificationCode);
        await multiFactor(user).enroll(multiFactorAssertion, 'My Authenticator App');
        toast({ title: "Success!", description: "Two-factor authentication has been enabled." });
        setSecret(null);
        setQrCodeDataUrl(null);
    } catch (e: any) {
        console.error(e);
        setError(e.message || 'Verification failed. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDisenroll = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const mfa = multiFactor(user);
        // Assuming the first enrolled factor is the one to be removed.
        // In a real app, you might want to let the user choose.
        if (mfa.enrolledFactors.length > 0) {
            await mfa.unenroll(mfa.enrolledFactors[0]);
            toast({ title: "Success!", description: "Two-factor authentication has been disabled." });
        }
    } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to disable MFA.');
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!user.emailVerified) {
    return (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Email Verification Required</AlertTitle>
            <AlertDescription>
                You must verify your email address before you can enable two-factor authentication.
            </AlertDescription>
         </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Two-Factor Authentication (MFA)</CardTitle>
        <CardDescription>
          {isEnrolled
            ? 'You have two-factor authentication enabled.'
            : 'Add an extra layer of security to your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isEnrolled ? (
            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <ShieldCheck className="w-10 h-10 text-green-500" />
                <div>
                    <p className="font-semibold">MFA is active on your account.</p>
                    <p className="text-sm text-muted-foreground">You'll be asked for a code from your authenticator app when you sign in.</p>
                </div>
            </div>
        ) : (
          !secret && (
            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
                <div>
                    <p className="font-semibold">MFA is not active.</p>
                    <p className="text-sm text-muted-foreground">Click the button below to start the enrollment process.</p>
                </div>
            </div>
          )
        )}
        
        {qrCodeDataUrl && secret && (
            <div className='space-y-4 text-center'>
                <p className="text-sm text-muted-foreground">Scan the QR code with your authenticator app (e.g., Google Authenticator).</p>
                <div className='flex justify-center'>
                    <Image src={qrCodeDataUrl} alt="MFA QR Code" width={200} height={200} />
                </div>
                 <div className="space-y-2 text-left">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input 
                        id="verificationCode" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter the 6-digit code"
                        disabled={isLoading}
                    />
                </div>
            </div>
        )}

      </CardContent>
      <CardFooter className='flex gap-2'>
        {isEnrolled ? (
            <Button onClick={handleDisenroll} variant="destructive" disabled={isLoading}>
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Disable MFA
            </Button>
        ) : secret ? (
            <>
                <Button onClick={() => { setSecret(null); setQrCodeDataUrl(null); }} variant="outline">Cancel</Button>
                <Button onClick={handleVerifyEnrollment} disabled={isLoading}>
                    {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Enroll
                </Button>
            </>
        ) : (
            <Button onClick={handleStartEnrollment} disabled={isLoading || !user.emailVerified}>
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Enable MFA
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
