import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!user && inAuthGroup) {
      router.replace('/login' as any);
    } else if (user && !inAuthGroup && (segments[0] === 'login' || segments[0] === 'register')) {
      router.replace('/(tabs)' as any);
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#eab308" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' }, // tailwind gray-900
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#030712' }, // tailwind gray-950
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="movie/[id]" options={{ title: 'Movie Details' }} />
        <Stack.Screen name="seats/[id]" options={{ title: 'Select Seats' }} />
        <Stack.Screen name="summary" options={{ title: 'Booking Summary' }} />
        <Stack.Screen name="confirmation" options={{ title: 'Ticket Confirmed', headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

