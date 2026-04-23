import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { matchesApi, miscApi } from '../../src/api';
import { BallCircle, WinMeter } from '../../src/Common';
import { useAuth } from '../../src/auth';

type Tab = 'summary' | 'scorecard' | 'xi' | 'commentary' | 'stats' | 'fantasy' | 'chat';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [commentary, setCommentary] = useState<any[]>([]);
  const [manhattan, setManhattan] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [predictedXi, setPredictedXi] = useState<any>(null);
  const [playingXi, setPlayingXi] = useState<any>(null);
  const [umpires, setUmpires] = useState<any>(null);
  const [venueInfo, setVenueInfo] = useState<any>(null);
  const [winProb, setWinProb] = useState<any>(null);
  const [chat, setChat] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [tab, setTab] = useState<Tab>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [m, sc, cm, wp, mh, pt, xi, ch, pxi, ump] = await Promise.all([
          matchesApi.detail(id),
          matchesApi.scorecard(id),
          matchesApi.commentary(id),
          miscApi.winProbability(id),
          matchesApi.manhattan(id),
          matchesApi.partnerships(id),
          matchesApi.predictedXi(id),
          miscApi.chat(id),
          matchesApi.playingXi(id),
          matchesApi.umpires(id),
        ]);
        setMatch(m.data);
        setScorecard(sc.data);
        setCommentary(cm.data.commentary);
        setWinProb(wp.data);
        setManhattan(mh.data.manhattan);
        setPartnerships(pt.data.partnerships);
        setPredictedXi(xi.data);
        setChat(ch.data.messages);
        setPlayingXi(pxi.data);
        setUmpires(ump.data);
        // Fetch venue info separately (needs venue name)
        if (m.data?.venue) {
          try {
            const v = await matchesApi.venue(m.data.venue);
            setVenueInfo(v.data);
          } catch {}
        }
      } catch (e) { console.log(e); }
      setLoading(false);
    })();
  }, [id]);

  const setAlert = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      await miscApi.setAlert(id!, ['wicket', 'boundary']);
      Alert.alert('Alert set', 'You will be notified for wickets and boundaries.');
    } catch { Alert.alert('Failed', 'Please try again'); }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    if (!user) { router.push('/login'); return; }
    try {
      const res = await miscApi.sendChat(id!, chatInput.trim());
      setChat(prev => [...prev, res.data]);
      setChatInput('');
    } catch { Alert.alert('Failed', 'Message not sent'); }
  };

  if (loading || !match) {
    return <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>;
  }

  const s = match.score;
  const ta = match.team_a;
  const tb = match.team_b;
  const tabs: Tab[] = ['summary', 'scorecard', 'xi', 'commentary', 'stats', 'fantasy', 'chat'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topLeague}>{match.league}</Text>
        <TouchableOpacity onPress={setAlert} style={styles.bellBtn} testID="alert-btn">
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Match header */}
      <View style={styles.headCard}>
        {match.status === 'live' ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>LIVE</Text>
          </View>
        ) : null}

        <View style={styles.teamRow}>
          <View style={styles.teamCol}>
            <View style={[styles.teamBadge, { backgroundColor: ta.primary }]}>
              <Text style={styles.teamShort}>{ta.short}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>{ta.name}</Text>
            {s ? <Text style={styles.scoreBig}>{s.runs}/{s.wickets}</Text> : <Text style={styles.scoreBig}>—</Text>}
            {s ? <Text style={styles.oversTxt}>{s.overs}.{s.balls} overs · RR {s.rr}</Text> : null}
          </View>
          <Text style={styles.vsBig}>VS</Text>
          <View style={styles.teamCol}>
            <View style={[styles.teamBadge, { backgroundColor: tb.primary }]}>
              <Text style={styles.teamShort}>{tb.short}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>{tb.name}</Text>
            <Text style={styles.scoreBig}>—</Text>
            <Text style={styles.oversTxt}>Yet to bat</Text>
          </View>
        </View>

        <Text style={styles.venueTxt}><Ionicons name="location-outline" size={12} /> {match.venue}</Text>

        {s?.target ? <Text style={styles.targetTxt}>TARGET: {s.target} · RRR {s.rrr}</Text> : null}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
            testID={`tab-${t}`}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        {tab === 'summary' && (
          <>
            {/* Current batsmen */}
            {match.current_batsmen ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>At the crease</Text>
                {match.current_batsmen.map((b: any, i: number) => (
                  <View key={i} style={styles.playerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerName}>
                        {b.player.name} {b.on_strike ? <Text style={styles.strike}>•</Text> : null}
                      </Text>
                      <Text style={styles.playerMeta}>4s: {b.fours} · 6s: {b.sixes} · SR {b.sr}</Text>
                    </View>
                    <Text style={styles.playerScore}>{b.runs} ({b.balls})</Text>
                  </View>
                ))}
                {match.current_bowler && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Bowling</Text>
                    <View style={styles.playerRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.playerName}>{match.current_bowler.player.name}</Text>
                        <Text style={styles.playerMeta}>Econ {match.current_bowler.economy}</Text>
                      </View>
                      <Text style={styles.playerScore}>{match.current_bowler.wickets}-{match.current_bowler.runs} ({match.current_bowler.overs})</Text>
                    </View>
                  </>
                )}
              </View>
            ) : null}

            {/* Win probability */}
            {winProb && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Win Probability (AI)</Text>
                <WinMeter aPct={winProb.team_a_pct} bPct={winProb.team_b_pct} aColor={ta.primary} bColor={tb.primary} aShort={ta.short} bShort={tb.short} />
              </View>
            )}

            {/* Recent balls */}
            {match.recent_balls && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent balls</Text>
                <View style={styles.ballsRow}>
                  {match.recent_balls.map((b: any, i: number) => (
                    <BallCircle key={i} runs={b.runs} wicket={b.wicket} />
                  ))}
                </View>
              </View>
            )}

            {/* Venue info */}
            {venueInfo && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Venue</Text>
                <Text style={styles.venueName}>{match.venue}</Text>
                <View style={styles.venueGrid}>
                  {venueInfo.capacity ? <VenueStat label="Capacity" value={venueInfo.capacity.toLocaleString()} /> : null}
                  {venueInfo.pitch_type ? <VenueStat label="Pitch" value={venueInfo.pitch_type} /> : null}
                  {venueInfo.avg_1st_innings ? <VenueStat label="Avg 1st inn" value={venueInfo.avg_1st_innings} /> : null}
                  {venueInfo.highest_total ? <VenueStat label="Highest total" value={venueInfo.highest_total} /> : null}
                  {venueInfo.highest_chased ? <VenueStat label="Highest chase" value={venueInfo.highest_chased} /> : null}
                  {venueInfo.ends ? <VenueStat label="Ends" value={venueInfo.ends.join(' · ')} /> : null}
                </View>
              </View>
            )}

            {/* Umpires */}
            {umpires && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Match Officials</Text>
                {umpires.on_field.map((u: any, i: number) => (
                  <UmpireRow key={`of-${i}`} u={u} />
                ))}
                <UmpireRow u={umpires.tv_umpire} />
                <UmpireRow u={umpires.reserve} />
                <UmpireRow u={umpires.match_referee} />
              </View>
            )}
          </>
        )}

        {tab === 'xi' && playingXi && (
          <>
            <Text style={styles.fantasyTitle}>Playing XI</Text>
            <Text style={styles.fantasySub}>Final squads with detailed match-context stats</Text>
            {[playingXi.team_a, playingXi.team_b].map((side: any, i: number) => (
              <View key={i} style={styles.section}>
                <View style={styles.fantasyTeamHead}>
                  <View style={[styles.teamBadgeSm, { backgroundColor: side.team.primary }]}>
                    <Text style={styles.teamShortSm}>{side.team.short}</Text>
                  </View>
                  <Text style={styles.fantasyTeamName}>{side.team.name}</Text>
                </View>
                {side.playing_xi.map((p: any, j: number) => (
                  <XIPlayerRow key={j} index={j + 1} p={p} />
                ))}
              </View>
            ))}
          </>
        )}

        {tab === 'scorecard' && scorecard && (
          <>
            {[scorecard.innings1, scorecard.innings2].filter(Boolean).map((inn: any, idx: number) => (
              <View key={idx} style={styles.section}>
                <View style={styles.innHeader}>
                  <Text style={styles.innTitle}>{inn.team.name}</Text>
                  <Text style={styles.innTotal}>{inn.total}</Text>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Batter</Text>
                  <Text style={styles.th}>R</Text>
                  <Text style={styles.th}>B</Text>
                  <Text style={styles.th}>4s</Text>
                  <Text style={styles.th}>6s</Text>
                  <Text style={styles.th}>SR</Text>
                </View>
                {inn.batting.map((r: any, i: number) => (
                  <View key={i} style={styles.tr}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.tdName}>{r.player.name}</Text>
                      <Text style={styles.tdDismiss} numberOfLines={1}>{r.dismissal}</Text>
                    </View>
                    <Text style={[styles.td, styles.tdBold]}>{r.runs}</Text>
                    <Text style={styles.td}>{r.balls}</Text>
                    <Text style={styles.td}>{r.fours}</Text>
                    <Text style={styles.td}>{r.sixes}</Text>
                    <Text style={styles.td}>{r.sr}</Text>
                  </View>
                ))}
                <Text style={styles.extrasTxt}>Extras: {inn.extras}</Text>

                <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Bowling</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Bowler</Text>
                  <Text style={styles.th}>O</Text>
                  <Text style={styles.th}>M</Text>
                  <Text style={styles.th}>R</Text>
                  <Text style={styles.th}>W</Text>
                  <Text style={styles.th}>Econ</Text>
                </View>
                {inn.bowling.map((r: any, i: number) => (
                  <View key={i} style={styles.tr}>
                    <Text style={[styles.tdName, { flex: 2 }]}>{r.player.name}</Text>
                    <Text style={styles.td}>{r.overs}</Text>
                    <Text style={styles.td}>{r.maidens}</Text>
                    <Text style={styles.td}>{r.runs}</Text>
                    <Text style={[styles.td, styles.tdBold]}>{r.wickets}</Text>
                    <Text style={styles.td}>{r.economy}</Text>
                  </View>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Fall of wickets</Text>
                {inn.fall_of_wickets.map((f: any, i: number) => (
                  <Text key={i} style={styles.fowTxt}>{f.wicket}-{f.score} ({f.batter}, {f.over})</Text>
                ))}
              </View>
            ))}
          </>
        )}

        {tab === 'commentary' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ball-by-ball</Text>
            {commentary.map((c, i) => (
              <View key={i} style={styles.commentaryRow}>
                <View style={styles.ovPill}>
                  <Text style={styles.ovPillTxt}>{c.over_ball}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <BallCircle runs={c.runs} wicket={c.wicket} />
                    <Text style={styles.commDesc}>{c.desc}</Text>
                  </View>
                  <Text style={styles.commTxt}>{c.commentary}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'stats' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manhattan (Runs per over)</Text>
              <View style={styles.manhattan}>
                {manhattan.map((o, i) => {
                  const max = Math.max(...manhattan.map(x => x.runs));
                  const h = Math.max(10, (o.runs / max) * 100);
                  return (
                    <View key={i} style={styles.manBar}>
                      <View style={{ width: 10, height: h, backgroundColor: o.wickets ? colors.wicket : colors.primary, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                      <Text style={styles.manOver}>{o.over}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Partnerships</Text>
              {partnerships.map((p, i) => (
                <View key={i} style={styles.partnRow}>
                  <Text style={styles.partnLabel}>{p.batter_a} & {p.batter_b}</Text>
                  <View style={styles.partnBarWrap}>
                    <View style={[styles.partnBar, { width: `${Math.min(100, (p.runs / 100) * 100)}%` }]} />
                  </View>
                  <Text style={styles.partnVal}>{p.runs} ({p.balls})</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'fantasy' && predictedXi && (
          <>
            <Text style={styles.fantasyTitle}>AI Predicted XI</Text>
            <Text style={styles.fantasySub}>Based on recent form, venue history, and matchups</Text>
            {[predictedXi.team_a, predictedXi.team_b].map((s: any, i: number) => (
              <View key={i} style={styles.section}>
                <View style={styles.fantasyTeamHead}>
                  <View style={[styles.teamBadgeSm, { backgroundColor: s.team.primary }]}>
                    <Text style={styles.teamShortSm}>{s.team.short}</Text>
                  </View>
                  <Text style={styles.fantasyTeamName}>{s.team.name}</Text>
                </View>
                {s.impact_player && (
                  <View style={styles.impactCard}>
                    <Ionicons name="flash" size={14} color="#FFB020" />
                    <Text style={styles.impactLabel}>Impact Player Pick</Text>
                    <Text style={styles.impactName}>{s.impact_player.name}</Text>
                  </View>
                )}
                {s.playing_xi.map((p: any, j: number) => (
                  <TouchableOpacity key={j} style={styles.xiRow} onPress={() => router.push(`/player/${p.id}`)}>
                    <Text style={styles.xiNum}>{j + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.xiName}>{p.name}</Text>
                      <Text style={styles.xiRole}>{p.role}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}

        {tab === 'chat' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Live Fan Chat</Text>
              {chat.length === 0 ? (
                <Text style={styles.emptyTxt}>Be the first to comment</Text>
              ) : chat.map((c, i) => (
                <View key={i} style={styles.chatRow}>
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarTxt}>{c.user_name[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chatUser}>{c.user_name}</Text>
                    <Text style={styles.chatMsg}>{c.message}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.chatInputRow}>
                <TextInput style={styles.chatInput} value={chatInput} onChangeText={setChatInput} placeholder="Share your thoughts..." placeholderTextColor={colors.textTertiary} testID="chat-input" />
                <TouchableOpacity style={styles.chatSend} onPress={sendChat} testID="chat-send">
                  <Ionicons name="arrow-up" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function VenueStat({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.venueStat}>
      <Text style={styles.venueStatLabel}>{label}</Text>
      <Text style={styles.venueStatVal} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function UmpireRow({ u }: { u: any }) {
  return (
    <View style={styles.umpireRow}>
      <View style={styles.umpireIcon}>
        <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.umpireName}>{u.name}</Text>
        <Text style={styles.umpireMeta}>{u.country}</Text>
      </View>
      <Text style={styles.umpireRole}>{u.role_in_match}</Text>
    </View>
  );
}

function XIPlayerRow({ index, p }: { index: number; p: any }) {
  const [expanded, setExpanded] = React.useState(false);
  const c = p.career;
  return (
    <TouchableOpacity style={styles.xiCard} onPress={() => setExpanded(!expanded)} activeOpacity={0.8} testID={`xi-player-${p.id}`}>
      <View style={styles.xiCardHead}>
        <Text style={styles.xiNum}>{index}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={styles.xiName}>{p.name}</Text>
            {p.is_captain ? <Text style={styles.tag}>C</Text> : null}
            {p.is_keeper ? <Text style={[styles.tag, { backgroundColor: '#4A2FBD' }]}>WK</Text> : null}
          </View>
          <Text style={styles.xiRole}>{p.role} · {p.speciality}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
      </View>
      {expanded ? (
        <View style={styles.xiDetail}>
          <DetailRow label="Best fielding position" value={p.best_fielding_position} />
          <DetailRow label="Batting style" value={p.batting_style} />
          <DetailRow label="Bowling style" value={p.bowling_style} />

          <Text style={styles.xiSection}>Career averages</Text>
          {c.batting_avg ? (
            <View style={styles.xiStatRow}>
              <MiniStat label="Bat T20" value={c.batting_avg.T20} />
              <MiniStat label="Bat ODI" value={c.batting_avg.ODI} />
              <MiniStat label="Bat Test" value={c.batting_avg.Test} />
            </View>
          ) : null}
          {c.bowling_avg ? (
            <View style={styles.xiStatRow}>
              <MiniStat label="Bowl T20" value={c.bowling_avg.T20} />
              <MiniStat label="Bowl ODI" value={c.bowling_avg.ODI} />
              <MiniStat label="Bowl Test" value={c.bowling_avg.Test} />
            </View>
          ) : null}
          <View style={styles.xiStatRow}>
            <MiniStat label="MoTM" value={c.motm ?? 0} />
            <MiniStat label="MoS" value={c.mos ?? 0} />
            <MiniStat label="Catches" value={c.catches ?? 0} />
          </View>

          {c.wk_stats ? (
            <>
              <Text style={styles.xiSection}>Wicket-keeping</Text>
              <View style={styles.xiStatRow}>
                <MiniStat label="Dismissals" value={c.wk_stats.dismissals} />
                <MiniStat label="Stumpings" value={c.wk_stats.stumpings} />
                <MiniStat label="Catches (WK)" value={c.wk_stats.catches_behind} />
              </View>
            </>
          ) : null}

          <Text style={styles.xiSection}>At this venue</Text>
          <View style={styles.xiStatRow}>
            <MiniStat label="Matches" value={p.at_venue.matches} />
            <MiniStat label="Runs" value={p.at_venue.runs} />
            <MiniStat label="Best" value={p.at_venue.highest} />
          </View>
          <View style={styles.xiStatRow}>
            <MiniStat label="Avg" value={p.at_venue.avg} />
            <MiniStat label="SR" value={p.at_venue.sr} />
            <MiniStat label="Wkts" value={p.at_venue.wickets} />
          </View>

          <Text style={styles.xiSection}>Vs this opponent</Text>
          <View style={styles.xiStatRow}>
            <MiniStat label="Matches" value={p.vs_opponent.matches} />
            <MiniStat label="Runs" value={p.vs_opponent.runs} />
            <MiniStat label="Best" value={p.vs_opponent.highest} />
          </View>
          <View style={styles.xiStatRow}>
            <MiniStat label="Avg" value={p.vs_opponent.avg} />
            <MiniStat label="SR" value={p.vs_opponent.sr} />
            <MiniStat label="Wkts" value={p.vs_opponent.wickets} />
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailVal}>{value ?? '—'}</Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatVal}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  backBtn: { padding: 8 },
  bellBtn: { padding: 8 },
  topLeague: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },

  headCard: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.live },
  liveTxt: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.live, letterSpacing: 1 },

  teamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: spacing.md, marginTop: spacing.sm },
  teamCol: { flex: 1, alignItems: 'center' },
  teamBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  teamShort: { fontFamily: fonts.headingSemi, fontSize: 13, color: '#fff', letterSpacing: 0.5 },
  teamName: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary, marginBottom: 4, textAlign: 'center' },
  scoreBig: { fontFamily: fonts.headingBlack, fontSize: 30, color: colors.text, letterSpacing: -1 },
  oversTxt: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  vsBig: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textTertiary, letterSpacing: 1 },
  venueTxt: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: spacing.md },
  targetTxt: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text, marginTop: 6, letterSpacing: 1 },

  tabsRow: { paddingHorizontal: spacing.md, gap: 6, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.bgSecondary },
  tabActive: { backgroundColor: colors.text },
  tabTxt: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textSecondary },
  tabTxtActive: { color: '#fff' },

  section: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginBottom: spacing.sm, letterSpacing: -0.3 },

  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  playerName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  playerMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  playerScore: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, letterSpacing: -0.3 },
  strike: { color: colors.live },

  ballsRow: { flexDirection: 'row', gap: 6 },

  innHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  innTitle: { fontFamily: fonts.headingBlack, fontSize: 16, color: colors.text, letterSpacing: -0.5 },
  innTotal: { fontFamily: fonts.heading, fontSize: 16, color: colors.text },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6 },
  th: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', flex: 1 },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tdName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  tdDismiss: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 1 },
  td: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary, flex: 1, textAlign: 'center' },
  tdBold: { fontFamily: fonts.bodyBold, color: colors.text },
  extrasTxt: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 8 },
  fowTxt: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, paddingVertical: 3 },

  commentaryRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  ovPill: { width: 40, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  ovPillTxt: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textTertiary, letterSpacing: 0.5 },
  commDesc: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  commTxt: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },

  manhattan: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 140, paddingTop: spacing.sm },
  manBar: { flex: 1, alignItems: 'center', gap: 4 },
  manOver: { fontFamily: fonts.body, fontSize: 8, color: colors.textTertiary },

  partnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  partnLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, width: 120 },
  partnBarWrap: { flex: 1, height: 6, backgroundColor: colors.bgSecondary, borderRadius: 3, overflow: 'hidden' },
  partnBar: { height: '100%', backgroundColor: colors.text },
  partnVal: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text, width: 60, textAlign: 'right' },

  fantasyTitle: { fontFamily: fonts.headingBlack, fontSize: 20, color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  fantasySub: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginBottom: spacing.md },
  fantasyTeamHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  teamBadgeSm: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  teamShortSm: { fontFamily: fonts.headingSemi, fontSize: 11, color: '#fff' },
  fantasyTeamName: { fontFamily: fonts.heading, fontSize: 16, color: colors.text },
  impactCard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7E0', padding: 10, borderRadius: radius.md, marginBottom: spacing.md },
  impactLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#8B6A00', letterSpacing: 1, textTransform: 'uppercase' },
  impactName: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#111' },
  xiRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  xiNum: { fontFamily: fonts.headingBlack, fontSize: 14, color: colors.textTertiary, width: 20 },
  xiName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  xiRole: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },

  emptyTxt: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, fontStyle: 'italic', padding: spacing.md, textAlign: 'center' },
  chatRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  chatAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  chatAvatarTxt: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  chatUser: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text },
  chatMsg: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chatInputRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  chatInput: { flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.body, fontSize: 13, color: colors.text },
  chatSend: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },

  // Venue + Umpires + XI
  venueName: { fontFamily: fonts.heading, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  venueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  venueStat: { flex: 1, minWidth: '45%', backgroundColor: colors.bgSecondary, padding: 10, borderRadius: radius.md },
  venueStatLabel: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1, color: colors.textTertiary, textTransform: 'uppercase', marginBottom: 2 },
  venueStatVal: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text },

  umpireRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  umpireIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  umpireName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  umpireMeta: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 1 },
  umpireRole: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.5, color: colors.textTertiary, textTransform: 'uppercase' },

  xiCard: { backgroundColor: colors.bgSecondary, borderRadius: radius.md, padding: spacing.md, marginBottom: 6 },
  xiCardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#fff', backgroundColor: '#111418', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, letterSpacing: 0.5 },
  xiDetail: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  xiSection: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, color: colors.textTertiary, textTransform: 'uppercase', marginTop: spacing.sm, marginBottom: 6 },
  xiStatRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  miniStat: { flex: 1, backgroundColor: '#fff', borderRadius: radius.sm, padding: 8 },
  miniStatLabel: { fontFamily: fonts.bodyBold, fontSize: 8, letterSpacing: 0.5, color: colors.textTertiary, textTransform: 'uppercase' },
  miniStatVal: { fontFamily: fonts.headingBlack, fontSize: 15, color: colors.text, letterSpacing: -0.3, marginTop: 2 },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },
  detailVal: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text, flex: 1, textAlign: 'right' },
});
