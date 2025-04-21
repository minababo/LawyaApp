import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';
import moment from 'moment';
import { router } from 'expo-router';

interface Consultation {
  id: number;
  title?: string;
  case_type: string;
  status?: string;
  requested_time: string;
  scheduled_time?: string;
  client_email: string;
  client_name?: string;
}

export default function LawyerDashboard() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [lawyerName, setLawyerName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return Alert.alert('Error', 'No token found');

      const consultationRes = await api.get('consultations/lawyer/', {
        headers: { Authorization: `Token ${token}` },
      });

      const meRes = await api.get('users/me/', {
        headers: { Authorization: `Token ${token}` },
      });

      if (meRes.data.role === 'lawyer') {
        try {
          const profileRes = await api.get('users/lawyer-profile/', {
            headers: { Authorization: `Token ${token}` },
          });
          setLawyerName(profileRes.data.full_name || meRes.data.email);
        } catch {
          setLawyerName(meRes.data.email);
        }
      }

      setConsultations(consultationRes.data);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      Alert.alert('Error', 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      await api.patch(`consultations/update/${id}/`, { status }, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Could not update consultation status');
    }
  };

  const renderStatus = (status?: string) => {
    if (!status) return <Text style={[styles.status, { color: '#999' }]}>Unknown</Text>;
  
    let color = '#888';
    if (status === 'pending') color = 'blue';
    else if (status === 'accepted') color = 'green';
    else if (status === 'rejected') color = 'red';
  
    return <Text style={[styles.status, { color }]}>{status.toUpperCase()}</Text>;
  };  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hi, {lawyerName} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Consultations</Text>
        <Text style={styles.cardNumber}>{consultations.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Consultation Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#444" />
      ) : consultations.length === 0 ? (
        <Text style={styles.empty}>No consultation requests found.</Text>
      ) : (
        consultations.map((c) => (
          <View key={c.id} style={styles.requestCard}>
            <View style={styles.cardRow}>
              <Text style={styles.clientName}>{c.client_name || c.client_email}</Text>
              {renderStatus(c.status)}
            </View>
            {c.title && <Text style={styles.titleText}>📌 {c.title}</Text>}
            <Text style={styles.caseType}>📝 {c.case_type}</Text>
            <Text style={styles.requestTime}>
              📅 {c.scheduled_time
                ? moment(c.scheduled_time).format('LLLL')
                : moment(c.requested_time).format('LLLL')}
            </Text>

            
            {c.status === 'accepted' && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push(`/chatroom/${c.id}`)}
              >
                <Text style={styles.chatBtnText}>Open Chat</Text>
              </TouchableOpacity>
            )}

            {c.status === 'pending' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => updateStatus(c.id, 'accepted')}
                >
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => updateStatus(c.id, 'rejected')}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 30,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#222',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 30,
  },
  requestCard: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  caseType: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
  },
  requestTime: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  acceptBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  chatBtn: {
    backgroundColor: '#AFA2A2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  chatBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 15,
    color: '#222',
    marginTop: 4,
    fontWeight: '500',
  },  
});