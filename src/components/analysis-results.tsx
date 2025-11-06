'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ListChecks, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';

type AnalysisResultsProps = {
  results: AnalysisResult;
};

const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };
  
const getConfidenceValue = (level: string) => {
    switch(level.toLowerCase()) {
        case 'high': return 90;
        case 'medium': return 65;
        case 'low': return 30;
        default: return 0;
    }
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const { possibleConditions, confidenceLevel, nextSteps } = results;

  const conditions = possibleConditions.split(',').map(c => c.trim());
  const confidenceValue = getConfidenceValue(confidenceLevel);
  const chartData = [{ name: 'Confidence', value: confidenceValue }];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Analysis Results</CardTitle>
        <CardDescription>
          Based on the symptoms you provided, here is a preliminary analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <ListChecks className="text-primary" />
            Possible Conditions
          </h3>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="text-base">
                {condition}
              </Badge>
            ))}
          </div>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
            <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="text-primary" />
                    Confidence Level
                </h3>
                <div className='flex items-center gap-2'>
                    <Badge className={`${getUrgencyColor(confidenceLevel)} text-primary-foreground`}>
                        {confidenceLevel}
                    </Badge>
                    <div className='w-full h-8'>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Bar dataKey="value" fill="hsl(var(--primary))" background={{ fill: 'hsl(var(--muted))' }} radius={[4, 4, 4, 4]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="text-primary" />
                    Next Steps
                </h3>
                <p className="text-muted-foreground">{nextSteps}</p>
            </div>
        </div>

        <Alert>
          <AlertTitle className="font-bold">Disclaimer</AlertTitle>
          <AlertDescription>
            This AI-generated analysis is for informational purposes only and is
            not a substitute for professional medical advice, diagnosis, or
            treatment. Always seek the advice of your physician or other qualified
            health provider with any questions you may have regarding a medical
            condition.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
