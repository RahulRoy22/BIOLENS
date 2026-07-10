import { CONFIG } from '../constants/config';
import { iNatTaxon } from '../types';

/**
 * Wrapper around the iNaturalist taxa API. Used to resolve common names,
 * conservation status, Wikipedia links, and photos from a query string.
 */
export const INaturalistService = {
  /**
   * Searches iNaturalist taxa by a name query (common or scientific).
   * Returns the most relevant taxon record.
   */
  async searchTaxon(query: string): Promise<iNatTaxon | null> {
    const url = `${CONFIG.INAT_API_BASE_URL}/taxa?q=${encodeURIComponent(
      query
    )}&limit=10`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`iNaturalist search failed (${response.status}).`);
    }

    const data = await response.json();
    const results: iNatTaxon[] = data.results || [];

    if (results.length === 0) return null;

    // Prefer a result that has a preferred common name
    const withCommon = results.find((r) => r.preferred_common_name);
    return withCommon || results[0];
  },
};
