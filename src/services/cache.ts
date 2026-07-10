import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';
import { OrganismResult } from '../types';

export const CacheService = {
  /**
   * Generates a unique key for the image cache
   */
  getCacheKey(imageFingerprint: string): string {
    return `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${imageFingerprint}`;
  },

  /**
   * Retrieves cached analysis for an image fingerprint if not expired
   */
  async getCachedResult(imageFingerprint: string): Promise<OrganismResult | null> {
    try {
      const key = this.getCacheKey(imageFingerprint);
      const jsonStr = await AsyncStorage.getItem(key);
      if (!jsonStr) return null;

      const cacheData = JSON.parse(jsonStr);
      const now = Date.now();
      
      if (now - cacheData.timestamp > CONFIG.CACHE_TTL_MS) {
        // Expired cache item, clean up asynchronously
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheData.result;
    } catch (e) {
      console.warn('Failed to retrieve cached result:', e);
      return null;
    }
  },

  /**
   * Caches the organism results for an image fingerprint
   */
  async cacheResult(imageFingerprint: string, result: OrganismResult): Promise<void> {
    try {
      const key = this.getCacheKey(imageFingerprint);
      const cacheData = {
        timestamp: Date.now(),
        result,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to cache result:', e);
    }
  },

  /**
   * Saves Hugging Face API Token
   */
  async saveHFToken(token: string): Promise<void> {
    await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.HF_TOKEN, token.trim());
  },

  /**
   * Retrieves Hugging Face API Token
   */
  async getHFToken(): Promise<string | null> {
    return await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.HF_TOKEN);
  },

  /**
   * Saves Hugging Face Model name
   */
  async saveHFModel(model: string): Promise<void> {
    await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.HF_MODEL, model.trim());
  },

  /**
   * Retrieves Hugging Face Model name (falls back to default)
   */
  async getHFModel(): Promise<string> {
    const saved = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.HF_MODEL);
    return saved || CONFIG.DEFAULT_CLASSIFICATION_MODEL;
  },

  /**
   * Clears all cached scan results
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CONFIG.STORAGE_KEYS.CACHE_PREFIX));
      await Promise.all(cacheKeys.map(key => AsyncStorage.removeItem(key)));
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  },
};
