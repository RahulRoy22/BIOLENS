import { CONFIG } from '../constants/config';
import { CacheService } from './cache';
import { IdentificationService } from './identification';
import { GBIFService } from './gbif';
import { INaturalistService } from './inaturalist';
import { OrganismResult } from '../types';

/**
 * Orchestrates the full identification + enrichment pipeline:
 *   1. Hugging Face vision model -> candidate name
 *   2. iNaturalist -> common name, conservation status, photo, wiki
 *   3. GBIF -> taxonomy, descriptions, vernacular names
 * Results are cached by image fingerprint.
 */
export const PipelineService = {
  /**
   * Runs the identification and enrichment pipeline.
   * @param fileUri local image URI
   * @param fingerprint stable prefix hash of the image for caching
   * @param token Hugging Face token
   */
  async run(
    fileUri: string,
    fingerprint: string,
    token: string,
    onStatus?: (status: string) => void
  ): Promise<OrganismResult> {
    // 1. Check cache
    onStatus?.('Checking cache...');
    const cached = await CacheService.getCachedResult(fingerprint);
    if (cached) return cached;

    // 2. Identify using HF vision model
    onStatus?.('Running AI vision model (may take 10-30s on first call)...');
    const identification = await IdentificationService.identify(fileUri, token);

    // 3. Resolve via iNaturalist (best at common names + media)
    onStatus?.('Looking up iNaturalist data...');
    let iNat: any = null;
    try {
      iNat = await INaturalistService.searchTaxon(
        identification.scientificName || identification.commonName
      );
    } catch (e) {
      console.warn('iNaturalist lookup failed:', e);
    }

    const commonName =
      iNat?.preferred_common_name || identification.commonName || 'Unknown organism';
    const scientificNameGuess =
      iNat && (iNat as any).name ? (iNat as any).name : identification.scientificName;

    // 4. Enrich via GBIF
    onStatus?.('Fetching taxonomy from GBIF...');
    let taxonomy = null;
    let descriptions: any[] = [];
    try {
      taxonomy = await GBIFService.searchSpecies(scientificNameGuess || commonName);
      if (taxonomy) {
        descriptions = await GBIFService.getDescriptions(taxonomy.key);
      }
    } catch (e) {
      console.warn('GBIF lookup failed:', e);
    }

    const result: OrganismResult = {
      identification: {
        commonName,
        scientificName: taxonomy?.scientificName || scientificNameGuess || '',
        confidence: identification.confidence,
      },
      taxonomy,
      descriptions,
      conservationStatus:
        iNat?.conservation_status?.status_name ||
        iNat?.conservation_status?.status ||
        null,
      wikipediaUrl: iNat?.wikipedia_url || null,
      photoUrl: iNat?.default_photo?.medium_url || null,
      observationsCount: typeof iNat?.observations_count === 'number' ? iNat.observations_count : null,
    };

    // 5. Cache the result
    onStatus?.('Saving result...');
    await CacheService.cacheResult(fingerprint, result);
    return result;
  },
};
