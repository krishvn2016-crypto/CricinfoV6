import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from './theme';

type Team = { id: string; name: string; short: string; primary: string; secondary: string };

export function LiveMatchCard({ match }: { match: any }) {
  const isLive = match.status === 'live';
  const s = match.score;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/match/${match.id}`)}
      style={styles.card}
      testID={`match-card-${match.id}`}>
      <View style={styles.header}>
        <Text style={styles.league}>{match.league}</Text>
        {isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>LIVE</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.teamsRow}>
        <TeamBlock team={match.team_a} score={s ? `${s.runs}/${s.wickets}` : undefined} overs={s ? `${s.overs}.${s.balls} ov` : undefined} active={match.batting_team_id === match.team_a.id} />
        <Text style={styles.vs}>vs</Text>
        <TeamBlock team={match.team_b} score={match.result_b_score} active={match.batting_team_id === match.team_b.id} />
      </View>

      {isLive && s?.target ? (
        <Text style={styles.target}>
          Need {s.target - s.runs} runs from {Math.max(0, 120 - (s.overs * 6 + s.balls))} balls · RRR {s.rrr}
        </Text>
      ) : null}
      {!isLive && match.status === 'upcoming' ? (
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.metaTxt}>{new Date(match.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      ) : null}
      {!isLive && match.status === 'completed' && match.result ? (
        <Text style={styles.result}>{match.result}</Text>
      ) : null}

      <Text style={styles.venue} numberOfLines={1}>
        <Ionicons name="location-outline" size={11} /> {match.venue}
      </Text>
    </TouchableOpacity>
  );
}

function TeamBlock({ team, score, overs, active }: { team: Team; score?: string; overs?: string; active?: boolean }) {
  return (
    <View style={styles.teamBlock}>
      <View style={[styles.teamBadge, { backgroundColor: team.primary }]}>
        <Text style={styles.teamShort}>{team.short}</Text>
      </View>
      <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
      {score ? <Text style={[styles.teamScore, active && styles.teamScoreActive]}>{score}</Text> : null}
      {overs ? <Text style={styles.teamOvers}>{overs}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  league: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.live },
  liveTxt: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.live, letterSpacing: 1 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  teamBlock: { flex: 1, alignItems: 'center' },
  teamBadge: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  teamShort: { fontFamily: fonts.headingSemi, fontSize: 12, color: '#fff', letterSpacing: 0.5 },
  teamName: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, marginBottom: 4, textAlign: 'center' },
  teamScore: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  teamScoreActive: { color: colors.text },
  teamOvers: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary },
  vs: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textTertiary, letterSpacing: 1 },
  target: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.text,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    textAlign: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: spacing.sm },
  metaTxt: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  result: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.success,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  venue: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
