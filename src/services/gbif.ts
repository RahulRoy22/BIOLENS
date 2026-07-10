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

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GBIF search failed (${response.status}).`);
    }

    const data = await response.json();
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
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    const results: GBIFDescription[] = data.results || [];
    return results.filter((d) => d.description && d.description.length > 0);
  },

  /**
   * Fetches vernacular (common) names for a taxon key.
   */
  async getVernacularNames(taxonKey: number): Promise<{ vernacularName: string; language?: string }[]> {
    const url = `${CONFIG.GBIF_API_BASE_URL}/species/${taxonKey}/vernacularNames?limit=50`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    return data.results || [];
  },
};
