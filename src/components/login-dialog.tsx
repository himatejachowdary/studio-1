'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneAuthForm } from './phone-auth-form';
import { EmailAuthForm } from './email-auth-form';
import { Smartphone, Mail } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function LoginDialog({ isOpen, onOpenChange }: Props) {
  const [isAuthSuccessful, setAuthSuccessful] = useState(false);

  const handleAuthSuccess = () => {
    setAuthSuccessful(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log In or Sign Up</DialogTitle>
          <DialogDescription>
            Choose a secure, passwordless sign-in method below.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="phone" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">
                <Smartphone className="mr-2 h-4 w-4" />
                Phone
            </TabsTrigger>
            <TabsTrigger value="email">
                <Mail className="mr-2 h-4 w-4" />
                Email
            </TabsTrigger>
          </TabsList>
          <TabsContent value="phone" className="pt-4">
            <PhoneAuthForm onAuthSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="email" className="pt-4">
            <EmailAuthForm onAuthSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
