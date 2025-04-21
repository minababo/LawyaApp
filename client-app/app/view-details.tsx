// client-app/app/view-details.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment';

interface Consultation {
  id: number;
  description: string;
  case_type: string;
  requested_time: string;
  status: string;
  client_email: string;
  client_name?: string;
}

export default function ViewDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSingleConsultation = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return Alert.alert('Error', 'Token not found');

      const res = await api.get(`consultations/detail/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setConsultation(res.data);
    } catch (err) {
      console.error('Fetch detail error:', err);
      Alert.alert('Error', 'Could not load consultation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSingleConsultation();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  if (!consultation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Consultation not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{consultation.description}</Text>

      <Text style={styles.label}>Client:</Text>
      <Text style={styles.text}>{consultation.client_name || consultation.client_email}</Text>

      <Text style={styles.label}>Case Type:</Text>
      <Text style={styles.text}>{consultation.case_type}</Text>

      <Text style={styles.label}>Requested Time:</Text>
      <Text style={styles.text}>{moment(consultation.requested_time).format('LLLL')}</Text>

      <Text style={styles.label}>Status:</Text>
      <Text style={styles.text}>{consultation.status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    color: '#34495e',
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    color: '#555',
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
});