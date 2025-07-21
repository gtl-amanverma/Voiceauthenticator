'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function DashboardPage() {
  const router = useRouter();
  const [embeddingPreview, setEmbeddingPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const storedEmbedding = localStorage.getItem('voiceEmbedding');
    if (storedEmbedding) {
      try {
        const parsedEmbedding = JSON.parse(storedEmbedding);
        setEmbeddingPreview(parsedEmbedding.slice(0, 5).join(', ') + '...');
      } catch (error) {
        console.error("Failed to parse voice embedding", error);
        setEmbeddingPreview("Error loading preview");
      }
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('voiceEmbedding');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 w-full border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto flex flex-col items-center p-4 py-10 text-center">
        <ShieldCheck className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold font-headline mb-2">Authentication Successful</h1>
        <p className="text-lg text-muted-foreground mb-8">Welcome to your VoiceKey Dashboard.</p>
        
        <Card className="w-full max-w-lg text-left">
          <CardHeader>
            <CardTitle>Your Voiceprint</CardTitle>
            <CardDescription>
              This is a small sample of your stored voice embedding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-secondary p-4 font-mono text-sm text-secondary-foreground break-all">
              {embeddingPreview || 'No embedding found.'}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
