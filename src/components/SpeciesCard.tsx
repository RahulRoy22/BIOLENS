import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';
import { OrganismResult } from '../types';
import { InfoRow } from './InfoRow';

interface Props {
  result: OrganismResult;
}

export const SpeciesCard: React.FC<Props> = ({ result }) => {
  const { identification, taxonomy, descriptions, conservationStatus, photoUrl, wikipediaUrl, observationsCount } = result;
  const [photoError, setPhotoError] = useState(false);

  const taxonomyHierarchy = [
    taxonomy?.kingdom,
    taxonomy?.phylum,
    taxonomy?.class,
    taxonomy?.order,
    taxonomy?.family,
    taxonomy?.genus,
    taxonomy?.species,
  ].filter(Boolean) as string[];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badge}>Classification Confirmed</Text>
        <Text style={styles.commonName}>{identification.commonName}</Text>
        {identification.scientificName ? (
          <Text style={styles.scientificName}>
            {identification.scientificName}
          </Text>
        ) : null}
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={styles.confidenceValue}>
            {(identification.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {photoUrl && !photoError ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.photo}
          resizeMode="cover"
          onError={() => setPhotoError(true)}
        />
      ) : null}

      <View style={styles.body}>
        {/* Taxonomy */}
        {taxonomyHierarchy.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Taxonomic Hierarchy</Text>
            {taxonomyHierarchy.map((t, i) => (
              <View key={i} style={styles.taxonomyRow}>
                <Text style={styles.taxonomyLevel}>
                  {['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'][i]}
                </Text>
                <Text style={styles.taxonomyValue}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Conservation */}
        {conservationStatus ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conservation Status</Text>
            <Text style={styles.bodyText}>{conservationStatus}</Text>
          </View>
        ) : null}

        {/* Descriptions */}
        {descriptions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habitat & Ecology</Text>
            {descriptions.slice(0, 4).map((d, i) => (
              <View key={i} style={styles.descBlock}>
                {d.type ? (
                  <Text style={styles.descType}>{d.type.replace(/_/g, ' ')}</Text>
                ) : null}
                <Text style={styles.bodyText}>{d.description}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Quick Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Facts</Text>
          <View style={styles.grid}>
            <InfoRow
              label="Observations"
              value={observationsCount !== null && observationsCount !== undefined ? observationsCount.toLocaleString() : 'Unknown'}
            />
            {taxonomy?.vernacularName ? (
              <InfoRow label="Common Alias" value={taxonomy.vernacularName} />
            ) : null}
            {wikipediaUrl ? (
              <InfoRow label="Reference" value="Wikipedia Article" />
            ) : null}
          </View>
          {wikipediaUrl ? (
            <Text
              style={styles.link}
              onPress={() => {
                try {
                  Linking.openURL(wikipediaUrl);
                } catch (_e) {
                  console.warn('Failed to open Wikipedia URL');
                }
              }}
            >
              Open Wikipedia Article ↗
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: ROUNDING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryBorder,
    padding: SPACING.md,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  commonName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: ROUNDING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  confidenceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.bgLight,
  },
  body: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  taxonomyRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  taxonomyLevel: {
    width: 80,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  taxonomyValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  descBlock: {
    marginBottom: SPACING.sm,
  },
  descType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  link: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
