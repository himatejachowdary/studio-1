import SymptoScanDashboard from '@/components/sympto-scan-dashboard';
import Header from '@/components/header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-secondary/20 p-4 md:p-8">
        <SymptoScanDashboard />
      </main>
    </>
  );
}
