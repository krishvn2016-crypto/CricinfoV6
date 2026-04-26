Open: https://github.com/krishvn2016-crypto/CricinfoV6/blob/main/frontend/app/register.tsx
✏️ Edit → Ctrl+A → Delete → paste this exact code:
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../src/theme';
import { useAuth } from '../src/auth';

export default function Register() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !email || !pw) { Alert.alert('Missing', 'Please fill all fields'); return; }
    if (pw.length < 6) { Alert.alert('Password too short', 'Use at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(email.trim(), pw, name.trim());
      try { router.back(); } catch {}
      setTimeout(() => { try { router.replace('/(tabs)/home'); } catch {} }, 50);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Please try again';
      if (Platform.OS === 'web') {
        (typeof window !== 'undefined' && window.alert) ? window.alert('Registration failed: ' + msg) : Alert.alert('Registration failed', msg);
      } else {
        Alert.alert('Registration failed', msg);
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + spacing.xl }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Get personalized scores, follow your favourites, and never miss a wicket.</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textTertiary} testID="register-name" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@email.com" placeholderTextColor={colors.textTertiary} testID="register-email" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={pw} onChangeText={setPw} secureTextEntry placeholder="At least 6 characters" placeholderTextColor={colors.textTertiary} testID="register-password" />

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading} testID="register-submit">
          <Text style={styles.btnTxt}>{loading ? 'Creating...' : 'Create account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { router.back(); router.push('/login'); }} style={styles.switchBtn} testID="switch-login">
          <Text style={styles.switchTxt}>Already have an account? <Text style={styles.switchLink}>Log in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-end', padding: 8, marginBottom: spacing.lg },
  title: { fontFamily: fonts.headingBlack, fontSize: 32, color: colors.text, letterSpacing: -1 },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.textTertiary, marginTop: spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: colors.bgSecondary, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, fontFamily: fonts.body, fontSize: 15, color: colors.text },
  btn: { backgroundColor: colors.text, padding: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: spacing.xl },
  btnTxt: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 15 },
  switchBtn: { alignItems: 'center', marginTop: spacing.lg },
  switchTxt: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 13 },
  switchLink: { color: colors.text, fontFamily: fonts.bodyBold },
});
