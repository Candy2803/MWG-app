import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('user1'); // Example: the local user's ID

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('messages');
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (message.trim() !== '') {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: userId, // Store the sender's ID
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Store messages in AsyncStorage
      try {
        await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      } catch (error) {
        console.error('Failed to save messages:', error);
      }

      setMessage('');
    }
  };

  const renderMessage = ({ item }) => {
    const isSender = item.sender === userId; // Check if the message is from the sender
    return (
      <View
        style={[
          styles.message,
          isSender ? styles.senderMessage : styles.receiverMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isSender ? styles.senderText : styles.receiverText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.chatContainer}>
          <Text style={styles.title}>Chat</Text>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Icon name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-end', // Ensures the input bar stays at the bottom
  },
  chatContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end', // Keeps messages at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
  },
  senderMessage: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-start', // Align the sender's message to the right
  },
  receiverMessage: {
    backgroundColor: 'purple',
    alignSelf: 'flex-end', // Align the receiver's message to the left
  },
  messageText: {
    fontSize: 16,
  },
  senderText: {
    color: 'black',
  },
  receiverText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
    marginBottom: 50,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
});

export default ChatPage;
