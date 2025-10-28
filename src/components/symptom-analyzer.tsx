'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getAnalysis } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { FileText, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SymptomAnalyzerProps = {
  onAnalysisUpdate: (result: AnalysisResult | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (error: string | null) => void;
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

export function SymptomAnalyzer({ onAnalysisUpdate, onLoadingChange, onErrorChange }: SymptomAnalyzerProps) {
  const initialState = { message: '', result: null, error: null };
  const [state, formAction] = useFormState(getAnalysis, initialState);
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

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
      onAnalysisUpdate(null);
    }
    if (state.result) {
      onAnalysisUpdate(state.result);
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
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Symptom Checker
          </CardTitle>
          <CardDescription>
            Describe your symptoms in plain language, and our AI will provide a preliminary analysis.
          </CardDescription>
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
