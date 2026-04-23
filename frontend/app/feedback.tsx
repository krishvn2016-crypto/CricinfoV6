import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../src/theme';
import { miscApi } from '../src/api';
import { useAuth } from '../src/auth';

export default function Feedback() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!message.trim()) { Alert.alert('Share your thoughts', 'Please enter a message before submitting.'); return; }
    setSubmitting(true);
    try {
      await miscApi.submitFeedback(rating, message.trim(), email.trim() || undefined);
      Alert.alert('Thank you!', 'Your feedback has been received. We read every message.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Submission failed', 'Please try again in a moment.');
    }
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Send Feedback</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.intro}>Help us shape CricLive. What&apos;s working? What&apos;s missing?</Text>

        <Text style={styles.label}>How are we doing?</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setRating(n)} testID={`star-${n}`}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={32} color={n <= rating ? '#FFB020' : colors.textTertiary} style={{ marginHorizontal: 4 }} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Your message</Text>
        <TextInput
          style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Tell us what you love, what's broken, or what you wish we'd build next…"
          placeholderTextColor={colors.textTertiary}
          multiline
          testID="feedback-message"
        />

        {!user ? (
          <>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="feedback-email"
            />
          </>
        ) : null}

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting} testID="feedback-submit">
          <Text style={styles.btnTxt}>{submitting ? 'Sending…' : 'Send feedback'}</Text>
        </TouchableOpacity>

        <Text style={styles.fine}>Or email us directly at CricketRelgion@gmail.com</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  title: { fontFamily: fonts.headingBlack, fontSize: 18, color: colors.text, letterSpacing: -0.5 },
  intro: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.textTertiary, marginTop: spacing.md, marginBottom: 8, textTransform: 'uppercase' },
  stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md },
  input: { backgroundColor: colors.bgSecondary, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  btn: { backgroundColor: colors.text, padding: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: spacing.lg },
  btnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 15 },
  fine: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md },
});
