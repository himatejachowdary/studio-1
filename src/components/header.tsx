import { Stethoscope, User, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export function Header({ isLoggedIn, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="py-4 px-4 md:px-8 flex justify-between items-center bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="flex items-center gap-3">
        <Stethoscope className="text-primary h-8 w-8" />
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
          SymptoScan
        </h1>
      </div>
      {isLoggedIn ? (
         <Button onClick={onLogout} variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      ) : (
        <Button onClick={onLogin} variant="outline" size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Log In / Sign Up
        </Button>
      )}
    </header>
  );
}
