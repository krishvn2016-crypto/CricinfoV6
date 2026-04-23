import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { miscApi } from '../../src/api';
import { useAuth } from '../../src/auth';
import { router } from 'expo-router';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedMap, setVotedMap] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await miscApi.polls();
        setPolls(res.data.polls);
      } catch (e) { console.log(e); }
      setLoading(false);
    })();
  }, []);

  const vote = async (pollId: string, idx: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await miscApi.votePoll(pollId, idx);
      setVotedMap(prev => ({ ...prev, [pollId]: idx }));
    } catch (e) { console.log(e); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.sub}>Fan polls, chat, and discussions</Text>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <View style={styles.banner}>
            <Image source={{ uri: 'https://images.pexels.com/photos/31852382/pexels-photo-31852382.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' }} style={styles.bannerImg} />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>Join the conversation</Text>
              <Text style={styles.bannerSub}>Live chat · Polls · Predictions</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Active Fan Polls</Text>

          {polls.map(p => {
            const myVote = votedMap[p.id];
            return (
              <View key={p.id} style={styles.pollCard} testID={`poll-${p.id}`}>
                <Text style={styles.pollQ}>{p.question}</Text>
                {p.options.map((o: any, i: number) => {
                  const pct = Math.round((o.votes / Math.max(p.total, 1)) * 100);
                  const voted = myVote === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      disabled={myVote !== undefined}
                      onPress={() => vote(p.id, i)}
                      style={styles.optWrap}
                      testID={`poll-${p.id}-opt-${i}`}>
                      <View style={[styles.optBar, { width: `${pct}%`, backgroundColor: voted ? colors.text : colors.bgSecondary }]} />
                      <View style={styles.optRow}>
                        <Text style={[styles.optLabel, voted && { color: '#fff' }]}>{o.label}</Text>
                        <Text style={[styles.optPct, voted && { color: '#fff' }]}>{pct}%</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <Text style={styles.pollMeta}>{p.total.toLocaleString()} votes</Text>
              </View>
            );
          })}

          <Text style={styles.sectionTitle}>Live Match Chat</Text>
          <Text style={styles.hint}>Open any live match to join its chat room</Text>
          <TouchableOpacity style={styles.goMatches} onPress={() => router.push('/(tabs)/matches')} testID="go-matches-btn">
            <Ionicons name="tennisball" size={18} color="#fff" />
            <Text style={styles.goMatchesTxt}>Browse Live Matches</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.headingBlack, fontSize: 28, color: colors.text, letterSpacing: -1 },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  banner: { height: 140, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.lg, backgroundColor: colors.bgSecondary },
  bannerImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,20,24,0.45)', padding: spacing.lg, justifyContent: 'flex-end' },
  bannerTitle: { fontFamily: fonts.headingBlack, color: '#fff', fontSize: 22, letterSpacing: -0.5 },
  bannerSub: { fontFamily: fonts.body, color: '#fff', fontSize: 12, opacity: 0.9, marginTop: 2 },

  sectionTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm, letterSpacing: -0.5 },
  pollCard: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  pollQ: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text, marginBottom: spacing.md },
  optWrap: { height: 40, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm, justifyContent: 'center', backgroundColor: colors.bgSecondary },
  optBar: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  optRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, alignItems: 'center' },
  optLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  optPct: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textSecondary },
  pollMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 4 },

  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md },
  goMatches: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.text, paddingVertical: 14, borderRadius: radius.lg },
  goMatchesTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 14 },
});
