'use client';

import { useActionState, useFormStatus } from 'react';
import { getAnalysis } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';
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
  onAnalysisUpdate: (result: AnalysisResult | null, data: {symptoms: string, medicalHistory?: string}) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (error: string | null) => void;
  onSos: () => void;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
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

export function SymptomAnalyzer({ onAnalysisUpdate, onLoadingChange, onErrorChange, onSos }: SymptomAnalyzerProps) {
  const initialState = { message: '', result: null, error: null, symptoms: '', medicalHistory: '' };
  const [state, formAction] = useActionState(getAnalysis, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const { pending } = useFormStatus();

  useEffect(() => {
    onLoadingChange(pending);
  }, [pending, onLoadingChange]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: state.error,
      });
      onErrorChange(state.error);
      onAnalysisUpdate(null, {symptoms: '', medicalHistory: ''});
    }
    if (state.result) {
      onAnalysisUpdate(state.result, {symptoms: state.symptoms, medicalHistory: state.medicalHistory});
      onErrorChange(null);
    }
  }, [state, onAnalysisUpdate, onErrorChange, toast]);

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
                Describe your symptoms in plain language for a preliminary analysis.
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-shrink-0">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                placeholder="e.g., 'History of asthma, allergic to penicillin.'"
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="useMedicalHistory">Use Medical History</Label>
                    <p className="text-xs text-muted-foreground">
                        Factor your history into the analysis.
                    </p>
                </div>
                <Switch id="useMedicalHistory" name="useMedicalHistory" />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
