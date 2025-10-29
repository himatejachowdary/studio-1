import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const heroImage = placeholderImages.find(p => p.id === 'hero-doctor');

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Your Personal Health Companion
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                    Understand your symptoms, get potential diagnoses, and find the right doctors near you. All with the power of AI.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
              {heroImage && (
                <div className="relative w-full h-64 md:h-auto rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
