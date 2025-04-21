import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Logout() {
  useEffect(() => {
    router.replace('/(auth)/login');
  }, []);

  return null;
}