'use client';

import { useState } from 'react';
import type { MultiFactorResolver } from 'firebase/auth';
import { TotpMultiFactorGenerator } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Loader, AlertTriangle } from 'lucide-react';

type MfaVerificationProps = {
    mfaResolver: MultiFactorResolver;
    onVerificationSuccess: () => void;
    onVerificationFailure: (error: string) => void;
};

export function MfaVerification({ mfaResolver, onVerificationSuccess, onVerificationFailure }: MfaVerificationProps) {
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        if (!verificationCode) {
            setError('Please enter the verification code.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
                mfaResolver.hints[0].uid,
                verificationCode
            );
            await mfaResolver.resolveSignIn(multiFactorAssertion);
            onVerificationSuccess();
        } catch (e: any) {
            console.error(e);
            const friendlyError = e.code === 'auth/invalid-verification-code' 
                ? 'Invalid code. Please try again.' 
                : 'An error occurred during verification.';
            setError(friendlyError);
            onVerificationFailure(friendlyError);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-secondary/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="font-headline">Two-Factor Verification</CardTitle>
                    <CardDescription>
                        Enter the code from your authenticator app to complete sign-in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Verification Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="verificationCode">Verification Code</Label>
                        <Input 
                            id="verificationCode" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter the 6-digit code"
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className='flex flex-col gap-4'>
                    <Button onClick={handleVerify} disabled={isLoading} className='w-full'>
                        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Verify & Sign In
                    </Button>
                     <Button onClick={() => onVerificationFailure('Verification cancelled.')} variant="link" size="sm">
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
