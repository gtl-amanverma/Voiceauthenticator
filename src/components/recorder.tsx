'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type RecorderProps = {
  onRecordingComplete: (dataUri: string) => void;
  recordingSeconds?: number;
  isProcessing?: boolean;
};

export function Recorder({
  onRecordingComplete,
  recordingSeconds = 5,
  isProcessing = false,
}: RecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setHasPermission(false);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to use this feature.",
      });
    }
  }, [toast]);

  useEffect(() => {
    requestPermission();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [requestPermission]);

  const startRecording = () => {
    if (!streamRef.current || isRecording) return;
    
    setIsRecording(true);
    setProgress(0);
    audioChunksRef.current = [];
    
    const options = { mimeType: 'audio/webm' };
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        onRecordingComplete(reader.result as string);
      };
      reader.readAsDataURL(audioBlob);
      setIsRecording(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(0);
    };

    mediaRecorderRef.current.start();
    
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 100 / recordingSeconds;
        if (nextProgress >= 100) {
          stopRecording();
          return 100;
        }
        return nextProgress;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Requesting microphone permission...</p>
      </div>
    );
  }
  
  if (hasPermission === false) {
    return (
       <div className="flex flex-col items-center gap-4 text-center">
        <MicOff className="h-10 w-10 text-destructive" />
        <p className="text-destructive-foreground font-semibold">Microphone access is required.</p>
        <p className="text-sm text-muted-foreground">Please grant permission and refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <Button
        onClick={handleButtonClick}
        disabled={isProcessing}
        size="icon"
        className={`h-24 w-24 rounded-full transition-all duration-300 ${isRecording ? 'bg-destructive hover:bg-destructive/90 scale-110' : 'bg-primary'}`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isProcessing ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <Mic className="h-10 w-10" />
        )}
      </Button>

      <div className="w-full max-w-xs">
        <p className="text-center text-sm text-muted-foreground mb-2">
          {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : `Tap to record for ${recordingSeconds} seconds`}
        </p>
        {(isRecording || isProcessing) && <Progress value={isProcessing ? 100 : progress} className="h-2" />}
      </div>
    </div>
  );
}
