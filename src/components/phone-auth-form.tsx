'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { Loader, Smartphone, KeyRound, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number with country code.')
    .regex(/^\+[1-9]\d{1,14}$/, 'Include country code (e.g., +14155552671)'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export function PhoneAuthForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const auth = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaWrapperRef = useRef<HTMLDivElement>(null);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });


  useEffect(() => {
    if (auth && !recaptchaVerifierRef.current && recaptchaWrapperRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaWrapperRef.current, {
            size: 'invisible',
            callback: () => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            },
        });
    }
  }, [auth]);

  const handlePhoneSubmit = async ({ phone }: PhoneFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not initialized. Please refresh the page.');
      }
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setStep('otp');
      toast({ title: 'Verification Code Sent', description: `An OTP has been sent to ${phone}.` });
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      setError(err.message || 'Failed to send verification code. Please try again.');
       // Reset reCAPTCHA on error
       if (typeof window !== 'undefined' && (window as any).grecaptcha && recaptchaVerifierRef.current) {
         (window as any).grecaptcha.reset(recaptchaVerifierRef.current.widgetId);
       }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async ({ otp }: OtpFormValues) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      toast({ title: 'Success!', description: 'You have been logged in.' });
      onAuthSuccess();
    } catch (err: any) {
       setError('The code you entered is incorrect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
       <div ref={recaptchaWrapperRef} id="recaptcha-container"></div>
       {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
      {step === 'phone' ? (
        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1 555-555-5555"
              {...phoneForm.register('phone')}
              disabled={isLoading}
            />
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" /> : <Smartphone />}
            Send Code
          </Button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input id="otp" placeholder="123456" {...otpForm.register('otp')} disabled={isLoading} />
            {otpForm.formState.errors.otp && (
                <p className="text-sm text-destructive">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" /> : <KeyRound />}
            Verify & Log In
          </Button>
           <Button variant="link" size="sm" onClick={() => { setStep('phone'); setError(null); }} className="w-full" disabled={isLoading}>
            Use a different phone number
          </Button>
        </form>
      )}
    </div>
  );
}
