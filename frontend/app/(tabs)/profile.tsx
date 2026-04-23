import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/auth';
import { miscApi } from '../../src/api';
import { buyAIPack } from '../../src/payments';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
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

  const togglePro = async () => {
    try {
      await miscApi.togglePro();
      await refreshUser();
    } catch { Alert.alert('Failed'); }
  };

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
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
          {user.is_pro ? (
            <View style={styles.proPill}>
              <Ionicons name="sparkles" size={10} color="#fff" />
              <Text style={styles.proPillTxt}>PRO</Text>
            </View>
          ) : null}
          {user.is_admin ? (
            <View style={[styles.proPill, { backgroundColor: '#6E56CF' }]}>
              <Ionicons name="shield-checkmark" size={10} color="#fff" />
              <Text style={styles.proPillTxt}>ADMIN</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Pro upgrade card */}
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        {user.is_pro ? (
          <View style={styles.proCard}>
            <Ionicons name="sparkles" size={18} color="#FFB020" />
            <View style={{ flex: 1 }}>
              <Text style={styles.proTitle}>You&apos;re a Pro member</Text>
              <Text style={styles.proSub}>Unlimited Ask AI · Priority insights</Text>
            </View>
            <TouchableOpacity onPress={togglePro} testID="downgrade-pro">
              <Text style={styles.proAction}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.upgradeCard} onPress={togglePro} testID="go-pro-btn">
            <View style={styles.upgradeIcon}>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Go Pro · ₹99/mo</Text>
              <Text style={styles.upgradeSub}>Unlimited Ask AI · Ad-free · Priority match insights</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {user.is_admin ? (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <TouchableOpacity style={styles.adminCard} onPress={() => router.push('/admin')} testID="admin-panel-btn">
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.text} />
            <Text style={styles.adminTxt}>Open Admin Panel</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <TouchableOpacity style={styles.packCard} onPress={purchaseAIPack} testID="buy-ai-pack-btn">
          <View style={styles.packIcon}><Ionicons name="flash" size={18} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.packTitle}>5 Ask AI queries · ₹100</Text>
            <Text style={styles.packSub}>Secure payment via Razorpay (test mode)</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
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
        <Row icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
        <Row icon="chatbox-ellipses-outline" label="Send feedback" onPress={() => router.push('/feedback')} />
        <Row icon="information-circle-outline" label="About CricLive" onPress={() => router.push('/about')} />
        <Row icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push('/terms')} />
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

function Row({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
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

  proPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFB020', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  proPillTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 9, letterSpacing: 1 },
  upgradeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.text, borderRadius: radius.lg },
  upgradeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  upgradeTitle: { fontFamily: fonts.headingBlack, fontSize: 16, color: '#fff', letterSpacing: -0.3 },
  upgradeSub: { fontFamily: fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  proCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: '#FFF7E0', borderRadius: radius.lg },
  proTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#111' },
  proSub: { fontFamily: fonts.body, fontSize: 11, color: '#8B6A00' },
  proAction: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.wicket },
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.bgSecondary, borderRadius: radius.lg },
  adminTxt: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  packCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: '#F3F4F6', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  packIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFB020', alignItems: 'center', justifyContent: 'center' },
  packTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  packSub: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 2 },
});
