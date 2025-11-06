import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Alegreya, Belleza } from 'next/font/google';

const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-headline',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Direct-to-Gemini',
  description: 'A simple interface to chat with Gemini',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-body antialiased", belleza.variable, alegreya.variable)}>
          {children}
        <Toaster />
      </body>
    </html>
  );
}
