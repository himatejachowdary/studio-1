'use client';

import { useActionState, useFormStatus, useEffect, useRef } from 'react';
import { getAnalysis } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisResult } from '@/lib/types';
import { FileText, Bot, Siren } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type SymptomAnalyzerProps = {
  onAnalysisUpdate: (result: AnalysisResult | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (error: string | null) => void;
  onSos: () => void;
  isUserLoggedIn: boolean;
};

function SubmitButton({ isUserLoggedIn }: { isUserLoggedIn: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending || !isUserLoggedIn}>
            {pending ? (
                <>
                    <span className="spinner-sm mr-2" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Bot className="mr-2 h-4 w-4" />
                    Analyze Symptoms
                </>
            )}
        </Button>
    );
}

export function SymptomAnalyzer({ onAnalysisUpdate, onLoadingChange, onErrorChange, onSos, isUserLoggedIn }: SymptomAnalyzerProps) {
  const initialState = { message: '', result: null, error: null };
  const [state, formAction] = useActionState(getAnalysis, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
      const { pending } = formRef.current?.dataset ?? {};
      onLoadingChange(pending === 'true');
  }, [onLoadingChange, state]);


  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: state.error,
      });
      onErrorChange(state.error);
      onAnalysisUpdate(null);
    }
    if (state.result) {
      toast({
        title: "Analysis Complete",
        description: "Your diagnosis has been automatically saved to your history."
      });
      onAnalysisUpdate(state.result);
      onErrorChange(null);
    }
  }, [state, onAnalysisUpdate, onErrorChange, toast]);
  
  useEffect(() => {
    // This is a workaround to get pending state from useActionState
    // which is not yet available.
    const form = formRef.current;
    if (!form) return;

    const handler = (e: Event) => {
        const { pending } = (e as unknown as {target: HTMLFormElement}).target.dataset;
        onLoadingChange(pending === 'true');
    }
    
    form.addEventListener('submit', handler);
    form.addEventListener('DOMSubtreeModified', handler);
    
    return () => {
        form.removeEventListener('submit', handler);
        form.removeEventListener('DOMSubtreeModified', handler);
    }
  }, [onLoadingChange]);

  const spinnerStyle = `
    .spinner-sm {
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: spinner-border .75s linear infinite;
    }
    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{spinnerStyle}</style>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Symptom Checker
              </CardTitle>
              <CardDescription>
                Describe your symptoms for a preliminary analysis. Log in to enable.
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-shrink-0" disabled={!isUserLoggedIn}>
                  <Siren className="mr-2" />
                  SOS
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Emergency Assistance</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will find the nearest hospitals and provide the emergency service number (108). Do you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onSos}>Proceed</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <form action={formAction} ref={formRef}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Describe your symptoms</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="e.g., 'I have a throbbing headache, a fever of 101°F, and a persistent cough.'"
                rows={6}
                required
                disabled={!isUserLoggedIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                placeholder="e.g., 'History of asthma, allergic to penicillin.'"
                rows={4}
                disabled={!isUserLoggedIn}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="useMedicalHistory">Use Medical History</Label>
                    <p className="text-xs text-muted-foreground">
                        Factor your history into the analysis.
                    </p>
                </div>
                <Switch id="useMedicalHistory" name="useMedicalHistory" disabled={!isUserLoggedIn} />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton isUserLoggedIn={isUserLoggedIn} />
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
