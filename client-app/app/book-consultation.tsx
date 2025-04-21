import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';

interface Lawyer {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  expertise: string;
  location: string;
}

export default function BookConsultation() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expertiseItems, setExpertiseItems] = useState([
    { label: 'Criminal Law', value: 'criminal' },
    { label: 'Civil Law', value: 'civil' },
    { label: 'Family Law', value: 'family' },
    { label: 'Property Law', value: 'property' },
    { label: 'Corporate Law', value: 'corporate' },
  ]);

  const fetchLawyers = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return Alert.alert('Error', 'No token found');

      const res = await api.get('users/lawyers/', {
        headers: { Authorization: `Token ${token}` },
      });

      setLawyers(res.data);
      setFilteredLawyers(res.data);
    } catch (err) {
      console.error('Error fetching lawyers:', err);
      Alert.alert('Error', 'Failed to load lawyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  useEffect(() => {
    const filtered = lawyers.filter((lawyer) => {
      const nameMatch = lawyer.full_name.toLowerCase().includes(search.toLowerCase());
      const expertiseMatch = expertise ? lawyer.expertise === expertise : true;
      return nameMatch && expertiseMatch;
    });
    setFilteredLawyers(filtered);
  }, [search, expertise]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Find a Lawyer</Text>

      <TextInput
        placeholder="Search by name"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <View style={{ zIndex: 1000, marginBottom: 15, width: '100%' }}>
        <DropDownPicker
          open={dropdownOpen}
          setOpen={setDropdownOpen}
          value={expertise}
          setValue={setExpertise}
          items={expertiseItems}
          setItems={setExpertiseItems}
          placeholder="Filter by expertise"
          style={{ borderColor: '#ccc', borderRadius: 10 }}
          dropDownContainerStyle={{ borderColor: '#ccc', borderRadius: 10 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#333" />
      ) : filteredLawyers.length === 0 ? (
        <Text style={styles.empty}>No lawyers found.</Text>
      ) : (
        filteredLawyers.map((lawyer) => (
          <View key={lawyer.id} style={styles.card}>
            <Text style={styles.name}>{lawyer.full_name}</Text>
            <Text style={styles.info}>📧 {lawyer.email}</Text>
            <Text style={styles.info}>📞 {lawyer.phone_number}</Text>
            <Text style={styles.info}>💼 {lawyer.expertise}</Text>
            <Text style={styles.info}>📍 {lawyer.location}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: '/consult/[id]',
                  params: { id: String(lawyer.id) },
                })
              }
            >
              <Text style={styles.buttonText}>Book Consultation</Text>
            </TouchableOpacity>
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
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#a39393',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
    fontSize: 16,
  },
});