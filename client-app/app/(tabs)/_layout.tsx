import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';
import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View,
  GestureResponderEvent,
} from 'react-native';

export default function TabsLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return;

      try {
        const res = await api.get('users/me/', {
          headers: { Authorization: `Token ${token}` },
        });
        setRole(res.data.role);
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  const handleLogout = async (e?: GestureResponderEvent) => {
    await SecureStore.deleteItemAsync('authToken');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName={role === 'client' ? 'dashboard-client' : 'dashboard-lawyer'}
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarActiveTintColor: '#2980b9',
        tabBarInactiveTintColor: '#777',
        headerShown: false,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home';

          switch (route.name) {
            case 'notifications':
              iconName = 'notifications';
              break;
            case 'profile':
              iconName = 'person';
              break;
            case 'logout':
              iconName = 'logout';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {role === 'client' && (
        <Tabs.Screen name="dashboard-client" options={{ title: 'Home' }} />
      )}
      {role === 'lawyer' && (
        <Tabs.Screen name="dashboard-lawyer" options={{ title: 'Home' }} />
      )}

      {/* HIDE the opposite dashboard tab */}
      {role === 'client' && (
        <Tabs.Screen name="dashboard-lawyer" options={{ href: null }} />
      )}
      {role === 'lawyer' && (
        <Tabs.Screen name="dashboard-client" options={{ href: null }} />
      )}

      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarButton: (props: any) => (
            <TouchableOpacity onPress={handleLogout}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                }}
              >
                <MaterialIcons
                  name="logout"
                  size={24}
                  color={props.accessibilityState?.selected ? '#2980b9' : '#777'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: props.accessibilityState?.selected ? '#2980b9' : '#777',
                  }}
                >
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
