import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';
import { ActionButton } from '../components/ActionButton';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorCard } from '../components/ErrorCard';
import { CONFIG } from '../constants/config';
import { CacheService } from '../services/cache';
import { PipelineService } from '../services/pipeline';
import { OrganismResult } from '../types';

interface Props {
  onResult: (result: OrganismResult, uri: string) => void;
  hasToken: boolean | null;
}

export const HomeScreen: React.FC<Props> = ({ onResult, hasToken }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<{ message: string; suggestion?: string } | null>(null);

  const pickImage = async (useCamera: boolean) => {
    setError(null);
    let result: ImagePicker.ImagePickerResult;

    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        setError({
          message: 'Camera permission is required to take a photo.',
          suggestion: 'Please enable camera access in your device settings.',
        });
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: false,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: false,
      });
    }

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];

    // Validate file type using mimeType instead of URI extension (which fails on mobile content:// URIs)
    if (asset.mimeType && !asset.mimeType.startsWith('image/')) {
      Alert.alert(
        'Invalid file type',
        'Please upload a clear JPG, PNG, or WebP photo.'
      );
      return;
    }

    // Validate file size
    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
      Alert.alert(
        'Image is too large',
        'Please use an image smaller than 10MB.'
      );
      return;
    }

    setImageUri(asset.uri);
  };

  const handleIdentify = async () => {
    if (!imageUri) return;

    const token = await CacheService.getHFToken();
    if (!token && !CONFIG.PROXY_URL) {
      setError({
        message: 'No API token configured.',
        suggestion: 'Add your free Hugging Face API token in settings to enable identification.',
      });
      return;
    }

    setLoading(true);
    setLoadingMessage('Analyzing image...');
    setError(null);

    try {
      // Use the URI itself as the cache key (same gallery image = same URI)
      const fingerprint = imageUri;
      const result = await PipelineService.run(imageUri, fingerprint, token ?? '', setLoadingMessage);
      onResult(result, imageUri);
    } catch (e: any) {
      console.warn('Identification failed:', e);
      setError({
        message: e?.message || 'Network issue encountered during analysis. Please try again.',
        suggestion: 'Try a clearer, well-lit photo of the organism.',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setError(null);
  };

  if (hasToken === false) {
    return (
      <View style={styles.container}>
        <View style={styles.tokenBanner}>
          <Text style={styles.tokenTitle}>🔑 API Setup Required</Text>
          <Text style={styles.tokenText}>
            Paste your free Hugging Face API token to enable AI identification. Get one at
            huggingface.co/settings/tokens.
          </Text>
          <ActionButton
            title="Open Settings"
            onPress={() => Alert.alert('Settings', 'Use the gear icon in the header to add your token.')}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!imageUri ? (
        <View style={styles.uploadZone}>
          <TouchableOpacity
            style={styles.uploadCard}
            activeOpacity={0.8}
            onPress={() => pickImage(false)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📸</Text>
            </View>
            <Text style={styles.uploadTitle}>Take a photo or upload</Text>
            <Text style={styles.uploadSubtitle}>Supports JPEG, PNG, WebP</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <ActionButton
              title="Camera"
              variant="primary"
              onPress={() => pickImage(true)}
              subtitle="Capture"
            />
            <ActionButton
              title="Gallery"
              variant="secondary"
              onPress={() => pickImage(false)}
              subtitle="Upload"
            />
          </View>
        </View>
      ) : (
        <View style={styles.previewZone}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity style={styles.closeBtn} onPress={reset}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <LoadingOverlay message={loadingMessage} />
          ) : (
            <ActionButton title="Scan Specimen" onPress={handleIdentify} />
          )}

          {error ? (
            <ErrorCard message={error.message} suggestion={error.suggestion} />
          ) : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  uploadZone: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: ROUNDING.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: ROUNDING.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 30,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  previewZone: {
    flex: 1,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: ROUNDING.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 4 / 3,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: ROUNDING.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
  },
  tokenBanner: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
  },
  tokenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentDark,
    marginBottom: SPACING.xs,
  },
  tokenText: {
    fontSize: 13,
    color: COLORS.accentDark,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
});
