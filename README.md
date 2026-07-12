# BioLens App

**[Live Web Demo](https://RahulRoy22.github.io/BIOLENS)**

A mobile app for identifying plants and organisms in the wild. It analyzes photos using AI and enriches the results with data from biodiversity APIs.

## Technical Architecture

**Framework**: Expo with React Native
**Language**: TypeScript
**Build System**: ESLint, TypeScript compiler (noEmit)

### Core Services

**IdentificationService** (src/services/identification.ts)
- Sends photos to Hugging Face Inference API
- Uses `google/vit-base-patch16-224` (ImageNet-trained) by default
- Handles both classification models and text-generation VQA models
- Parses scientific names from classification labels
- Returns common name, scientific name, and confidence score

**PipelineService** (src/services/pipeline.ts)
- Orchestrates the full identification + enrichment workflow
- Step 1: Hugging Face identification → candidate name
- Step 2: iNaturalist lookup → common name, conservation status, photo, wiki link
- Step 3: GBIF enrichment → taxonomy, descriptions, vernacular names
- Caching by image fingerprint

**INaturalistService** (src/services/inaturalist.ts)
- Query: `/taxa?q={name}&limit=10`
- Returns preferred_common_name, conservation status, photos, observations count

**GBIFService** (src/services/gbif.ts)
- Search species: `/species?name={query}&limit=20`
- Get descriptions: `/species/{key}/descriptions?limit=30`
- Get vernacular names: `/species/{key}/vernacularNames?limit=50`

**CacheService** (src/services/cache.ts)
- Caches results in device storage using image fingerprint keys
- 1-week TTL for cached results
- Stores Hugging Face tokens and model preferences

**Static Constants** (src/constants/config.ts)
- API base URLs for HF, GBIF, iNaturalist
- Storage key prefixes (`@BioLens:*`)
- Default classification model name
- 10MB max image size limit

**Theming** (src/constants/theme.ts)
- Color palette following Tailwind-inspired design system
- Spacing: xs(4), sm(8), md(16), lg(24), xl(32)
- Border radius: sm(4), md(8), lg(12), xl(16), full(9999)

**Components** (src/components/)
- `ActionButton`: Main CTAs, primary/secondary variants
- `ErrorCard`: Display errors with suggestions
- `LoadingOverlay`: Full-screen loading state
- `SettingsModal`: Manage Hugging Face API token/model
- `SpeciesCard`: Display identified organism result
- `InfoRow`: Generic key-value display in results

**Screens** (src/screens/)
- `HomeScreen`: Upload/take photo, shows preview, handling identification
- `ResultsScreen`: Display enriched organism information

## File Structure

```
BioLensApp/
├── src/
│   ├── components/           # Reusable UI components
│   ├── constants/            # Theme & config
│   ├── screens/              # Navigation routes
│   ├── services/             # API integrations
│   └── types/                # TypeScript interfaces
├── App.tsx                   # Root React entry point
├── app.config.js             # Dynamic Expo project config
├── vercel.json               # Vercel deployment config
├── fix-paths.js              # GitHub pages post-export script
├── package.json              # Dependencies & scripts
└── tsconfig.json             # TypeScript config
```

## Key Features

1. **AI-Powered Identification**
   - Real-time image upload for plant/organism identification
   - Accurate confidence scoring from Hugging Face
   - Fallback for poor-quality photos
   - Multiple model providers supported

2. **Rich Biodiversity Data**
   - Common names from iNaturalist
   - Scientific names from GBIF
   - Conservation status and IUCN categories
   - High-resolution photos from iNaturalist
   - Wikipedia links and descriptions
   - Observations count from both sources

3. **Performance & Offline Usage**
   - Intelligent 1-week caching of results
   - Fingerprint-based deduplication
   - Local storage for API credentials
   - Graceful error handling

4. **User Experience**
   - Clean camera/gallery picker interface
   - Loading overlays and error handling
   - Responsive design with Material 3 colors
   - Settings modal for API tokens

## API Integration

**Hugging Face Inference API**
- Endpoint: `POST https://api-inference.huggingface.co/models/{model}`
- Auth: Bearer token authentication
- Request: Raw image blob
- Response: Class scores or generated caption

**iNaturalist API**
- Species search: `/taxa?q=query&limit=10`
- Preferred common name in results
- Conservation status, photos, Wikipedia links

**GBIF API**
- Species search: `/species?name=query&limit=20`
- Taxonomy hierarchy (kingdom to species)
- Multiple descriptions and vernacular names

## Configuration

1. **Get Hugging Face Token**
   - Sign up at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Free tier provides sufficient daily limits

2. **Add Token in App**
   - Open the app and tap ⚙️ (settings icon)
   - Enter your Hugging Face API token
   - Optionally specify a different model

3. **Model Selection**
   - Default: `google/vit-base-patch16-224`
   - Works with any ImageNet-style classification model
   - VQA models also supported if user specifies

## Web Deployment

The web frontend is designed to be fully compatible with both GitHub Pages and Vercel.

**GitHub Pages**:
Run `npm run deploy`. This uses the `fix-paths.js` script to properly route assets without double-prefixing and generates a `.nojekyll` file so GitHub serves the Expo output correctly.

**Vercel**:
Vercel is supported natively. The `app.config.js` file detects the `VERCEL` environment variable and dynamically removes the `assetPrefix`, while `vercel.json` ensures that Single Page App routing works correctly without strict MIME type conflicts.

## Running the App

```bash
# Start development server
npm start

# Test on Android (requires SDK setup)
npm run android

# Test on iOS (requires XCode)
npm run ios

# Test in web browser
npm run web
```

**Note**: Web mode requires additional dependencies (`react-dom`, `react-native-web`) installed.

## Dependencies

- `@react-native-async-storage/async-storage` - Local storage
- `expo-image-picker` - Camera/gallery access
- `react-native` - UI framework
- `@react-native-async-storage/async-storage` - Persistent state management
- Expo core packages (status bar, safe area view, modal, etc.)

## Token Handling

The app uses `AsyncStorage` to securely store:
- Hugging Face API tokens
- Preferred model names
- Cache results by image fingerprint

Tokens are never exposed in code or logs.

## Error Handling

The app handles various error scenarios:
- Missing camera permissions
- Invalid file types (>10MB, unsupported formats)
- Invalid API tokens
- Network failures
- Low confidence results
- API lookup failures

Each error provides user-friendly messages and actionable suggestions.

## Development Notes

- TypeScript strict mode enabled
- Components are designed to be reusable
- CSS-like styling via StyleSheet
- Error boundaries should be added at root level
- Analytics and crash reporting could be integrated
- Voice search and text query features could be added
- Batch comparison and history features could be implemented

## Next Steps

- Add infinite scroll for browsing more observations
- Implement user authentication
- Add sharing features
- Create onboarding/tutorial for new users
- Add region-specific filters
- Implement AI-powered naming suggestions
- Add photo comparison between two specimens
- Store and visualize user's observation history
- Add export functionality for data
- Create admin dashboard for content moderation
- Integrate with additional biodiversity databases
- Add barcode/QR code reader for species tracking
- Implement offline mode for degraded connectivity
- Add customization options (color themes, UI density)
