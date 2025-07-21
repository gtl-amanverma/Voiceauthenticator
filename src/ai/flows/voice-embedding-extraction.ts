'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting voice embeddings from audio data.
 *
 * The flow takes an audio buffer as input and returns a vector of floats representing the voice embedding.
 * It uses a pre-trained speaker recognition model (ONNX.js or TensorFlow.js) to extract the embedding.
 *
 * @fileExport {function} getVoiceEmbedding - The main function to extract voice embeddings.
 * @fileExport {type} VoiceEmbeddingInput - The input type for the getVoiceEmbedding function.
 * @fileExport {type} VoiceEmbeddingOutput - The output type for the getVoiceEmbedding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceEmbeddingInputSchema = z.object({
  audioBuffer: z
    .string()
    .describe(
      'The audio buffer as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Ensure data URI format
    ),
});
export type VoiceEmbeddingInput = z.infer<typeof VoiceEmbeddingInputSchema>;

const VoiceEmbeddingOutputSchema = z.object({
  embedding: z.array(z.number()).describe('The voice embedding vector.'),
});
export type VoiceEmbeddingOutput = z.infer<typeof VoiceEmbeddingOutputSchema>;

export async function getVoiceEmbedding(input: VoiceEmbeddingInput): Promise<VoiceEmbeddingOutput> {
  return voiceEmbeddingExtractionFlow(input);
}

const voiceEmbeddingExtractionPrompt = ai.definePrompt({
  name: 'voiceEmbeddingExtractionPrompt',
  input: {schema: VoiceEmbeddingInputSchema},
  output: {schema: VoiceEmbeddingOutputSchema},
  prompt: `You are an AI expert in extracting voice embeddings from audio data.

  Given the audio data, extract a vector representation of the voice.
  The audio data is represented as a data URI.

  Return the voice embedding vector as a JSON array of floats.
  Audio: {{media url=audioBuffer}}`,
});

const voiceEmbeddingExtractionFlow = ai.defineFlow(
  {
    name: 'voiceEmbeddingExtractionFlow',
    inputSchema: VoiceEmbeddingInputSchema,
    outputSchema: VoiceEmbeddingOutputSchema,
  },
  async input => {
    const {output} = await voiceEmbeddingExtractionPrompt(input);
    return output!;
  }
);
