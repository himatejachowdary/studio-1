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
            Enter your phone number or email to receive a secure one-time code.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="phone">
            <PhoneAuthForm onAuthSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="email">
            <EmailAuthForm onAuthSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
