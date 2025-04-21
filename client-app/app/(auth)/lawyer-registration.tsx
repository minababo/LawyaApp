import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import DropDownPicker from 'react-native-dropdown-picker';

export default function LawyerRegistration() {
  const [fullName, setFullName] = useState('');
  const [nic, setNIC] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState<DocumentPickerAsset | null>(null);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.assets && result.assets.length > 0) {
      setDocument(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', 'lawyer');

      formData.append('full_name', fullName);
      formData.append('phone_number', phone);
      formData.append('nic_number', nic);
      formData.append('expertise', expertise);
      formData.append('location', location);

      if (document) {
        formData.append('qualifications', {
          uri: document.uri,
          name: document.name ?? 'document.pdf',
          type: document.mimeType || 'application/pdf',
        } as unknown as Blob);
      }
      

      await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      Alert.alert('Success', 'Registration submitted. Await admin approval.');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Lawyer registration error:', error);
      Alert.alert('Registration failed', 'Please check the form and try again.');
    }
  };

  const [expertiseOpen, setExpertiseOpen] = useState(false);
const [expertiseItems, setExpertiseItems] = useState([
  { label: 'Criminal Law', value: 'criminal' },
  { label: 'Civil Law', value: 'civil' },
  { label: 'Family Law', value: 'family' },
  { label: 'Property Law', value: 'property' },
  { label: 'Corporate Law', value: 'corporate' },
]);


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('@/assets/images/lawyalogo.png')} style={styles.logo} />
        <Text style={styles.title}>Register as Lawyer</Text>

        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="NIC Number" value={nic} onChangeText={setNIC} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <View style={{ zIndex: 1000, marginBottom: 15, width: '100%' }}>
          <DropDownPicker
            open={expertiseOpen}
            setOpen={setExpertiseOpen}
            value={expertise}
            setValue={setExpertise}
            items={expertiseItems}
            setItems={setExpertiseItems}
            placeholder="Select Expertise"
            style={{
              borderColor: '#ccc',
              borderRadius: 10,
            }}
            textStyle={{
              fontSize: 16,
            }}
            dropDownContainerStyle={{
              borderColor: '#ccc',
              borderRadius: 10,
            }}
          />
        </View>


        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />

        <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
          <Text style={styles.buttonText}>
            {document ? 'Document Selected' : 'Upload Certifications'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#dedede',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#AFA2A2',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pickerWrapper: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },  
});