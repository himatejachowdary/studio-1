'use client';

import { Header } from '@/components/header';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SymptoScanDashboard } from '@/components/sympto-scan-dashboard';

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
              SymptoScan
            </h1>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl font-body mt-4">
              Your AI-powered symptom analysis and doctor recommendation tool.
            </p>
            <div className="mt-6">
              <Button
                onClick={onGetStarted}
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/');
      });
    }
  };
  
  const handleGetStarted = () => {
    router.push('/login');
  };

  // This will be passed down to SymptoScanDashboard and then to the Header
  const handleSos = () => {
    // If a user isn't logged in, they can't save history, but we can still show hospitals.
    // For simplicity, we'll just reuse the logged-in dashboard's logic.
    // We can't directly trigger the dashboard's state, so we'll pass a prop.
    // A query param is a good way to signal an initial state.
    const targetUrl = user ? '/?sos=true' : '/login?sos=true';
    if(window.location.search.includes('sos=true')) {
      // If we are already in SOS mode, reload to re-trigger the effect in the dashboard
      window.location.reload();
    } else {
       router.push(targetUrl);
    }
  }

  if (isUserLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <Loader className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Session...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header isLoggedIn={!!user} onLogin={handleLogin} onLogout={handleLogout} onSosClick={handleSos} />
        <main className="flex-1">
          {user ? (
            <SymptoScanDashboard user={user}/>
          ) : (
            <LandingPage onGetStarted={handleGetStarted} />
          )}
        </main>
        <footer className="py-6 px-4 md:px-8 border-t">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SymptoScan. All rights reserved.</p>
            <p className="text-xs mt-2">Disclaimer: This tool is for informational purposes only and is not a substitute for professional medical advice.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
