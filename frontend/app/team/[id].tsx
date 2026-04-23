import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { teamsApi, miscApi } from '../../src/api';
import { useAuth } from '../../src/auth';

export default function TeamProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await teamsApi.detail(id);
      setTeam(res.data);
      if (user) {
        try { const f = await miscApi.following(); setFollowing(f.data.teams.some((t: any) => t.id === id)); } catch {}
      }
    })();
  }, [id, user]);

  const toggleFollow = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      if (following) { await miscApi.unfollow('team', id!); setFollowing(false); }
      else { await miscApi.follow('team', id!); setFollowing(true); }
    } catch {}
  };

  if (!team) return <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFollow} style={[styles.followBtn, following && styles.followingBtn]} testID="follow-team-btn">
          <Text style={[styles.followBtnTxt, following && styles.followingBtnTxt]}>{following ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.head}>
          <View style={[styles.badge, { backgroundColor: team.primary }]}>
            <Text style={styles.badgeTxt}>{team.short}</Text>
          </View>
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.meta}>{team.league} · {team.country}</Text>
        </View>

        <Text style={styles.sectionTitle}>Squad</Text>
        {team.squad?.length ? team.squad.map((p: any) => (
          <TouchableOpacity key={p.id} style={styles.row} onPress={() => router.push(`/player/${p.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{p.name}</Text>
              <Text style={styles.rowMeta}>{p.role}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )) : (
          <Text style={styles.empty}>Squad details coming soon</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  backBtn: { padding: 8 },
  followBtn: { backgroundColor: colors.text, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  followingBtn: { backgroundColor: colors.bgSecondary },
  followBtnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 12 },
  followingBtnTxt: { color: colors.text },

  head: { alignItems: 'center', padding: spacing.lg },
  badge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  badgeTxt: { fontFamily: fonts.headingBlack, fontSize: 22, color: '#fff' },
  name: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: -0.5 },
  meta: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textTertiary, marginTop: 4 },

  sectionTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, marginBottom: spacing.md, marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 6 },
  rowName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  rowMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  empty: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, fontStyle: 'italic', textAlign: 'center', padding: spacing.lg },
});
