'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { LandingPage } from '@/components/landing-page';
import { SymptoScanDashboard } from '@/components/sympto-scan-dashboard';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} onLoginToggle={handleLoginToggle} />
      <main className="flex-1">
        {isLoggedIn ? (
          <SymptoScanDashboard />
        ) : (
          <LandingPage onGetStarted={() => setIsLoggedIn(true)} />
        )}
      </main>
      <footer className="py-6 px-4 md:px-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SymptoScan. All rights reserved.</p>
          <p className="mt-1">This is a demo application. Not for medical use.</p>
        </div>
      </footer>
    </div>
  );
}
