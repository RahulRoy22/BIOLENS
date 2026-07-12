import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from './src/constants/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsModal } from './src/components/SettingsModal';
import { CONFIG } from './src/constants/config';
import { CacheService } from './src/services/cache';
import { OrganismResult } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'results'>('home');
  const [result, setResult] = useState<OrganismResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const token = await CacheService.getHFToken();
      setHasToken(!!token || !!CONFIG.PROXY_URL);
    })();
  }, []);

  const handleSettingsClose = async () => {
    setSettingsOpen(false);
    const token = await CacheService.getHFToken();
    setHasToken(!!token || !!CONFIG.PROXY_URL);
  };

  const handleResult = (res: OrganismResult, _uri: string) => {
    setResult(res);
    setScreen('results');
  };

  const handleScanAnother = () => {
    setResult(null);
    setScreen('home');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌱 BioLens</Text>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={() => setSettingsOpen(true)}
          >
            <Text style={styles.gear}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {screen === 'home' ? (
            <HomeScreen onResult={handleResult} hasToken={hasToken} />
          ) : result ? (
            <ResultsScreen result={result} onScanAnother={handleScanAnother} />
          ) : null}
        </View>

        <SettingsModal visible={settingsOpen} onClose={handleSettingsClose} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  gearBtn: {
    padding: 4,
  },
  gear: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
});
