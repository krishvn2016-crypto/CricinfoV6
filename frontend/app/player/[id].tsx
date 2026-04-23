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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
          <Text style={styles.metaSmall}>{player.batting_style} · {player.bowling_style}</Text>
        </View>

        <View style={styles.statsGrid}>
          <Stat label="Matches" value={s.matches} />
          <Stat label="Runs" value={s.runs} />
          <Stat label="Average" value={s.avg} />
          <Stat label="Strike Rate" value={s.sr} />
          <Stat label="Sixes" value={s.sixes ?? 0} />
          <Stat label="Fours" value={s.fours ?? 0} />
          <Stat label="Catches" value={s.catches ?? 0} />
          <Stat label="Wickets" value={s.wickets ?? 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent form (last 10 innings)</Text>
          <View style={styles.formRow}>
            {player.recent_form?.map((r: number, i: number) => (
              <View key={i} style={styles.formBar}>
                <View style={{ width: 14, height: Math.max(4, (r / maxForm) * 80), backgroundColor: r >= 50 ? colors.success : r >= 25 ? colors.four : colors.textTertiary, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                <Text style={styles.formTxt}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
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

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  backBtn: { padding: 8 },
  followBtn: { backgroundColor: colors.text, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  followingBtn: { backgroundColor: colors.bgSecondary },
  followBtnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 12 },
  followingBtnTxt: { color: colors.text },

  head: { alignItems: 'center', padding: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarTxt: { fontFamily: fonts.headingBlack, fontSize: 28, color: '#fff' },
  name: { fontFamily: fonts.headingBlack, fontSize: 24, color: colors.text, letterSpacing: -0.5 },
  meta: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  metaSmall: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  statValue: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text, letterSpacing: -0.5, marginTop: 4 },

  section: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 15, color: colors.text, marginBottom: spacing.md },
  formRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110 },
  formBar: { alignItems: 'center', gap: 4 },
  formTxt: { fontFamily: fonts.body, fontSize: 9, color: colors.textTertiary },
});
