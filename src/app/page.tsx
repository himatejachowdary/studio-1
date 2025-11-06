
'use client';

import { Header } from '@/components/header';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader, BrainCircuit, Stethoscope as StethoscopeIcon, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SymptoScanDashboard } from '@/components/sympto-scan-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-secondary/30">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
          <div className="container px-4 md:px-6 grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4 text-center lg:text-left">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                Understand Your Health with AI
              </h1>
              <p className="max-w-[600px] mx-auto lg:mx-0 text-muted-foreground md:text-xl font-body">
                SymptoScan gives you intelligent insights into your symptoms and helps you find the right doctor, right when you need it.
              </p>
              <div className="mt-6">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="shadow-lg hover:shadow-primary/40 transition-shadow"
                >
                  Get Your Free Analysis
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Stethoscope className="w-48 h-48 lg:w-72 lg:h-72 text-primary opacity-20" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 bg-secondary/30">
            <div className='container px-4 md:px-6'>
                <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
                    <div className="grid gap-1 text-center">
                        <div className='flex justify-center mb-4'>
                            <div className='p-4 bg-primary/10 rounded-full'>
                                <BrainCircuit className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold font-headline">AI-Powered Analysis</h3>
                        <p className="text-sm text-muted-foreground">Describe your symptoms and our advanced AI provides a preliminary analysis of possible conditions.</p>
                    </div>
                     <div className="grid gap-1 text-center">
                        <div className='flex justify-center mb-4'>
                            <div className='p-4 bg-primary/10 rounded-full'>
                                <StethoscopeIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold font-headline">Doctor Recommendations</h3>
                        <p className="text-sm text-muted-foreground">Based on your analysis, we suggest the right medical specialty and help you find doctors nearby.</p>
                    </div>
                     <div className="grid gap-1 text-center">
                        <div className='flex justify-center mb-4'>
                            <div className='p-4 bg-primary/10 rounded-full'>
                                <MapPin className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold font-headline">Emergency Assistance</h3>
                        <p className="text-sm text-muted-foreground">Our SOS feature quickly finds nearby hospitals for you in case of an emergency.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 bg-background">
            <div className="container mx-auto text-center px-4 md:px-6">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl mb-12">How It Works</h2>
                <div className="mx-auto grid gap-8 sm:max-w-4xl lg:grid-cols-3">
                    <Card className="shadow-sm hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-4"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</span>Describe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Enter your symptoms and any relevant medical history you feel comfortable sharing.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-4"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">2</span>Analyze</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Our AI analyzes the information to identify potential conditions and next steps.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-4"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">3</span>Act</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Receive recommendations for medical specialists and find local doctors or hospitals.</p>
                        </CardContent>
                    </Card>
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
