'use client';

import { useAuth } from '@/firebase';
import { Activity, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-lg font-serif">SymptoScan AI</span>
      </div>
      {auth.currentUser && (
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
