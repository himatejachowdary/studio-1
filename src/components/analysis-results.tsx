import { Bot, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import type { AnalysisResult } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Props = {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
};

export function AnalysisResults({ analysis, isLoading, error }: Props) {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
           <div>
            <Skeleton className="h-5 w-1/4 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div>
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </div>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="text-center text-destructive flex flex-col items-center gap-4 py-8">
          <AlertTriangle className="w-12 h-12" />
          <p className="font-semibold">Analysis Failed</p>
          <p className="text-sm">{error}</p>
        </div>
       )
    }

    if (!analysis) {
      return (
        <div className="text-center text-muted-foreground flex flex-col items-center gap-4 py-8">
          <Bot className="w-12 h-12" />
          <p className="font-semibold">Your AI-powered analysis will appear here.</p>
          <p className="text-sm">Please fill out the form to get started.</p>
        </div>
      );
    }

    let confidenceVariant: BadgeProps["variant"] = "secondary";
    if (analysis.confidenceLevel.toLowerCase() === 'high') {
      confidenceVariant = "default";
    } else if (analysis.confidenceLevel.toLowerCase() === 'low') {
      confidenceVariant = "destructive";
    }

    return (
      <div className="space-y-6 font-body">
        <div>
          <h3 className="font-semibold text-lg mb-2">Possible Conditions</h3>
          <p className="text-muted-foreground">{analysis.possibleConditions}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Confidence Level</h3>
          <Badge variant={confidenceVariant}>{analysis.confidenceLevel}</Badge>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Recommended Next Steps</h3>
          <p className="text-muted-foreground">{analysis.nextSteps}</p>
        </div>
         <div className="text-xs text-muted-foreground/80 pt-4 border-t mt-6">
            <p><strong>Disclaimer:</strong> This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a healthcare provider for any medical concerns.</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Symptom Analysis</CardTitle>
        <CardDescription>AI-generated potential diagnosis based on your symptoms.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
