'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getAnalysis } from '@/lib/actions';
import type { AnalysisAndDocsResult } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Bot, Siren, AlertTriangle } from 'lucide-react';
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
  onAnalysisUpdate: (result: AnalysisAndDocsResult | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (error: string | null) => void;
  onSos: () => void;
  isUserLoggedIn: boolean;
};

function SubmitButton({ isUserLoggedIn }: { isUserLoggedIn: boolean }) {
    const { pending } = useFormStatus();

    useEffect(() => {
      // This is a workaround until a better solution for pending state is available
      // from useActionState. We use a data attribute on the form.
      const form = document.querySelector('form[data-form-id="symptom-analyzer-form"]');
      if (form) {
        form.setAttribute('data-pending', pending.toString());
      }
    }, [pending]);
    
    return (
        <Button type="submit" className="w-full" disabled={pending || !isUserLoggedIn}>
            {pending ? (
                <>
                    <Bot className="mr-2 h-4 w-4 animate-spin" />
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
  const [location, setLocation] = useState<{lat: number | null, lon: number | null, error: string | null}>({lat: null, lon: null, error: null});

  const { toast } = useToast();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocation({ lat: position.coords.latitude, lon: position.coords.longitude, error: null });
        },
        (error) => {
            setLocation({ lat: null, lon: null, error: "Location access denied. Doctor recommendations will be unavailable."});
        }
    );
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const observer = new MutationObserver((mutations) => {
        for(let mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-pending') {
                const isPending = form.getAttribute('data-pending') === 'true';
                onLoadingChange(isPending);
            }
        }
    });

    observer.observe(form, { attributes: true });

    return () => observer.disconnect();

  }, [onLoadingChange]);

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
  

  return (
    <>
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
        <form action={formAction} ref={formRef} data-form-id="symptom-analyzer-form">
          <CardContent className="space-y-6">
            {location.error && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-md text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4"/>
                    {location.error}
                </div>
            )}
            <input type="hidden" name="latitude" value={location.lat ?? ""} />
            <input type="hidden" name="longitude" value={location.lon ?? ""} />
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
