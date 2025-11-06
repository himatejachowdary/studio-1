'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Analysis } from '@/lib/types';
import { AlertCircle, Bot } from 'lucide-react';

type SymptomAnalysisProps = {
  analysis: Analysis;
  onFindDoctors: (specialty: string) => void;
  isFindingDoctors: boolean;
};

const SymptomAnalysis = ({ analysis, onFindDoctors, isFindingDoctors }: SymptomAnalysisProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          <div>
            <CardTitle className="text-3xl font-serif">AI Analysis Report</CardTitle>
            <CardDescription>
              Based on the symptoms you provided, here is a preliminary analysis.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-muted-foreground">{analysis.summary}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Potential Conditions</h3>
          <div className="space-y-4">
            {analysis.potentialConditions.map((condition) => (
              <div key={condition.name} className="p-4 border rounded-lg bg-secondary/30">
                <h4 className="font-medium text-base">{condition.name}</h4>
                <p className="text-sm text-muted-foreground">{condition.description}</p>
              </div>
            ))}
          </div>
        </div>
         <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
            <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">Recommended Specialist</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{analysis.recommendedSpecialty}</p>
        </div>

        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-1" />
            <div>
              <h3 className="font-semibold">Disclaimer</h3>
              <p className="text-sm">
                This is an AI-generated analysis and is not a substitute for professional medical advice. Please consult with a qualified healthcare provider for any health concerns.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => onFindDoctors(analysis.recommendedSpecialty)} disabled={isFindingDoctors}>
            {isFindingDoctors ? 'Searching...' : `Find a ${analysis.recommendedSpecialty} Near Me`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SymptomAnalysis;
