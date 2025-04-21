import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

export default function ConsultationBooking() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [caseTypeOpen, setCaseTypeOpen] = useState(false);
  const [caseType, setCaseType] = useState(null);
  const [caseTypeItems, setCaseTypeItems] = useState([
    { label: 'Criminal', value: 'Criminal' },
    { label: 'Civil', value: 'Civil' },
    { label: 'Family', value: 'Family' },
    { label: 'Property', value: 'Property' },
    { label: 'Corporate', value: 'Corporate' },
  ]);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [title, setTitle] = useState('');

  const fetchLawyer = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const res = await api.get('users/lawyers/', {
        headers: { Authorization: `Token ${token}` },
      });

      const found = res.data.find((l: any) => l.id === Number(id));
      if (!found) throw new Error('Lawyer not found');
      setLawyer(found);
    } catch (err) {
      Alert.alert('Error', 'Failed to load lawyer');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    try {
      if (!caseType || !title) {
        return Alert.alert('Error', 'Please complete all fields.');
      }

      const token = await SecureStore.getItemAsync('authToken');

      await api.post('consultations/create/', {
        lawyer: lawyer.id,
        case_type: caseType,
        requested_time: date.toISOString(),
        title: title,
      }, {
        headers: { Authorization: `Token ${token}` },
      });

      Alert.alert('Success', 'Consultation request sent.');
      router.replace('/dashboard-client');
    } catch (err: any) {
      console.error('Booking error:', err.response?.data || err.message);
      Alert.alert('Error', 'Booking failed.');
    }
  };

  useEffect(() => {
    fetchLawyer();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? <Text>Loading...</Text> : (
        <>
          <View style={styles.lawyerCard}>
            <Text style={styles.lawyerName}>{lawyer.full_name}</Text>
            <Text style={styles.cpText}>1 CP/consult</Text>
            <Text style={styles.lawyerExpertise}>{lawyer.expertise}</Text>
          </View>

          <Text style={styles.label}>Type of Consultation</Text>
          <View style={{ zIndex: 1000, marginBottom: 20 }}>
            <DropDownPicker
              open={caseTypeOpen}
              setOpen={setCaseTypeOpen}
              value={caseType}
              setValue={setCaseType}
              items={caseTypeItems}
              setItems={setCaseTypeItems}
              placeholder="Select the primary practice Area"
              style={{ borderColor: '#ccc', borderRadius: 10 }}
              dropDownContainerStyle={{ borderColor: '#ccc', borderRadius: 10 }}
            />
          </View>

          <Text style={styles.label}>Preferred Date & Time</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Text>{date.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
            <Text>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(new Date(date.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate())));
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(e, selected) => {
                setShowTimePicker(false);
                if (selected) setDate(new Date(date.setHours(selected.getHours(), selected.getMinutes())));
              }}
            />
          )}

          <Text style={styles.label}>Consultation Title</Text>
          <TextInput
            placeholder="Enter a brief title for your consultation"
            value={title}
            onChangeText={setTitle}
            style={styles.description}
            multiline
          />

          <View style={styles.footerRow}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeAmount}>1 CP</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
              <Text style={styles.bookText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </>
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
  lawyerCard: {
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  lawyerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cpText: {
    color: 'blue',
    textAlign: 'right',
    fontWeight: '600',
  },
  lawyerExpertise: {
    fontSize: 14,
    color: '#666',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  dateInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  description: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    height: 120,
    marginBottom: 30,
    textAlignVertical: 'top',
  },
  footerRow: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 16,
    color: '#777',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  bookBtn: {
    backgroundColor: '#a39393',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bookText: {
    color: '#fff',
    fontWeight: '600',
  },
});