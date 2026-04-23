import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../../src/theme';
import { miscApi } from '../../src/api';

type Msg = { role: 'user' | 'ai'; text: string };

const SUGGESTIONS = [
  "What is Virat Kohli's IPL batting average?",
  "Who has the most sixes in IPL history?",
  "Compare Rohit Sharma vs Shubman Gill in T20s",
  "Who is likely to win IPL 2026?",
  "Best finishers in T20 cricket in 2025",
];

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: "Hi! I'm CricBot. Ask me anything about cricket — stats, records, predictions, or player comparisons." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setMsgs(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await miscApi.askAI(q);
      setMsgs(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't answer that. Please try again." }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.aiDot}><Ionicons name="sparkles" size={16} color="#fff" /></View>
          <View>
            <Text style={styles.title}>CricBot</Text>
            <Text style={styles.sub}>AI cricket analyst · Claude Sonnet 4.5</Text>
          </View>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        {msgs.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.user : styles.ai]}>
            <Text style={[styles.bubbleTxt, m.role === 'user' ? styles.userTxt : styles.aiTxt]}>{m.text}</Text>
          </View>
        ))}
        {loading ? (
          <View style={[styles.bubble, styles.ai]}>
            <ActivityIndicator color={colors.textTertiary} />
          </View>
        ) : null}

        {msgs.length <= 1 ? (
          <View style={styles.suggestWrap}>
            <Text style={styles.suggestLabel}>TRY ASKING</Text>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggest} onPress={() => send(s)} testID={`ai-suggest-${i}`}>
                <Text style={styles.suggestTxt}>{s}</Text>
                <Ionicons name="arrow-up-outline" size={14} color={colors.textTertiary} style={{ transform: [{ rotate: '45deg' }] }} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about any cricket stat..."
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          testID="ai-input"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => send()} disabled={loading} testID="ai-send-btn">
          <Ionicons name="arrow-up" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  aiDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.headingBlack, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  sub: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary },

  bubble: { padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, maxWidth: '88%' },
  user: { alignSelf: 'flex-end', backgroundColor: colors.text },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.bgSecondary },
  bubbleTxt: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  userTxt: { color: '#fff' },
  aiTxt: { color: colors.text },

  suggestWrap: { marginTop: spacing.lg, gap: spacing.sm },
  suggestLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary, marginBottom: 4 },
  suggest: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.bgSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  suggestTxt: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, flex: 1 },

  inputBar: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.bg, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12, fontFamily: fonts.body, fontSize: 14, color: colors.text, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
});
