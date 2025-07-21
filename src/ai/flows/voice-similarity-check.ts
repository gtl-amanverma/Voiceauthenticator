// src/ai/flows/voice-similarity-check.ts
'use server';

/**
 * @fileOverview Checks the similarity between two voice embeddings.
 *
 * - voiceSimilarityCheck - A function that compares two voice embeddings and returns a similarity score.
 * - VoiceSimilarityCheckInput - The input type for the voiceSimilarityCheck function.
 * - VoiceSimilarityCheckOutput - The return type for the voiceSimilarityCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceSimilarityCheckInputSchema = z.object({
  recordedVoiceEmbedding: z.array(z.number()).describe('The voice embedding extracted from the recorded voice.'),
  storedVoiceEmbedding: z.array(z.number()).describe('The voice embedding stored in local storage.'),
});

export type VoiceSimilarityCheckInput = z.infer<typeof VoiceSimilarityCheckInputSchema>;

const VoiceSimilarityCheckOutputSchema = z.object({
  similarityScore: z.number().describe('The cosine similarity score between the two voice embeddings.'),
  isAuthenticated: z.boolean().describe('Whether the user is authenticated based on the similarity score.'),
});

export type VoiceSimilarityCheckOutput = z.infer<typeof VoiceSimilarityCheckOutputSchema>;

export async function voiceSimilarityCheck(input: VoiceSimilarityCheckInput): Promise<VoiceSimilarityCheckOutput> {
  return voiceSimilarityCheckFlow(input);
}

const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Handle zero vectors
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

const voiceSimilarityCheckFlow = ai.defineFlow({
    name: 'voiceSimilarityCheckFlow',
    inputSchema: VoiceSimilarityCheckInputSchema,
    outputSchema: VoiceSimilarityCheckOutputSchema,
  },
  async input => {
    const similarityScore = cosineSimilarity(input.recordedVoiceEmbedding, input.storedVoiceEmbedding);
    const isAuthenticated = similarityScore > 0.85;

    return {
      similarityScore,
      isAuthenticated,
    };
  }
);
