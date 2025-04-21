import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import moment from 'moment';
import Toast from 'react-native-toast-message';

interface Consultation {
  id: number;
  title: string;
  case_type: string;
  status: string;
  requested_time: string;
  lawyer_name: string;
}

export default function ClientDashboard() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [cpBalance, setCpBalance] = useState<number>(0);
  const [clientName, setClientName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return Alert.alert('Error', 'No token found');

      const [consultRes, cpRes, meRes, profileRes] = await Promise.all([
        api.get('consultations/client/', { headers: { Authorization: `Token ${token}` } }),
        api.get('consultations/points/', { headers: { Authorization: `Token ${token}` } }),
        api.get('users/me/', { headers: { Authorization: `Token ${token}` } }),
        api.get('users/client-profile/', { headers: { Authorization: `Token ${token}` } }),
      ]);

      setConsultations(consultRes.data);
      setCpBalance(cpRes.data.balance);
      setClientName(profileRes.data.full_name || meRes.data.email);

    } catch (err) {
      console.error('Error loading client dashboard:', err);
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
    
  };

  const handleAddCP = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return Alert.alert('Error', 'No token found');

      const res = await api.post('consultations/points/', {}, {
        headers: { Authorization: `Token ${token}` }
      });

      setCpBalance(res.data.balance);
    } catch (err) {
      console.error('Error adding CP:', err);
      Alert.alert('Error', 'Failed to add CP');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hi, {clientName} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Consultation Points</Text>
        <Text style={styles.cardNumber}>{cpBalance}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddCP}>
          <Text style={styles.addBtnText}>Purchase CP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.bookBtn,
          cpBalance === 0 && { backgroundColor: '#ccc' },
        ]}
        onPress={() => {
          if (cpBalance === 0) {
            Alert.alert('Insufficient CP', 'You need at least 1 Consultation Point to book.');
          } else {
            router.push('/book-consultation');
          }
        }}
        disabled={cpBalance === 0}
      >
        <Text style={styles.bookBtnText}>+ Book Consultation</Text>
      </TouchableOpacity>


      <Text style={styles.sectionTitle}>Your Consultations</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : consultations.length === 0 ? (
        <Text style={styles.empty}>No consultations yet.</Text>
      ) : (
        consultations.map((c) => (
          <View key={c.id} style={styles.consultCard}>
            <Text style={styles.consultTitle}>{c.title}</Text>
            <Text style={styles.consultInfo}>Type: {c.case_type}</Text>
            <Text style={styles.consultInfo}>Lawyer: {c.lawyer_name}</Text>
            <Text style={styles.consultInfo}>Status: {c.status}</Text>
            <Text style={styles.consultInfo}>Requested: {moment(c.requested_time).fromNow()}</Text>
            {c.status === 'accepted' && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push(`/chatroom/${c.id}`)}
              >
                <Text style={styles.chatText}>Go to Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  addBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: '#AFA2A2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  consultCard: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  consultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  consultInfo: {
    fontSize: 14,
    color: '#555',
  },
  chatBtn: {
    backgroundColor: '#AFA2A2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  chatText: {
    color: '#fff',
    fontWeight: '600',
  },  
});