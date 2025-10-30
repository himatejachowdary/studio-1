'use client';

import { MfaEnrollment } from '@/components/mfa-enrollment';
import { useUser } from '@/firebase';
import { Header } from '@/components/header';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Loader } from 'lucide-react';


export default function MfaPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const auth = useAuth();
    
    const handleLogout = () => {
        if(auth) {
            signOut(auth);
        }
    };

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen flex-col gap-4">
                <Loader className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Security Settings...</p>
            </div>
        )
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/20">
            <Header isLoggedIn={!!user} onLogin={() => router.push('/login')} onLogout={handleLogout} />
            <main className="flex-1 py-8 px-4 md:py-12 md:px-8">
                <div className="container mx-auto max-w-2xl">
                    <MfaEnrollment user={user} />
                </div>
            </main>
        </div>
    );
}
