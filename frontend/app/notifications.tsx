import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../src/theme';
import { miscApi } from '../src/api';
import { useAuth } from '../src/auth';

const ICONS: Record<string, any> = {
  wicket: 'alert-circle',
  boundary: 'flash',
  player_to_crease: 'walk',
  match_start: 'tennisball',
};
const COLORS: Record<string, string> = {
  wicket: '#FF3B30',
  boundary: '#34C759',
  player_to_crease: '#007AFF',
  match_start: '#111418',
};

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await miscApi.notifications();
      setRows(res.data.notifications);
    } catch { /* ignore */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    await miscApi.markAllRead();
    load();
  };

  if (!user) {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + spacing.xxl }]}>
        <Ionicons name="notifications-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Sign in to see your alerts</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/login')}>
          <Text style={styles.btnTxt}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAll} testID="mark-all-read-btn">
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
          {rows.length === 0 ? (
            <Text style={styles.empty}>No notifications yet. We&apos;ll ping you when something happens in your matches.</Text>
          ) : rows.map(n => {
            const icon = ICONS[n.type] || 'notifications';
            const color = COLORS[n.type] || colors.primary;
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, !n.read && styles.unread]}
                onPress={async () => {
                  if (!n.read) { await miscApi.markNotificationRead(n.id); load(); }
                  if (n.match_id) router.push(`/match/${n.match_id}`);
                }}
                testID={`notif-${n.id}`}>
                <View style={[styles.iconBubble, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifBody}>{n.body}</Text>
                  <Text style={styles.notifTime}>{new Date(n.created_at).toLocaleString()}</Text>
                </View>
                {!n.read ? <View style={styles.dot} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.headingBlack, fontSize: 20, color: colors.text, letterSpacing: -0.5 },
  markAll: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text, paddingHorizontal: 12, paddingVertical: 6 },

  emptyTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, marginTop: spacing.md },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl, padding: spacing.lg },

  card: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: spacing.sm },
  unread: { backgroundColor: '#F8F9FC' },
  iconBubble: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  notifBody: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  notifTime: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live, marginTop: 8 },

  btn: { backgroundColor: colors.text, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.lg },
  btnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 13 },
});
