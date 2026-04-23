import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../src/theme';
import { useAuth } from '../src/auth';
import { adminApi, miscApi } from '../src/api';

export default function AdminPanel() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create news form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  // Create poll form
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, n] = await Promise.all([adminApi.stats(), miscApi.news()]);
      setStats(s.data);
      setNews(n.data.news);
    } catch (e: any) {
      if (e?.response?.status === 403) {
        Alert.alert('Access denied', 'This panel is for admins only.');
        router.back();
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createNews = async () => {
    if (!title || !body) { Alert.alert('Missing', 'Title and body are required'); return; }
    try {
      await adminApi.createNews({ title, body, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
      setTitle(''); setBody(''); setTags('');
      load();
    } catch { Alert.alert('Failed', 'Could not create news'); }
  };

  const deleteNews = async (id: string) => {
    await adminApi.deleteNews(id);
    load();
  };

  const createPoll = async () => {
    if (!pollQ || !pollOpts) { Alert.alert('Missing', 'Question and options required'); return; }
    const opts = pollOpts.split(',').map(o => o.trim()).filter(Boolean);
    if (opts.length < 2) { Alert.alert('Needs 2+ options'); return; }
    try {
      await adminApi.createPoll({ question: pollQ, options: opts });
      setPollQ(''); setPollOpts('');
      Alert.alert('Poll created');
    } catch { Alert.alert('Failed'); }
  };

  if (!user || !user.is_admin) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + spacing.xxl }]}>
        <Ionicons name="lock-closed" size={42} color={colors.textTertiary} />
        <Text style={styles.denied}>Admin access required</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/login')}>
          <Text style={styles.btnTxt}>Log in as admin</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>admin@cric.live / admin1234</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
          {/* Stats */}
          <Text style={styles.sectionTitle}>Platform stats</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Users" value={stats?.users ?? 0} />
            <StatCard label="Pro" value={stats?.pro_users ?? 0} />
            <StatCard label="Alerts" value={stats?.alerts ?? 0} />
            <StatCard label="News" value={stats?.news ?? 0} />
            <StatCard label="Poll votes" value={stats?.poll_votes ?? 0} />
            <StatCard label="Messages" value={stats?.chat_messages ?? 0} />
          </View>

          {/* Create news */}
          <Text style={styles.sectionTitle}>Create news article</Text>
          <View style={styles.formCard}>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.textTertiary} testID="admin-news-title" />
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={body} onChangeText={setBody} placeholder="Body" placeholderTextColor={colors.textTertiary} multiline testID="admin-news-body" />
            <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="Tags (comma-separated)" placeholderTextColor={colors.textTertiary} testID="admin-news-tags" />
            <TouchableOpacity style={styles.primaryBtn} onPress={createNews} testID="admin-create-news-btn">
              <Text style={styles.primaryBtnTxt}>Publish</Text>
            </TouchableOpacity>
          </View>

          {/* Existing news */}
          <Text style={styles.sectionTitle}>Published news</Text>
          {news.length === 0 ? (
            <Text style={styles.empty}>No news yet</Text>
          ) : news.map(n => (
            <View key={n.id} style={styles.newsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.newsTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={styles.newsMeta} numberOfLines={1}>{n.author} · {new Date(n.created_at).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteNews(n.id)} style={styles.delBtn} testID={`admin-delete-news-${n.id}`}>
                <Ionicons name="trash-outline" size={16} color={colors.wicket} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Create poll */}
          <Text style={styles.sectionTitle}>Create fan poll</Text>
          <View style={styles.formCard}>
            <TextInput style={styles.input} value={pollQ} onChangeText={setPollQ} placeholder="Question" placeholderTextColor={colors.textTertiary} testID="admin-poll-q" />
            <TextInput style={styles.input} value={pollOpts} onChangeText={setPollOpts} placeholder="Options (comma-separated, e.g. India,Australia)" placeholderTextColor={colors.textTertiary} testID="admin-poll-opts" />
            <TouchableOpacity style={styles.primaryBtn} onPress={createPoll} testID="admin-create-poll-btn">
              <Text style={styles.primaryBtnTxt}>Create poll</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

function StatCard({ label, value }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  denied: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 8 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title: { fontFamily: fonts.headingBlack, fontSize: 20, color: colors.text, letterSpacing: -0.5 },

  sectionTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md, letterSpacing: -0.3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { flex: 1, minWidth: '30%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  statValue: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text, letterSpacing: -0.5, marginTop: 4 },

  formCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  input: { backgroundColor: colors.bgSecondary, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.body, fontSize: 13, color: colors.text },
  primaryBtn: { backgroundColor: colors.text, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center' },
  primaryBtnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 13 },

  empty: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, fontStyle: 'italic', padding: spacing.md },
  newsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginBottom: 6 },
  newsTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  newsMeta: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 2 },
  delBtn: { padding: 8 },

  btn: { backgroundColor: colors.text, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.lg },
  btnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 13 },
});
