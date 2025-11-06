'use client';

import { useAuth, useUser } from '@/firebase';
import { LogOut, Stethoscope } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Header({ className }: { className?: string }) {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  return (
    <header className={cn("flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-50", className)}>
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Stethoscope className="h-6 w-6 text-primary" />
        <span className="text-lg font-serif">SymptoScan AI</span>
      </Link>
      <div className='flex items-center gap-2'>
        {user ? (
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
