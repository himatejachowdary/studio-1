'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { Loader, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailAuthForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const handleEmailSubmit = async ({ email }: EmailFormValues) => {
    setIsLoading(true);
    setError(null);
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: window.location.href, // Redirect back to the same page
      handleCodeInApp: true, // This must be true.
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // The link was successfully sent. Inform the user.
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem('emailForSignIn', email);
      setIsEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="text-center p-4 space-y-4 rounded-lg bg-secondary/50">
        <Mail className="mx-auto h-12 w-12 text-primary" />
        <h3 className="font-semibold text-lg">Check Your Email</h3>
        <p className="text-sm text-muted-foreground">
          A secure sign-in link has been sent to <span className="font-bold text-foreground">{getValues('email')}</span>. Click the link to log in.
        </p>
         <Button variant="link" size="sm" onClick={() => setIsEmailSent(false)} className="w-full">
            Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-4">
        {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader className="animate-spin" /> : <Mail />}
        Send Sign-In Link
      </Button>
    </form>
  );
}