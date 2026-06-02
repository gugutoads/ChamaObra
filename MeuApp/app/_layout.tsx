import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ animation: 'none' }}>
        <Stack.Screen name="escolherTipo" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="homeContratante" options={{ headerShown: false }} />
        <Stack.Screen name="homePrestador" options={{ headerShown: false }} />
        <Stack.Screen name="meusProjetos" options={{ headerShown: false }} />
        <Stack.Screen name="postarServico" options={{ headerShown: false }} />
        <Stack.Screen name="servicoDetalhe" options={{ headerShown: false }} />
        <Stack.Screen name="aceitarProposta" options={{ headerShown: false }} />
        <Stack.Screen name="enviarProposta" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="agendar" options={{ headerShown: false }} />
        <Stack.Screen name="contratante" options={{ headerShown: false }} />
        <Stack.Screen name="prestador" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}