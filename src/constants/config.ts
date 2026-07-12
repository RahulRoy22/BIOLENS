export const CONFIG = {
  // The old api-inference.huggingface.co endpoint was deprecated in 2025.
  // Inference Providers now route through the router endpoint.
  HF_API_BASE_URL: 'https://router.huggingface.co/hf-inference/models',
  // Biology-specialized model trained on iNaturalist data (plants & animals).
  DEFAULT_CLASSIFICATION_MODEL: 'microsoft/resnet-50',

  GBIF_API_BASE_URL: 'https://api.gbif.org/v1',
  INAT_API_BASE_URL: 'https://api.inaturalist.org/v1',

  // Storage Keys
  STORAGE_KEYS: {
    HF_TOKEN: '@BioLens:hf_token',
    HF_MODEL: '@BioLens:hf_model',
    CACHE_PREFIX: '@BioLens:cache_',
  },

  // Timeouts and TTLs
  CACHE_TTL_MS: 1000 * 60 * 60 * 24 * 7, // 1 week

  // Proxy mode: set this to your backend URL to skip manual HF token entry.
  // Leave empty ("") for direct HF API calls with user-entered tokens.
  // Example: 'https://biolens-proxy.onrender.com'
  PROXY_URL: 'https://biolens-ip2t.onrender.com',
};
