'use client';
import { useMemo } from 'react';
import { useUser } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Header } from '@/components/header';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Loader, Inbox, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import type { Diagnosis } from '@/lib/types';

function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
    const { symptoms, medicalHistory, timestamp, possibleConditions, confidenceLevel, nextSteps, specialty } = diagnosis;
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex justify-between items-center'>
                    <span>Analysis from {new Date(timestamp).toLocaleString()}</span>
                    <Badge variant={confidenceLevel === 'High' ? 'default' : confidenceLevel === 'Medium' ? 'secondary': 'outline'}>
                        {confidenceLevel} Confidence
                    </Badge>
                </CardTitle>
                <CardDescription>AI-generated diagnosis based on your reported symptoms.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Your Reported Symptoms</AccordionTrigger>
                        <AccordionContent>
                            <p className='font-medium'>Symptoms:</p>
                            <p className="text-muted-foreground mb-2">{symptoms}</p>
                            {medicalHistory && <>
                                <p className='font-medium'>Medical History:</p>
                                <p className="text-muted-foreground">{medicalHistory}</p>
                            </>}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>AI Analysis</AccordionTrigger>
                        <AccordionContent className='space-y-4'>
                            <div>
                                <p className='font-medium'>Possible Conditions:</p>
                                <p className='text-muted-foreground'>{possibleConditions}</p>
                            </div>
                            <div>
                                <p className='font-medium'>Recommended Next Steps:</p>
                                <p className='text-muted-foreground'>{nextSteps}</p>
                            </div>
                            <div>
                                <p className='font-medium'>Suggested Specialty:</p>
                                <p className='text-muted-foreground'>{specialty}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const diagnosesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'users', user.uid, 'diagnoses'),
        orderBy('timestamp', 'desc')
    );
  }, [user, firestore]);

  const { data: diagnoses, isLoading: isDiagnosesLoading, error } = useCollection<Diagnosis>(diagnosesQuery);

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => router.push('/'));
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  const renderContent = () => {
    if(isDiagnosesLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader className="animate-spin text-primary" /></div>
    }

    if(error) {
        return (
            <div className='flex justify-center py-10'>
                <Card className='max-w-lg bg-destructive/10 border-destructive'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><AlertTriangle /> Error Fetching History</CardTitle>
                        <CardDescription className='text-destructive'>{error.message}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!diagnoses || diagnoses.length === 0) {
        return (
            <div className='flex justify-center py-20'>
                <div className='text-center text-muted-foreground flex flex-col items-center gap-4'>
                    <Inbox className='w-16 h-16 text-primary/50' />
                    <h2 className='text-2xl font-headline'>No History Yet</h2>
                    <p>Your past symptom analyses will appear here.</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className='space-y-4'>
            {diagnoses.map(d => <DiagnosisCard key={d.id} diagnosis={d} />)}
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/20">
      <Header
        isLoggedIn={!!user}
        onLogin={() => router.push('/login')}
        onLogout={handleLogout}
      />
      <main className="flex-1 py-8 px-4 md:py-12 md:px-8">
        <div className="container mx-auto max-w-4xl">
            <h1 className='text-4xl font-headline font-bold mb-6'>Analysis History</h1>
            {renderContent()}
        </div>
      </main>
    </div>
  );
}
