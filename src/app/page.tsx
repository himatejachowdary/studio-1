'use client';
import SymptoScanDashboard from '@/components/sympto-scan-dashboard';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/20 p-4 md:p-8">
      <SymptoScanDashboard />
    </main>
  );
}
