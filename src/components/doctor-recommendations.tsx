import { Building, MapPin, User, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/lib/types';
import type { AnalysisResult } from '@/lib/types';

const dummyDoctors: Doctor[] = [
  { name: 'Dr. Alice Johnson', specialty: 'General Practitioner', address: '123 Health St, Medville', distance: '1.2 mi' },
  { name: 'Dr. Bob Williams', specialty: 'Cardiologist', address: '456 Heart Ave, Townburg', distance: '2.5 mi' },
  { name: 'Dr. Carol White', specialty: 'Dermatologist', address: '789 Skin Rd, Cityplace', distance: '3.1 mi' },
];

export function DoctorRecommendations({ analysis }: { analysis: AnalysisResult | null }) {
  if (!analysis) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-8 border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary rounded-full p-3">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline mt-4">Doctor Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete your symptom analysis to see relevant doctor recommendations here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="font-headline">Recommended Doctors</CardTitle>
                <CardDescription>Based on your analysis for: {analysis.possibleConditions.split(',')[0]}</CardDescription>
            </div>
            <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-4">
          {dummyDoctors.map((doctor, index) => (
            <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-background rounded-full">
                    <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{doctor.distance}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <MapPin className="w-3 h-3"/>
                    {doctor.address}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant="outline">View all doctors</Button>
      </CardContent>
    </Card>
  );
}
