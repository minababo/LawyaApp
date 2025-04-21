import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  status: 'info' | 'success' | 'danger';
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return;

      try {
        const res = await api.get('consultations/notifications/', {
          headers: { Authorization: `Token ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications found.</Text>
      ) : (
        notifications.map((notif) => (
          <View key={notif.id} style={[styles.card, styles[notif.status]]}>
            <Text style={styles.message}>{notif.message}</Text>
            <Text style={styles.timestamp}>{new Date(notif.timestamp).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },
  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 6,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#f0f0f0',
  },
  info: {
    backgroundColor: '#3498db',
  },
  success: {
    backgroundColor: '#2ecc71',
  },
  danger: {
    backgroundColor: '#e74c3c',
  },
});
