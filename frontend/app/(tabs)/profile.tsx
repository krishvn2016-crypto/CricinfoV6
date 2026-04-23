import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/auth';
import { miscApi } from '../../src/api';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [following, setFollowing] = useState<any>({ teams: [], players: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const res = await miscApi.following();
        setFollowing(res.data);
      } catch (e) { console.log(e); }
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.unauth, { paddingTop: insets.top + spacing.xxl }]}>
        <View style={styles.unauthIcon}>
          <Ionicons name="person" size={32} color={colors.text} />
        </View>
        <Text style={styles.unauthTitle}>Sign in to personalize</Text>
        <Text style={styles.unauthSub}>Follow teams & players, set smart alerts, join community chats.</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')} testID="profile-login-btn">
          <Text style={styles.btnPrimaryTxt}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/register')} testID="profile-register-btn">
          <Text style={styles.btnSecondaryTxt}>Create account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{user.name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Following</Text>
        {loading ? (
          <ActivityIndicator color={colors.textTertiary} />
        ) : (
          <>
            <Text style={styles.subLabel}>Teams ({following.teams?.length || 0})</Text>
            {following.teams?.length === 0 ? (
              <Text style={styles.emptyTxt}>Follow teams from their profile to see them here</Text>
            ) : (
              <View style={styles.chipRow}>
                {following.teams.map((t: any) => (
                  <TouchableOpacity key={t.id} style={[styles.chip, { backgroundColor: t.primary }]} onPress={() => router.push(`/team/${t.id}`)}>
                    <Text style={styles.chipTxt}>{t.short}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.subLabel, { marginTop: spacing.md }]}>Players ({following.players?.length || 0})</Text>
            {following.players?.length === 0 ? (
              <Text style={styles.emptyTxt}>Follow players from their profile to see them here</Text>
            ) : (
              <View style={styles.chipRow}>
                {following.players.map((p: any) => (
                  <TouchableOpacity key={p.id} style={styles.playerChip} onPress={() => router.push(`/player/${p.id}`)}>
                    <Text style={styles.playerChipTxt}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Row icon="notifications-outline" label="Push notifications" />
        <Row icon="shield-checkmark-outline" label="Privacy" />
        <Row icon="information-circle-outline" label="About CricLive" />
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => { Alert.alert('Log out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }]); }}
        testID="logout-btn">
        <Ionicons name="log-out-outline" size={18} color={colors.wicket} />
        <Text style={styles.logoutTxt}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  unauth: { flex: 1, alignItems: 'center', padding: spacing.xl, backgroundColor: colors.bg, gap: spacing.md },
  unauthIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  unauthTitle: { fontFamily: fonts.headingBlack, fontSize: 24, color: colors.text, letterSpacing: -0.5 },
  unauthSub: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  btnPrimary: { backgroundColor: colors.text, paddingVertical: 14, paddingHorizontal: 32, borderRadius: radius.lg, width: '100%', alignItems: 'center' },
  btnPrimaryTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 15 },
  btnSecondary: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: radius.lg, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  btnSecondaryTxt: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },

  header: { alignItems: 'center', padding: spacing.xl },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarTxt: { fontFamily: fonts.headingBlack, fontSize: 36, color: '#fff' },
  name: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, marginTop: 2 },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginBottom: spacing.md, letterSpacing: -0.3 },
  subLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  emptyTxt: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md },
  chipTxt: { fontFamily: fonts.bodyBold, fontSize: 11, color: '#fff' },
  playerChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.bgSecondary },
  playerChipTxt: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: spacing.md },
  rowLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: spacing.lg, paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  logoutTxt: { fontFamily: fonts.bodyBold, color: colors.wicket, fontSize: 14 },
});
