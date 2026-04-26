import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, spacing, radius } from '../src/theme';
import { useAuth } from '../src/auth';

export default function Login() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pw) { Alert.alert('Missing', 'Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email.trim(), pw);
      try { router.back(); } catch {}
      setTimeout(() => { try { router.replace('/(tabs)/home'); } catch {} }, 50);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Please check your credentials';
      if (Platform.OS === 'web') {
        (typeof window !== 'undefined' && window.alert) ? window.alert('Login failed: ' + msg) : Alert.alert('Login failed', msg);
      } else {
        Alert.alert('Login failed', msg);
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Log in to follow teams, set alerts, and join the community.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@email.com" placeholderTextColor={colors.textTertiary} testID="login-email" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={pw} onChangeText={setPw} secureTextEntry placeholder="••••••••" placeholderTextColor={colors.textTertiary} testID="login-password" />

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading} testID="login-submit">
          <Text style={styles.btnTxt}>{loading ? 'Logging in...' : 'Log in'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { router.back(); router.push('/register'); }} style={styles.switchBtn} testID="switch-register">
          <Text style={styles.switchTxt}>New here? <Text style={styles.switchLink}>Create an account</Text></Text>
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
