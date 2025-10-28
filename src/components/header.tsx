import { Stethoscope, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  isLoggedIn: boolean;
  onLoginToggle: () => void;
};

export function Header({ isLoggedIn, onLoginToggle }: HeaderProps) {
  return (
    <header className="py-4 px-4 md:px-8 flex justify-between items-center bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="flex items-center gap-3">
        <Stethoscope className="text-primary h-8 w-8" />
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
          SymptoScan
        </h1>
      </div>
      <Button onClick={onLoginToggle} variant="outline" size="sm">
        <User className="mr-2 h-4 w-4" />
        {isLoggedIn ? 'Log Out' : 'Log In / Sign Up'}
      </Button>
    </header>
  );
}
