import { CONFIG } from '../constants/config';
import { GBIFSpecies, GBIFDescription } from '../types';

/**
 * Wrapper around the GBIF species API for taxonomy, descriptions, and vernacular names.
 */
export const GBIFService = {
  /**
   * Searches GBIF for a species by scientific or common name and returns the
   * first accepted/accepted-ranked match.
   */
  async searchSpecies(query: string): Promise<GBIFSpecies | null> {
    const url = `${CONFIG.GBIF_API_BASE_URL}/species?name=${encodeURIComponent(
      query
    )}&limit=20`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let data;
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`GBIF search failed (${response.status}).`);
      }
      data = await response.json();
    } catch (e: any) {
      if (e.name === 'AbortError') throw new Error('GBIF search timed out.');
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }

    const results: GBIFSpecies[] = data.results || [];

    if (results.length === 0) return null;

    // Prefer accepted taxon, otherwise take the first result
    const accepted =
      results.find((r) => r.taxonomicStatus === 'ACCEPTED') || results[0];

    return accepted;
  },

  /**
   * Fetches descriptive text (habitat, ecology, biology) for a taxon key.
   */
  async getDescriptions(taxonKey: number): Promise<GBIFDescription[]> {
    const url = `${CONFIG.GBIF_API_BASE_URL}/species/${taxonKey}/descriptions?limit=30`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return [];

      const data = await response.json();
      const results: GBIFDescription[] = data.results || [];
      return results.filter((d) => d.description && d.description.length > 0);
    } catch (e) {
      return []; // Safe fallback on timeout or JSON error
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Fetches vernacular (common) names for a taxon key.
   */
  async getVernacularNames(taxonKey: number): Promise<{ vernacularName: string; language?: string }[]> {
    const url = `${CONFIG.GBIF_API_BASE_URL}/species/${taxonKey}/vernacularNames?limit=50`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return [];

      const data = await response.json();
      return data.results || [];
    } catch (e) {
      return []; // Safe fallback on timeout or JSON error
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
