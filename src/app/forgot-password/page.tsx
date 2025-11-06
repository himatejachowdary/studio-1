
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Loader, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handlePasswordResetSubmit = async ({ email }: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email);
        setEmailSent(true);
        toast({ title: 'Success!', description: 'A password reset link has been sent to your email.' });
      } else {
        throw new Error('Auth service not available');
      }
    } catch (err: any) {
      let friendlyMessage = 'An error occurred. Please try again.';
      if (err.code === 'auth/user-not-found') {
        friendlyMessage = 'No user found with this email address.';
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-3 mb-4">
                <Stethoscope className="text-primary h-10 w-10" />
                <h1 className="text-4xl font-headline font-bold text-foreground">
                    SymptoScan
                </h1>
            </Link>
            <p className="text-muted-foreground">Reset your password.</p>
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-lg">
            {emailSent ? (
                 <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertTitle>Check Your Email</AlertTitle>
                    <AlertDescription>
                        A password reset link has been sent to your email address. Please follow the instructions in the email to reset your password.
                    </AlertDescription>
                 </Alert>
            ) : (
                <>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Reset Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit(handlePasswordResetSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="name@example.com" {...register('email')} disabled={isLoading} />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader className="animate-spin" /> : <Mail />}
                            Send Reset Link
                        </Button>
                    </form>
                </>
            )}
        </div>

        <div className="text-center mt-6">
            <Button variant="link" asChild>
                <Link href="/login">Back to Log In</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
