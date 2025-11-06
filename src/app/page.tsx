'use client';

import { Header } from '@/components/header';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Stethoscope } from 'lucide-react';

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
              Authentication Ready
            </h1>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl font-body mt-4">
              You have a fully functional authentication system. Log in to see the authenticated view.
            </p>
            <div className="mt-6">
              <Button
                onClick={onGetStarted}
                size="lg"
              >
                Log In / Sign Up
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


function AuthenticatedPage() {
    const { user } = useUser();
    return (
        <div className="flex-1 flex flex-col">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6 text-center">
                         <div className="flex justify-center items-center gap-3 mb-4">
                            <Stethoscope className="text-primary h-12 w-12" />
                            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                                Welcome Back
                            </h1>
                        </div>
                        <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl font-body mt-4 flex items-center justify-center gap-2">
                            <User className="w-5 h-5"/>
                            Signed in as: <span className="font-semibold">{user?.email || user?.phoneNumber || "Anonymous User"}</span>
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">You can manage your multi-factor authentication settings by navigating to `/mfa`.</p>
                    </div>
                </section>
            </main>
        </div>
    )
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
      signOut(auth);
    }
  };
  
  const handleGetStarted = () => {
    router.push('/login');
  };

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
        <Header isLoggedIn={!!user} onLogin={handleLogin} onLogout={handleLogout} />
        <main className="flex-1">
          {user ? (
            <AuthenticatedPage />
          ) : (
            <LandingPage onGetStarted={handleGetStarted} />
          )}
        </main>
        <footer className="py-6 px-4 md:px-8 border-t">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
