import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../src/theme';

export default function About() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }} testID="back-btn">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>About CricLive</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.hero}>
          <View style={styles.logo}><Ionicons name="tennisball" size={28} color="#fff" /></View>
          <Text style={styles.heroTitle}>CricLive</Text>
          <View style={styles.beta}><Text style={styles.betaTxt}>BETA · v1.0.0</Text></View>
        </View>

        <Text style={styles.para}>
          CricLive is the most fan-first cricket companion for IPL 2026 and the ICC Men&apos;s T20 World Cup 2026.
          Built by cricket fans for cricket fans — we deliver ultra-fast live scores, ball-by-ball commentary with shot analytics,
          AI-powered match insights, and a community of passionate supporters.
        </Text>

        <Text style={styles.sectionTitle}>What we do</Text>
        <Bullet text="Real-time ball-by-ball scores (WebSocket, &lt;2s latency)" />
        <Bullet text="Interactive scorecards, Manhattan & partnership charts" />
        <Bullet text="AI stats analyst powered by Claude Sonnet 4.5" />
        <Bullet text="Playing XI deep-dive with player-vs-venue & head-to-head records" />
        <Bullet text="Follow your favourite teams & players, set smart alerts" />

        <Text style={styles.sectionTitle}>Contact us</Text>
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('mailto:CricketRelgion@gmail.com')} testID="email-support-btn">
          <Ionicons name="mail-outline" size={18} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>CricketRelgion@gmail.com</Text>
          </View>
          <Ionicons name="open-outline" size={14} color={colors.textTertiary} />
        </TouchableOpacity>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Address</Text>
            <Text style={styles.rowValue}>Mumbai, India</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>App version</Text>
            <Text style={styles.rowValue}>1.0.0-beta</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick links</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/terms')} testID="terms-link">
          <Text style={styles.linkTxt}>Terms &amp; Conditions</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/feedback')} testID="feedback-link">
          <Text style={styles.linkTxt}>Send feedback</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        <Text style={styles.footer}>© 2026 CricLive · Made with ♥ in Mumbai</Text>
      </ScrollView>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletTxt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title: { fontFamily: fonts.headingBlack, fontSize: 18, color: colors.text, letterSpacing: -0.5 },
  hero: { alignItems: 'center', padding: spacing.xl, gap: 6 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  heroTitle: { fontFamily: fonts.headingBlack, fontSize: 28, color: colors.text, letterSpacing: -1 },
  beta: { backgroundColor: '#FFB020', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginTop: 4 },
  betaTxt: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#fff', letterSpacing: 1 },

  para: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginVertical: spacing.md },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 15, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: -0.3 },

  bullet: { flexDirection: 'row', gap: spacing.sm, marginBottom: 6 },
  bulletDot: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  bulletTxt: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 20 },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 6 },
  rowLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  rowValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, marginTop: 2 },

  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.bgSecondary, borderRadius: radius.lg, marginBottom: 6 },
  linkTxt: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },

  footer: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
});
