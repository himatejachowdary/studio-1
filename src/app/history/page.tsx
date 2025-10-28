'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/header';
import { Loader, AlertTriangle, Stethoscope, PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

type Diagnosis = {
  id: string;
  symptoms: string;
  medicalHistory: string;
  possibleConditions: string;
  confidenceLevel: string;
  nextSteps: string;
  timestamp: Timestamp;
};

function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
    const date = diagnosis.timestamp?.toDate ? diagnosis.timestamp.toDate() : new Date();

    return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div>
                <CardTitle className="font-headline text-xl">{diagnosis.possibleConditions.split(',')[0]}</CardTitle>
                <CardDescription>
                    {date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    })}
                </CardDescription>
            </div>
             <Badge variant={
                diagnosis.confidenceLevel.toLowerCase() === 'high' ? 'default' :
                diagnosis.confidenceLevel.toLowerCase() === 'low' ? 'destructive' :
                'secondary'
             } className="flex-shrink-0">
                {diagnosis.confidenceLevel} Confidence
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1 text-primary">Symptoms Reported</h4>
          <p className="text-sm text-muted-foreground">{diagnosis.symptoms}</p>
        </div>
        {diagnosis.medicalHistory && (
          <div>
            <h4 className="font-semibold mb-1 text-primary">Medical History Provided</h4>
            <p className="text-sm text-muted-foreground">{diagnosis.medicalHistory}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold mb-1 text-primary">AI-Suggested Conditions</h4>
          <p className="text-sm text-muted-foreground">{diagnosis.possibleConditions}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-1 text-primary">Recommended Next Steps</h4>
          <p className="text-sm text-muted-foreground">{diagnosis.nextSteps}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  const diagnosesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const diagnosesRef = collection(firestore, `users/${user.uid}/diagnoses`);
    return query(diagnosesRef, orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: diagnoses, isLoading, error } = useCollection<Diagnosis>(diagnosesQuery);

  const handleLogout = () => {
    if(auth) {
      signOut(auth);
    }
  };
  
  const renderContent = () => {
    if (isLoading || isUserLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your diagnosis history...</p>
        </div>
      );
    }

    if (error) {
        return (
         <div className="text-center py-12 text-destructive flex flex-col items-center gap-4">
           <AlertTriangle className="w-12 h-12" />
           <p className="font-semibold text-lg">Error Loading History</p>
           <p className="text-sm max-w-md mx-auto">{error.message}</p>
         </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-lg bg-secondary/30">
                <Stethoscope className="w-16 h-16 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Access Your History</h2>
                <p className="text-muted-foreground">Please log in to view your saved symptom analyses.</p>
                <Button asChild>
                    <Link href="/">Log In</Link>
                </Button>
            </div>
        )
    }

    if (diagnoses && diagnoses.length === 0) {
      return (
        <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-lg bg-secondary/30">
            <Stethoscope className="w-16 h-16 text-primary" />
            <h2 className="text-2xl font-bold font-headline">No History Found</h2>
            <p className="text-muted-foreground">You haven't saved any symptom analyses yet.</p>
            <Button asChild>
                <Link href="/">
                    <PlusCircle className="mr-2" />
                    Start a New Analysis
                </Link>
            </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {diagnoses?.map((diagnosis) => (
          <DiagnosisCard key={diagnosis.id} diagnosis={diagnosis} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/20">
      <Header isLoggedIn={!!user} onLogin={() => {}} onLogout={handleLogout} />
      <main className="flex-1 py-8 px-4 md:py-12 md:px-8">
        <div className="container mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold font-headline mb-2">Diagnosis History</h1>
            <p className="text-muted-foreground mb-8">A secure record of your past AI-powered symptom analyses.</p>
            {renderContent()}
        </div>
      </main>
    </div>
  );
}
