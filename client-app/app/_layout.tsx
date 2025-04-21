import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Slot />
      <Toast />
    </SafeAreaProvider>
  );
}