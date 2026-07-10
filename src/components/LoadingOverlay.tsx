import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';

interface Props {
  message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({
  message = 'Analyzing cellular structure & data models...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  message: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
