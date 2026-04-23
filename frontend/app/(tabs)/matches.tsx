import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { matchesApi } from '../../src/api';
import { LiveMatchCard } from '../../src/MatchCard';

type Tab = 'live' | 'upcoming' | 'completed';

export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('live');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const fn = tab === 'live' ? matchesApi.live : tab === 'upcoming' ? matchesApi.upcoming : matchesApi.completed;
        const res = await fn();
        setMatches(res.data.matches);
      } catch (e) { console.log(e); }
      setLoading(false);
    })();
  }, [tab]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.sub}>IPL 2026 · ICC T20 World Cup 2026</Text>
      </View>

      <View style={styles.tabs}>
        {(['live', 'upcoming', 'completed'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
            testID={`matches-tab-${t}`}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
          {matches.length === 0 ? (
            <Text style={styles.empty}>No {tab} matches right now.</Text>
          ) : (
            matches.map(m => <LiveMatchCard key={m.id} match={m} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.headingBlack, fontSize: 28, color: colors.text, letterSpacing: -1 },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.bgSecondary },
  tabActive: { backgroundColor: colors.text },
  tabTxt: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textSecondary },
  tabTxtActive: { color: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xxl },
});
