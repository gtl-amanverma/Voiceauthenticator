'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVoiceEmbedding } from '@/ai/flows/voice-embedding-extraction';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Recorder } from '@/components/recorder';
import { Logo } from '@/components/logo';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (audioDataUri: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { embedding } = await getVoiceEmbedding({ audioBuffer: audioDataUri });
      
      localStorage.setItem('voiceEmbedding', JSON.stringify(embedding));
      localStorage.setItem('isAuthenticated', 'true');

      toast({
        title: "Registration Successful!",
        description: "Your voiceprint has been saved.",
      });

      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setError('Failed to create voiceprint. Please try again.');
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-4" />
          <CardTitle className="text-2xl font-headline">Create Your Voiceprint</CardTitle>
          <CardDescription>
            Tap to record a short audio clip. This will be your key.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Recorder onRecordingComplete={handleRegister} isProcessing={isLoading} />
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Registration Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
            </p>
        </CardFooter>
      </Card>
    </main>
  );
}
