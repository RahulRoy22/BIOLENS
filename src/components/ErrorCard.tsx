import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';

interface Props {
  message: string;
  suggestion?: string;
}

export const ErrorCard: React.FC<Props> = ({ message, suggestion }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Identification Failed</Text>
      <Text style={styles.message}>{message}</Text>
      {suggestion ? (
        <Text style={styles.suggestion}>💡 {suggestion}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
  },
  title: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  message: {
    color: COLORS.error,
    fontSize: 13,
    opacity: 0.9,
  },
  suggestion: {
    color: COLORS.error,
    fontSize: 12,
    opacity: 0.8,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});
