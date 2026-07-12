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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let data;
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`iNaturalist search failed (${response.status}).`);
      }
      data = await response.json();
    } catch (e: any) {
      if (e.name === 'AbortError') throw new Error('iNaturalist search timed out.');
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }

    const results: iNatTaxon[] = data.results || [];

    if (results.length === 0) return null;

    // Prefer a result that has a preferred common name
    const withCommon = results.find((r) => r.preferred_common_name);
    return withCommon || results[0];
  },
};
