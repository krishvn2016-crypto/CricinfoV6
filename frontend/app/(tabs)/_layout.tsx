
📤 Update _layout.tsx on GitHub
Go to: https://github.com/krishvn2016-crypto/CricinfoV6/blob/main/frontend/app/_layout.tsx

Click the pencil ✏️ "Edit this file" icon.

Select all (Ctrl+A) → Delete existing content.

Paste this complete new content:

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Outfit_600SemiBold, Outfit_800ExtraBold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth';
import { colors } from '../src/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  // Fallback: don't block app rendering forever if fonts fail (common Expo Web issue)
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!fontsLoaded && !fontTimeout) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="register" options={{ presentation: 'modal' }} />
          <Stack.Screen name="match/[id]" />
          <Stack.Screen name="player/[id]" />
          <Stack.Screen name="team/[id]" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="about" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="feedback" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
