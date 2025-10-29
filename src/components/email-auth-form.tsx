'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { Loader, Mail, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailAuthForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const handleAuthSubmit = async ({ email, password }: EmailFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Success!', description: 'Your account has been created.' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Success!', description: 'You have been logged in.' });
      }
      onAuthSuccess();
    } catch (err: any) {
      let friendlyMessage = 'An authentication error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already in use. Please log in instead.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyMessage = 'Invalid email or password. Please try again.';
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleAuthSubmit)} className="space-y-4">
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
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="flex gap-2">
         <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading} 
            onClick={() => setMode('login')}
        >
            {isLoading && mode === 'login' ? <Loader className="animate-spin" /> : <Mail />}
            Log In
        </Button>
        <Button 
            type="submit" 
            variant="secondary" 
            className="w-full" 
            disabled={isLoading}
            onClick={() => setMode('signup')}
        >
            {isLoading && mode === 'signup' ? <Loader className="animate-spin" /> : <CheckCircle />}
            Sign Up
        </Button>
      </div>
    </form>
  );
}
