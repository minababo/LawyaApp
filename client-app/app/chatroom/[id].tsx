import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform, Linking, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Message {
  id: number;
  sender_email: string;
  content: string;
  timestamp: string;
  file_url?: string;
  file_name?: string;
}

export default function Chatroom() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [otherName, setOtherName] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const fetchUserAndMessages = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) return;

    const [meRes, msgRes, nameRes] = await Promise.all([
      api.get('users/me/', { headers: { Authorization: `Token ${token}` } }),
      api.get(`chat/messages/${id}/`, { headers: { Authorization: `Token ${token}` } }),
      api.get(`chat/partner-name/${id}/`, { headers: { Authorization: `Token ${token}` } })
    ]);

    setUserEmail(meRes.data.email);
    setMessages(msgRes.data);
    setOtherName(nameRes.data.name);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = await SecureStore.getItemAsync('authToken');
    await api.post(`chat/messages/${id}/send/`, { content: newMessage }, {
      headers: { Authorization: `Token ${token}` }
    });
    setNewMessage('');
    fetchUserAndMessages();
  };

  const sendFile = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const file = picked.assets[0];

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);

    await api.post(`chat/messages/${id}/send/`, formData, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchUserAndMessages();
  };

  const handleSchedule = async (date: Date) => {
    setPickerVisible(false);
    const token = await SecureStore.getItemAsync('authToken');
    try {
      await api.patch(`chat/schedule/${id}/`, {
        meeting_time: date.toISOString()
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      Alert.alert('Meeting Scheduled', `Meeting set for ${date.toLocaleString()}`);
    } catch (err) {
      console.error('Meeting schedule failed:', err);
      Alert.alert('Error', 'Failed to schedule meeting');
    }
  };

  useEffect(() => {
    fetchUserAndMessages();
    const interval = setInterval(fetchUserAndMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderMessageContent = (msg: Message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if (msg.file_url) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(msg.file_url!)}>
          <Text style={styles.linkText}>📎 {msg.file_name || 'View File'}</Text>
        </TouchableOpacity>
      );
    }

    const parts = msg.content.split(urlRegex);
    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <Text key={index} style={styles.linkText} onPress={() => Linking.openURL(part)}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat with {otherName || '...'}</Text>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Ionicons name="calendar" size={22} color="#2980b9" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isMe = msg.sender_email === userEmail;
          return (
            <View
              key={msg.id}
              style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}
            >
              <Text style={styles.messageText}>{renderMessageContent(msg)}</Text>
              <Text style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        onConfirm={handleSchedule}
        onCancel={() => setPickerVisible(false)}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={sendFile} style={styles.attachBtn}>
          <Text style={styles.attachText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6A9FFA',
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
  },
  linkText: {
    color: '#0000FF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  attachBtn: {
    marginRight: 10,
  },
  attachText: {
    fontSize: 22,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#AFA2A2',
    borderRadius: 20,
    padding: 10,
  },
});
