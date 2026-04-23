import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { playersApi, miscApi } from '../../src/api';
import { useAuth } from '../../src/auth';

export default function PlayerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await playersApi.detail(id);
      setPlayer(res.data);
      if (user) {
        try {
          const f = await miscApi.following();
          setFollowing(f.data.players.some((p: any) => p.id === id));
        } catch {}
      }
    })();
  }, [id, user]);

  const toggleFollow = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      if (following) { await miscApi.unfollow('player', id!); setFollowing(false); }
      else { await miscApi.follow('player', id!); setFollowing(true); }
    } catch {}
  };

  if (!player) return <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>;

  const s = player.stats;
  const maxForm = Math.max(...(player.recent_form || [1]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFollow} style={[styles.followBtn, following && styles.followingBtn]} testID="follow-player-btn">
          <Text style={[styles.followBtnTxt, following && styles.followingBtnTxt]}>{following ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Text>
          </View>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.meta}>{player.country} · {player.role}</Text>
          {player.speciality ? (
            <View style={styles.specialityPill}>
              <Ionicons name="star" size={10} color="#fff" />
              <Text style={styles.specialityTxt}>{player.speciality}</Text>
            </View>
          ) : null}
          <Text style={styles.metaSmall}>{player.batting_style} · {player.bowling_style}</Text>
          {player.best_fielding_position ? (
            <Text style={styles.metaSmall}>Best fielding: {player.best_fielding_position}</Text>
          ) : null}
        </View>

        {/* Achievements */}
        <View style={styles.achRow}>
          <Ach icon="trophy" label="MoTM" value={s.motm_count ?? 0} color="#FFB020" />
          <Ach icon="medal" label="MoS" value={s.mos_count ?? 0} color="#6E56CF" />
          <Ach icon="hand-right" label="Catches" value={s.catches ?? 0} color={colors.primary} />
        </View>

        {/* Headline stats */}
        <View style={styles.statsGrid}>
          <Stat label="Matches" value={s.matches} />
          <Stat label="Runs" value={s.runs} />
          <Stat label="Strike Rate" value={s.sr} />
          <Stat label="Sixes" value={s.sixes ?? 0} />
          <Stat label="Fours" value={s.fours ?? 0} />
          <Stat label="Wickets" value={s.wickets ?? 0} />
        </View>

        {/* Per-format batting avg */}
        {s.batting_avg ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Batting average by format</Text>
            <View style={styles.formatRow}>
              <FormatStat label="T20" value={s.batting_avg.T20} />
              <FormatStat label="ODI" value={s.batting_avg.ODI} />
              <FormatStat label="Test" value={s.batting_avg.Test} />
            </View>
          </View>
        ) : null}

        {/* Per-format bowling avg */}
        {s.bowling_avg ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bowling average by format</Text>
            <View style={styles.formatRow}>
              <FormatStat label="T20" value={s.bowling_avg.T20} />
              <FormatStat label="ODI" value={s.bowling_avg.ODI} />
              <FormatStat label="Test" value={s.bowling_avg.Test} />
            </View>
          </View>
        ) : null}

        {/* Wicket-keeping */}
        {s.wk_stats ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wicket-keeping</Text>
            <View style={styles.formatRow}>
              <FormatStat label="Dismissals" value={s.wk_stats.dismissals} />
              <FormatStat label="Stumpings" value={s.wk_stats.stumpings} />
              <FormatStat label="Catches (WK)" value={s.wk_stats.catches_behind} />
            </View>
          </View>
        ) : null}

        {/* Recent form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent form (last 10 innings)</Text>
          <View style={styles.formBarRow}>
            {player.recent_form?.map((r: number, i: number) => (
              <View key={i} style={styles.formBar}>
                <View style={{ width: 14, height: Math.max(4, (r / maxForm) * 80), backgroundColor: r >= 50 ? colors.success : r >= 25 ? colors.four : colors.textTertiary, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                <Text style={styles.formTxt}>{r}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance at top venues */}
        {player.top_venues ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance at top venues</Text>
            {player.top_venues.map((v: any, i: number) => (
              <View key={i} style={styles.venueCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.venueName}>{v.venue}</Text>
                  <Text style={styles.venueSub}>{v.matches} matches · HS {v.highest}{v.wickets ? ` · ${v.wickets} wkts` : ''}</Text>
                </View>
                <View style={styles.venueStats}>
                  <Text style={styles.venueVal}>{v.runs}</Text>
                  <Text style={styles.venueLabel}>runs · avg {v.avg}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Vs top teams */}
        {player.vs_teams ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Head-to-head vs teams</Text>
            {player.vs_teams.map((row: any, i: number) => (
              <View key={i} style={styles.vsRow}>
                <View style={[styles.teamBadge, { backgroundColor: row.team.primary }]}>
                  <Text style={styles.teamShort}>{row.team.short}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vsTeam}>{row.team.name}</Text>
                  <Text style={styles.vsMeta}>{row.matches} matches · HS {row.highest} · SR {row.sr}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.vsRuns}>{row.runs}</Text>
                  <Text style={styles.vsAvg}>avg {row.avg}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function FormatStat({ label, value }: any) {
  return (
    <View style={styles.formatCard}>
      <Text style={styles.formatLabel}>{label}</Text>
      <Text style={styles.formatValue}>{value}</Text>
    </View>
  );
}

function Ach({ icon, label, value, color }: any) {
  return (
    <View style={[styles.achCard, { backgroundColor: color }]}>
      <Ionicons name={icon} size={14} color="#fff" />
      <Text style={styles.achLabel}>{label}</Text>
      <Text style={styles.achValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  backBtn: { padding: 8 },
  followBtn: { backgroundColor: colors.text, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  followingBtn: { backgroundColor: colors.bgSecondary },
  followBtnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 12 },
  followingBtnTxt: { color: colors.text },

  head: { alignItems: 'center', padding: spacing.lg, gap: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarTxt: { fontFamily: fonts.headingBlack, fontSize: 28, color: '#fff' },
  name: { fontFamily: fonts.headingBlack, fontSize: 24, color: colors.text, letterSpacing: -0.5 },
  meta: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  metaSmall: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  specialityPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.text, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, marginVertical: 6 },
  specialityTxt: { fontFamily: fonts.bodyBold, fontSize: 11, color: '#fff' },

  achRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md },
  achCard: { flex: 1, borderRadius: radius.lg, padding: spacing.md, alignItems: 'flex-start', gap: 4 },
  achLabel: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#fff', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 },
  achValue: { fontFamily: fonts.headingBlack, fontSize: 22, color: '#fff', letterSpacing: -0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, minWidth: '30%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  statValue: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text, letterSpacing: -0.5, marginTop: 4 },

  section: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 15, color: colors.text, marginBottom: spacing.md },

  formatRow: { flexDirection: 'row', gap: spacing.sm },
  formatCard: { flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  formatLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  formatValue: { fontFamily: fonts.headingBlack, fontSize: 20, color: colors.text, letterSpacing: -0.5, marginTop: 4 },

  formBarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110 },
  formBar: { alignItems: 'center', gap: 4 },
  formTxt: { fontFamily: fonts.body, fontSize: 9, color: colors.textTertiary },

  venueCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  venueName: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text },
  venueSub: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 2 },
  venueStats: { alignItems: 'flex-end' },
  venueVal: { fontFamily: fonts.headingBlack, fontSize: 18, color: colors.text, letterSpacing: -0.5 },
  venueLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textTertiary, letterSpacing: 0.5 },

  vsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  teamBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  teamShort: { fontFamily: fonts.headingSemi, fontSize: 11, color: '#fff' },
  vsTeam: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  vsMeta: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 1 },
  vsRuns: { fontFamily: fonts.headingBlack, fontSize: 18, color: colors.text, letterSpacing: -0.5 },
  vsAvg: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary },
});
