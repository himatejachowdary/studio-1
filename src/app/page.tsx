'use client';

import { Header } from '@/components/header';
import { LandingPage } from '@/components/landing-page';
import { SymptoScanDashboard } from '@/components/sympto-scan-dashboard';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader } from 'lucide-react';
import { useState } from 'react';
import { LoginDialog } from '@/components/login-dialog';


export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    if (!user) {
      setLoginDialogOpen(true);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };
  
  const handleGetStarted = () => {
    if (user) {
      // If user is already logged in, maybe scroll to dashboard or something
    } else {
      setLoginDialogOpen(true);
    }
  };

  if (isUserLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <Loader className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading SymptoScan...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header isLoggedIn={!!user} onLogin={handleLogin} onLogout={handleLogout} />
        <main className="flex-1">
          {user ? (
            <SymptoScanDashboard />
          ) : (
            <LandingPage onGetStarted={handleGetStarted} />
          )}
        </main>
        <footer className="py-6 px-4 md:px-8 border-t">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SymptoScan. All rights reserved.</p>
            <p className="mt-1">This is a demo application. Not for medical use.</p>
          </div>
        </footer>
      </div>
      <LoginDialog isOpen={isLoginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  );
}
