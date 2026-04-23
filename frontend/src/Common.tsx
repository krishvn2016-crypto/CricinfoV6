import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from './theme';

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Pill({ label, color = colors.primary, bg = colors.bgSecondary }: { label: string; color?: string; bg?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function BallCircle({ runs, wicket }: { runs: number; wicket?: boolean }) {
  let bg = colors.bgSecondary;
  let txt = colors.text;
  if (wicket) { bg = colors.wicket; txt = '#fff'; }
  else if (runs === 6) { bg = colors.six; txt = '#fff'; }
  else if (runs === 4) { bg = colors.four; txt = '#fff'; }
  else if (runs === 0) { bg = colors.bgSecondary; txt = colors.textTertiary; }
  const label = wicket ? 'W' : String(runs);
  return (
    <View style={[styles.ball, { backgroundColor: bg }]}>
      <Text style={[styles.ballTxt, { color: txt }]}>{label}</Text>
    </View>
  );
}

export function WinMeter({ aPct, bPct, aColor, bColor, aShort, bShort }: { aPct: number; bPct: number; aColor: string; bColor: string; aShort: string; bShort: string }) {
  return (
    <View style={styles.winWrap}>
      <View style={styles.winHeader}>
        <Text style={styles.winLabel}>{aShort} {aPct}%</Text>
        <Text style={styles.winLabel}>{bShort} {bPct}%</Text>
      </View>
      <View style={styles.winBarRow}>
        <View style={{ flex: aPct, backgroundColor: aColor, height: '100%', borderTopLeftRadius: 999, borderBottomLeftRadius: 999 }} />
        <View style={{ flex: bPct, backgroundColor: bColor, height: '100%', borderTopRightRadius: 999, borderBottomRightRadius: 999 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl, marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  ball: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  ballTxt: { fontFamily: fonts.bodyBold, fontSize: 12 },
  winWrap: { paddingHorizontal: spacing.lg, marginVertical: spacing.md },
  winHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  winLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text },
  winBarRow: { flexDirection: 'row', height: 10, backgroundColor: colors.bgSecondary, borderRadius: 999, overflow: 'hidden' },
});
