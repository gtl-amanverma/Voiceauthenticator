'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVoiceEmbedding } from '@/ai/flows/voice-embedding-extraction';
import { voiceSimilarityCheck } from '@/ai/flows/voice-similarity-check';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Recorder } from '@/components/recorder';
import { Logo } from '@/components/logo';
import { Terminal } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [hasStoredEmbedding, setHasStoredEmbedding] = useState(false);

  useEffect(() => {
    const storedEmbedding = localStorage.getItem('voiceEmbedding');
    if (storedEmbedding) {
      setHasStoredEmbedding(true);
    } else {
        // Redirect to register if no voiceprint is found
        router.replace('/register');
    }
  }, [router]);

  const handleLogin = async (audioDataUri: string) => {
    setIsLoading(true);
    setError(null);
    setSimilarityScore(null);

    const storedEmbeddingStr = localStorage.getItem('voiceEmbedding');
    if (!storedEmbeddingStr) {
      setError('No voiceprint found. Please register first.');
      setIsLoading(false);
      return;
    }

    try {
      const storedVoiceEmbedding = JSON.parse(storedEmbeddingStr);
      
      const { embedding: recordedVoiceEmbedding } = await getVoiceEmbedding({ audioBuffer: audioDataUri });

      const { isAuthenticated, similarityScore } = await voiceSimilarityCheck({
        recordedVoiceEmbedding,
        storedVoiceEmbedding,
      });

      setSimilarityScore(similarityScore);

      if (isAuthenticated) {
        localStorage.setItem('isAuthenticated', 'true');
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        router.push('/dashboard');
      } else {
        setError('Voice not recognized. Please try again.');
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Your voice did not match.",
        });
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!hasStoredEmbedding) {
    return null; // or a loading spinner while checking for embedding
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-4" />
          <CardTitle className="text-2xl font-headline">Voice Authentication</CardTitle>
          <CardDescription>Tap the microphone and speak to log in.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Recorder onRecordingComplete={handleLogin} isProcessing={isLoading} />
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {similarityScore !== null && (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Authentication Attempt</AlertTitle>
                <AlertDescription>
                  Similarity Score: <span className="font-bold">{ (similarityScore * 100).toFixed(2) }%</span>
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
                No account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
            </p>
        </CardFooter>
      </Card>
    </main>
  );
}
