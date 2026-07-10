import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { SpeciesCard } from '../components/SpeciesCard';
import { ActionButton } from '../components/ActionButton';
import { OrganismResult } from '../types';

interface Props {
  result: OrganismResult;
  onScanAnother: () => void;
}

export const ResultsScreen: React.FC<Props> = ({ result, onScanAnother }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Identified Organism</Text>
      <SpeciesCard result={result} />
      <View style={styles.actions}>
        <ActionButton title="Scan Another" onPress={onScanAnother} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  actions: {
    marginTop: SPACING.md,
  },
});
