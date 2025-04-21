import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

interface UserProfileClient {
  full_name: string;
  phone_number: string;
  nic_number: string;
  profile_picture?: string | null;
}

interface UserProfileLawyer extends UserProfileClient {
  expertise: string;
  location: string;
  approved: boolean;
}

export default function ProfileScreen() {
  const [role, setRole] = useState<'client' | 'lawyer' | null>(null);
  const [profile, setProfile] = useState<UserProfileClient | UserProfileLawyer | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [newImage, setNewImage] = useState<any>(null);
  const router = useRouter();

  const expertiseOptions = [
    { label: 'Criminal Law', value: 'criminal' },
    { label: 'Civil Law', value: 'civil' },
    { label: 'Family Law', value: 'family' },
    { label: 'Property Law', value: 'property' },
    { label: 'Corporate Law', value: 'corporate' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) return;

    try {
      const meRes = await api.get('users/me/', {
        headers: { Authorization: `Token ${token}` },
      });
      setRole(meRes.data.role);
      setEmail(meRes.data.email);

      const endpoint = meRes.data.role === 'lawyer'
        ? 'users/lawyer-profile/'
        : 'users/client-profile/';

      const profileRes = await api.get(endpoint, {
        headers: { Authorization: `Token ${token}` },
      });

      setProfile(profileRes.data);
      setForm(profileRes.data);
    } catch (error) {
      console.error('Profile fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow media access to change profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    const endpoint = role === 'lawyer'
      ? 'users/lawyer-profile/'
      : 'users/client-profile/';

    const data = new FormData();
    data.append('full_name', form.full_name);
    data.append('phone_number', form.phone_number);
    data.append('nic_number', form.nic_number);
    if (role === 'lawyer') {
      data.append('expertise', form.expertise);
      data.append('location', form.location);
    }

    if (newImage) {
      data.append('profile_picture', {
        uri: newImage.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
    }

    try {
      await api.patch(endpoint, data, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setEditing(false);
      setNewImage(null);
      fetchProfile();
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Update failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>Could not load profile.</Text>
      </View>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {newImage || profile.profile_picture ? (
          <Image source={{ uri: newImage?.uri || profile.profile_picture! }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <Text style={styles.avatarNote}>Tap to change profile picture</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        {renderField('Full Name', 'full_name')}
        {renderStaticField('Email', email)}
        {renderField('Phone Number', 'phone_number')}
        {renderField('NIC', 'nic_number')}

        {role === 'lawyer' && (
          <>
            <Text style={styles.label}>Expertise</Text>
            {editing ? (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.expertise}
                  onValueChange={(value) => setForm({ ...form, expertise: value })}
                  style={styles.picker}
                >
                  {expertiseOptions.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            ) : (
              <Text style={styles.value}>{form.expertise}</Text>
            )}
            <View style={styles.divider} />

            {renderField('Location', 'location')}
            {renderStaticField('Approved', (profile as UserProfileLawyer).approved ? 'Yes' : 'No')}
          </>
        )}
      </View>

      <View style={styles.buttonRow}>
        {editing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: '#888' }]}
            onPress={() => {
              setEditing(false);
              setForm(profile);
              setNewImage(null);
            }}
          >
            <Text style={styles.editButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={editing ? handleSave : () => setEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  function renderField(label: string, key: string) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        {editing ? (
          <TextInput
            style={styles.inputUnderline}
            value={form[key]}
            onChangeText={(v) => setForm({ ...form, [key]: v })}
            placeholder={`Enter ${label}`}
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
          />
        ) : (
          <Text style={styles.value}>{form[key]}</Text>
        )}
        <View style={styles.divider} />
      </>
    );
  }

  function renderStaticField(label: string, value: string) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.divider} />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#aaa',
  },
  avatarFallback: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#111',
    marginTop: 4,
    marginBottom: 10,
  },
  inputUnderline: {
    fontSize: 16,
    color: '#111',
    paddingVertical: 6,
    marginBottom: 10,
    borderBottomWidth: 0,  
    borderColor: 'transparent', 
    backgroundColor: '#transparent',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 6,
  },
  pickerWrapper: {
    borderBottomWidth: 1,
    borderColor: '#bbb',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  picker: {
    height: 52,
    width: '100%',
    fontSize: 16, 
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#AFA2A2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
