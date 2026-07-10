import { CONFIG } from '../constants/config';
import { CacheService } from './cache';
import { IdentificationResult } from '../types';
import { readAsStringAsync } from 'expo-file-system/legacy';

/**
 * Sends the local image to the Hugging Face Inference API
 * using an image-classification model and returns parsed identification.
 */
export const IdentificationService = {
  /**
   * Identifies the organism in the photo using Hugging Face Inference API.
   * @param fileUri local file:// URI of the image
   * @param token Hugging Face API token
   * @param model optional model override
   */
  async identify(
    fileUri: string,
    token: string,
    model?: string
  ): Promise<IdentificationResult> {
    const modelName = model || (await CacheService.getHFModel());

    // Read the image as base64 (legacy API handles file:// and content://)
    const base64 = await readAsStringAsync(fileUri, { encoding: 'base64' });

    // HF Inference Providers API expects base64 in a JSON payload.
    // Endpoint: https://router.huggingface.co/hf-inference/models/{model}
    const response = await fetch(
      `${CONFIG.HF_API_BASE_URL}/${modelName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: base64 }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Vision server error (${response.status}). ${
          errorText || 'The model may be loading or your token may be invalid.'
        }`
      );
    }

    const data = await response.json();

    // Hugging Face image-classification returns an array of { label, score }
    if (Array.isArray(data) && data.length > 0 && data[0]?.label) {
      const top = data[0];
      const confidence = typeof top.score === 'number' ? top.score : 0;

      if (confidence < 0.1) {
        throw new Error(
          'Low confidence result. The specimen could not be clearly recognized. Please try a closer, well-lit photo.'
        );
      }

      const { commonName, scientificName } = parseLabel(top.label);

      return {
        commonName: commonName || top.label,
        scientificName: scientificName || '',
        confidence,
      };
    }

    // Text / VQA models (e.g. BLIP-2) return a string or { generated_text }
    const text =
      typeof data === 'string'
        ? data
        : (data as any)?.generated_text || (data as any)?.[0]?.generated_text || '';

    if (!text.trim()) {
      throw new Error('No identification returned from the vision model.');
    }

    // Extract a likely organism name from the generated caption
    const guess = extractNounPhrase(text);
    return {
      commonName: guess || text.trim(),
      scientificName: '',
      confidence: 0.6,
    };
  },
};

/**
 * Parses a Hugging Face classification label into common and scientific names.
 * Labels often look like "monarch, monarch butterfly, Danaus plexippus"
 * or "golden retriever" or "daisy".
 */
function parseLabel(label: string): { commonName: string; scientificName: string } {
  if (!label) return { commonName: '', scientificName: '' };

  // Split on commas and parentheses
  const parts = label
    .split(/[,(]/)
    .map((p) => p.replace(/[)]/g, '').trim())
    .filter(Boolean);

  if (parts.length === 0) return { commonName: label, scientificName: '' };

  // Scientific names are usually binomial or trinomial (latin words)
  const sciCandidate = parts.find((p) => /^[A-Z][a-z]+(?: [a-z]+)+$/.test(p));
  const scientificName = sciCandidate || '';

  const commonParts = parts.filter((p) => p !== scientificName);
  const commonName = commonParts[0] || parts[0] || label;

  return { commonName, scientificName };
}

/**
 * Best-effort extraction of an organism name from a generated caption.
 * Takes the leading noun phrase before common stopwords.
 */
function extractNounPhrase(text: string): string {
  const cleaned = text.replace(/^a |^an |^the /i, '').trim();
  const stopAt = cleaned.search(/\b(on|in|with|near|sitting|resting|that|which|is|are)\b/i);
  const phrase = stopAt > 0 ? cleaned.slice(0, stopAt) : cleaned;
  return phrase.replace(/[.!?,;]$/, '').trim();
}
