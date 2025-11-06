import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-lg font-serif">SymptoScan AI</span>
      </div>
    </header>
  );
}
