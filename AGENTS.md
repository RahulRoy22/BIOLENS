# BioLensApp — Agent Context

## Project
Expo React Native app (TypeScript) for identifying plants/organisms from photos using Hugging Face AI + iNaturalist + GBIF.

## Key files
- `App.tsx` — root component, navigation, token check
- `src/screens/HomeScreen.tsx` — photo capture/upload + identify flow
- `src/services/identification.ts` — HF Inference API call (supports proxy mode)
- `src/services/pipeline.ts` — orchestrates HF -> iNaturalist -> GBIF
- `src/services/cache.ts` — AsyncStorage wrapper (token, model, results cache)
- `src/components/SettingsModal.tsx` — HF token & model config UI
- `src/constants/config.ts` — API URLs, storage keys, PROXY_URL toggle
- `biolens-proxy/server.js` — backend proxy for centralized HF token

## Proxy mode
- `PROXY_URL: ''` in config.ts = direct mode (user enters own HF token)
- `PROXY_URL: 'https://your-proxy.com'` = shared mode (server injects token)
- In proxy mode, Authorization header is omitted client-side; proxy adds it

## Scripts
- `npm run web` — start web app (opens at localhost:8081)
- `npm start` — start Expo dev server
- `npm run android` — run on Android emulator/device
- `npx tsc --noEmit` — type check

## Build
- `npx eas build --platform android` — Android APK via EAS Build
- `npx eas build --platform web` — web export

## Dependencies
- Expo SDK 54, React Native 0.81.5, React 19.1.0
- react-native-web (web support), expo-image-picker, expo-file-system, AsyncStorage

## Architecture
- No backend — pure client-side app calling 3rd-party APIs directly or through proxy
- HF API: POST base64 image -> returns labels with confidence scores
- iNaturalist: resolves common names, conservation status, photos, Wikipedia links
- GBIF: fetches taxonomic hierarchy and descriptions
- Results cached in AsyncStorage (1 week TTL, keyed by image URI)
