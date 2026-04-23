import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '../src/theme';

export default function Terms() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Terms &amp; Conditions</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.updated}>Last updated: April 2026</Text>

        <Text style={styles.h2}>1. Acceptance of terms</Text>
        <Text style={styles.p}>By accessing or using CricLive ("the App"), you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree, please do not use the App.</Text>

        <Text style={styles.h2}>2. Beta status</Text>
        <Text style={styles.p}>CricLive is currently offered as a BETA product. Features, data, and interfaces may change, be added, or removed without notice. Live cricket data is served from curated demo datasets during beta; accuracy may vary from real-world fixtures. We assume no liability for decisions taken based on this data.</Text>

        <Text style={styles.h2}>3. 7-Day free trial</Text>
        <Text style={styles.p}>New users receive a 7-day complimentary Pro trial with unlimited access to Ask AI. After the trial, free users are limited to 5 Ask AI queries per day. You may purchase additional query packs (5 queries for ₹100) or continue using the free tier.</Text>

        <Text style={styles.h2}>4. Payments</Text>
        <Text style={styles.p}>Payments are processed securely via Razorpay (currently in test mode during beta — no real charges are made). Purchased AI query packs are non-refundable and non-transferable. In the event of a verified payment failure where credits were not granted, please contact support at CricketRelgion@gmail.com within 7 days.</Text>

        <Text style={styles.h2}>5. User content</Text>
        <Text style={styles.p}>You retain ownership of any content you post (e.g., chat messages, feedback). By posting, you grant CricLive a worldwide, royalty-free licence to display such content within the App. You agree not to post unlawful, harassing, or defamatory content. We reserve the right to remove any content and suspend accounts that violate these terms.</Text>

        <Text style={styles.h2}>6. Intellectual property</Text>
        <Text style={styles.p}>All trademarks, team logos, player images, and tournament names (including IPL and ICC T20 World Cup) remain the property of their respective owners. CricLive claims no affiliation with or endorsement by these entities.</Text>

        <Text style={styles.h2}>7. Personal data</Text>
        <Text style={styles.p}>We collect your email, name, and in-app activity (follows, alerts, chat, poll votes) to provide and improve the service. We do not sell your data. You may request account deletion by emailing support.</Text>

        <Text style={styles.h2}>8. Limitation of liability</Text>
        <Text style={styles.p}>CricLive and its operators are not liable for any indirect, incidental, or consequential damages arising out of your use of the App. The App is provided on an "as-is" basis without warranties of any kind.</Text>

        <Text style={styles.h2}>9. Changes to these terms</Text>
        <Text style={styles.p}>We may revise these Terms at any time. Continued use of the App after changes constitutes acceptance of the updated Terms.</Text>

        <Text style={styles.h2}>10. Contact</Text>
        <Text style={styles.p}>For any questions or concerns:{'\n'}Email: CricketRelgion@gmail.com{'\n'}Address: Mumbai, India</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title: { fontFamily: fonts.headingBlack, fontSize: 18, color: colors.text, letterSpacing: -0.5 },
  updated: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginBottom: spacing.md },
  h2: { fontFamily: fonts.heading, fontSize: 15, color: colors.text, marginTop: spacing.md, marginBottom: 6, letterSpacing: -0.3 },
  p: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
});
