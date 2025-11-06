import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Inter, Lexend } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontSerif = Lexend({
  subsets: ['latin'],
  variable: '--font-serif',
});


export const metadata: Metadata = {
  title: 'SymptoScan AI',
  description: 'Analyze your symptoms with the power of AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontSerif.variable)}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
