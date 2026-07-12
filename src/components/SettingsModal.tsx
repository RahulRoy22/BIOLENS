import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';
import { ActionButton } from './ActionButton';
import { CacheService } from '../services/cache';
import { CONFIG } from '../constants/config';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  const [token, setToken] = useState('');
  const [model, setModel] = useState('');
  const [saved, setSaved] = useState(false);
  const isProxyMode = !!CONFIG.PROXY_URL;

  useEffect(() => {
    if (visible) {
      (async () => {
        const t = await CacheService.getHFToken();
        const m = await CacheService.getHFModel();
        setToken(t || '');
        setModel(m || '');
        setSaved(false);
      })();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!isProxyMode) {
      await CacheService.saveHFToken(token);
    }
    await CacheService.saveHFModel(model);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>⚙️ Settings</Text>
          {!isProxyMode ? (
            <>
              <Text style={styles.label}>Hugging Face API Token</Text>
              <TextInput
                style={styles.input}
                placeholder="hf_..."
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                secureTextEntry
              />
            </>
          ) : (
            <Text style={styles.proxyNote}>🔗 Using shared proxy — no token needed</Text>
          )}
          <Text style={styles.label}>Model (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="google/vit-base-patch16-224"
            value={model}
            onChangeText={setModel}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Get a free token at huggingface.co/settings/tokens. Use an image
            classification model for best results.
          </Text>
          {saved ? <Text style={styles.saved}>✅ Saved!</Text> : null}
          <View style={styles.actions}>
            <ActionButton title="Cancel" variant="secondary" onPress={onClose} />
            <ActionButton title="Save" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: ROUNDING.xl,
    borderTopRightRadius: ROUNDING.xl,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    padding: SPACING.sm,
    fontSize: 14,
    color: COLORS.textDark,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  proxyNote: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  saved: {
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});
