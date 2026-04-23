import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { miscApi } from '../../src/api';
import { useAuth } from '../../src/auth';
import { LiveMatchCard } from '../../src/MatchCard';
import { SectionHeader } from '../../src/Common';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [feed, setFeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await miscApi.homeFeed();
      setFeed(res.data);
    } catch (e) {
      console.log('home feed error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // poll every 15s for "live" feel
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      testID="home-screen">

      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greet}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome'}</Text>
          <Text style={styles.appTitle}>CricLive</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/notifications')} testID="bell-btn">
          <Ionicons name="notifications-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Image source={{ uri: 'https://images.pexels.com/photos/30671893/pexels-photo-30671893.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' }} style={styles.heroImg} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroLabel}>LIVE NOW · IPL 2026 · T20 WC 2026</Text>
          <Text style={styles.heroTitle}>Every ball.{'\n'}Every stat. Live.</Text>
        </View>
      </View>

      {/* Live matches */}
      <SectionHeader title="Live Matches" subtitle={`${feed?.live?.length || 0} in progress`} />
      <View style={{ paddingHorizontal: spacing.lg }}>
        {feed?.live?.map((m: any) => <LiveMatchCard key={m.id} match={m} />)}
      </View>

      {/* Top performers */}
      <SectionHeader title="Top Performers" subtitle="Season leaders" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <StatChip title="Most Runs" value={feed?.top_performers?.highest_runs?.[0]?.value} player={feed?.top_performers?.highest_runs?.[0]?.player?.name} icon="trophy" color="#FFB020" />
        <StatChip title="Most Sixes" value={feed?.top_performers?.most_sixes?.[0]?.value} player={feed?.top_performers?.most_sixes?.[0]?.player?.name} icon="flame" color={colors.six} />
        <StatChip title="Most Fours" value={feed?.top_performers?.most_fours?.[0]?.value} player={feed?.top_performers?.most_fours?.[0]?.player?.name} icon="flash" color={colors.four} />
        <StatChip title="Best Catches" value={feed?.top_performers?.best_catches?.[0]?.value} player={feed?.top_performers?.best_catches?.[0]?.player?.name} icon="hand-right" color={colors.primary} />
        <StatChip title="Most Wickets" value={feed?.top_performers?.most_wickets?.[0]?.value} player={feed?.top_performers?.most_wickets?.[0]?.player?.name} icon="skull-outline" color={colors.wicket} />
      </ScrollView>

      {/* Upcoming */}
      <SectionHeader title="Upcoming Matches" subtitle="Set alerts so you never miss a moment" />
      <View style={{ paddingHorizontal: spacing.lg }}>
        {feed?.upcoming?.slice(0, 4).map((m: any) => <LiveMatchCard key={m.id} match={m} />)}
      </View>

      {/* Ask AI promo */}
      <TouchableOpacity style={styles.aiPromo} onPress={() => router.push('/(tabs)/ai')} testID="ai-promo-btn">
        <View style={{ flex: 1 }}>
          <Text style={styles.aiPromoLabel}>ASK AI</Text>
          <Text style={styles.aiPromoTitle}>Cricket stats,{'\n'}instantly answered.</Text>
        </View>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatChip({ title, value, player, icon, color }: any) {
  return (
    <View style={styles.chip}>
      <View style={[styles.chipIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={14} color="#fff" />
      </View>
      <Text style={styles.chipTitle}>{title}</Text>
      <Text style={styles.chipValue}>{value ?? '—'}</Text>
      <Text style={styles.chipPlayer} numberOfLines={1}>{player ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  greet: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary },
  appTitle: { fontFamily: fonts.headingBlack, fontSize: 28, color: colors.text, letterSpacing: -1 },
  avatarBtn: { padding: 4 },
  hero: {
    marginHorizontal: spacing.lg,
    height: 170,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.bgSecondary,
  },
  heroImg: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,20,24,0.45)',
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroLabel: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },
  heroTitle: { fontFamily: fonts.headingBlack, color: '#fff', fontSize: 26, lineHeight: 30, letterSpacing: -0.5 },

  chip: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    width: 140,
    gap: 4,
  },
  chipIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  chipTitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  chipValue: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  chipPlayer: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary },

  aiPromo: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.text,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiPromoLabel: { fontFamily: fonts.bodyBold, color: colors.textTertiary, fontSize: 10, letterSpacing: 1.5 },
  aiPromoTitle: { fontFamily: fonts.headingBlack, color: '#fff', fontSize: 20, lineHeight: 24, marginTop: 4 },
  aiIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
