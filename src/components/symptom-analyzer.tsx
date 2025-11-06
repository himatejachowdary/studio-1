'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAnalysis } from '@/lib/actions';
import { Analysis } from '@/lib/types';
import { Calendar, Heart, Pencil, User, Stethoscope } from 'lucide-react';

const formSchema = z.object({
  symptoms: z.string().min(10, 'Please describe your symptoms in at least 10 characters.'),
  age: z.coerce.number().min(1, 'Please enter a valid age.').max(120),
  gender: z.enum(['male', 'female', 'other']),
});

type SymptomAnalyzerProps = {
  onAnalysisStart: () => void;
  onAnalysisComplete: (analysis: Analysis) => void;
  onAnalysisError: (error: string) => void;
};

const SymptomAnalyzer = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError }: SymptomAnalyzerProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
      age: 30,
      gender: 'male',
    },
  });

  const handleAnalysisSubmit = async (values: z.infer<typeof formSchema>) => {
    onAnalysisStart();
    try {
      const analysis = await getAnalysis(values.symptoms, values.age, values.gender);
      onAnalysisComplete(analysis);
    } catch (err: any) {
      onAnalysisError(err.message);
    }
  };

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="text-center items-center">
        <Stethoscope className="w-12 h-12 text-primary mb-2"/>
        <CardTitle className="text-3xl font-serif">SymptoScan AI</CardTitle>
        <CardDescription>Describe your symptoms, and our AI will provide a preliminary analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAnalysisSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> How are you feeling?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'I have a sharp headache, slight fever, and a runny nose...'"
                      rows={5}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Age</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="number" placeholder="Your age" className="pl-10" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Gender</FormLabel>
                     <div className="relative">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Analyzing...' : 'Analyze My Symptoms'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SymptomAnalyzer;
