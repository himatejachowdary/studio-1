import SignupForm from '@/components/signup-form';
import Header from '@/components/header';

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/20">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <SignupForm />
      </main>
    </div>
  );
}
