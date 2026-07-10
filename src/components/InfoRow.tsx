import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';

interface Props {
  label: string;
  value: string;
}

export const InfoRow: React.FC<Props> = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgLight,
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
});
