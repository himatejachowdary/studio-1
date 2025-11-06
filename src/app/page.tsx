
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { ArrowRight, Bot, HeartPulse, Stethoscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 font-serif">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/20">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center mb-4">
                <Stethoscope className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-serif text-gray-800">
              Welcome to SymptoScan AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your intelligent health companion. Get instant, AI-powered analysis of your symptoms and find the right specialist near you.
            </p>
            <Link href="/signup">
                <Button size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif text-gray-800">
                    How It Works
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Bot className="w-6 h-6" />}
                        title="AI-Powered Analysis"
                        description="Describe your symptoms in plain language and our advanced AI will provide a preliminary analysis of potential conditions."
                    />
                    <FeatureCard 
                        icon={<HeartPulse className="w-6 h-6" />}
                        title="Specialist Recommendations"
                        description="Based on your symptoms, we'll recommend the most appropriate type of medical specialist to consult for a professional diagnosis."
                    />
                    <FeatureCard 
                        icon={<Stethoscope className="w-6 h-6" />}
                        title="Find Doctors Near You"
                        description="Instantly find highly-rated, local doctors who match the recommended specialty, complete with contact information and location."
                    />
                </div>
            </div>
        </section>
      </main>

       {/* Footer */}
       <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-muted-foreground">&copy; {new Date().getFullYear()} SymptoScan AI. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
}
