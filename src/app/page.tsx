'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Sparkles, AlertTriangle } from 'lucide-react';
import { getSimpleResponse } from '@/lib/actions';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await getSimpleResponse(prompt);
      setResponse(result);
    } catch (err: any) {
      setError(String(err.message) || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/20 p-4 md:p-24">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline flex items-center gap-2">
              <Sparkles className="text-primary" />
              Direct-to-Gemini Interface
            </CardTitle>
            <CardDescription>
              Enter any prompt below and get a direct response from the AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-input" className="text-lg">Your Prompt</Label>
                <Textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'What is the speed of light?' or 'Write a poem about robots...'"
                  rows={4}
                  className="text-base"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader className="animate-spin" />
                ) : (
                  'Submit to AI'
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-6">
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader className='flex-row items-center gap-3 space-y-0'>
                         <AlertTriangle className="w-6 h-6 text-destructive" />
                        <CardTitle>An Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
              </div>
            )}
            
            {response && !isLoading && (
              <div className="mt-6">
                <Card className="bg-secondary/30">
                    <CardHeader>
                        <CardTitle>AI Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap font-body text-base">{response}</p>
                    </CardContent>
                </Card>
              </div>
            )}

             {isLoading && (
                <div className="mt-6 text-center text-muted-foreground flex items-center justify-center gap-3">
                    <Loader className="animate-spin" />
                    <p>Waiting for response...</p>
                </div>
             )}

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
