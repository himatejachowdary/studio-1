'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, BrainCircuit, UserCheck, Search } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="text-center p-6 bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-serif mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <main className="flex-1">
        <section className="text-center py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <Stethoscope className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
              Welcome to SymptoScan AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Your intelligent health companion. Analyze your symptoms with the power of AI, get potential diagnoses, and find the right specialist near you.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </section>

        <section className="py-20 px-4 bg-background/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BrainCircuit className="w-12 h-12 text-primary" />}
                title="AI Symptom Analysis"
                description="Describe your symptoms in plain language and our advanced AI will provide a preliminary analysis of potential conditions."
              />
              <FeatureCard 
                icon={<UserCheck className="w-12 h-12 text-primary" />}
                title="Specialist Recommendations"
                description="Based on your symptoms, we'll recommend the most appropriate type of medical specialist to consult for an accurate diagnosis."
              />
              <FeatureCard 
                icon={<Search className="w-12 h-12 text-primary" />}
                title="Find Local Doctors"
                description="Instantly search for recommended specialists in your area using your device's location, complete with maps and contact details."
              />
            </div>
          </div>
        </section>
      </main>

       <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} SymptoScan AI. For informational purposes only. Not a substitute for professional medical advice.
      </footer>
    </div>
  );
}
