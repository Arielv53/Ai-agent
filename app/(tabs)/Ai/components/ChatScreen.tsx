import { API_BASE } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Message = {
  id: string;
  sender: 'user' | 'llm';
  content: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const tabBarHeight = useBottomTabBarHeight();

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input }),
        });

        const data = await res.json();

        const llmMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'llm',
            content: data.reply || '⚠️ No response from LLM.',
        };

        setMessages(prev => [...prev, llmMsg]);

        } catch (error) {
        const errMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'llm',
            content: '❌ Error contacting server.',
        };

    setMessages(prev => [...prev, errMsg]);
        }
    };


  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.llmBubble,
      ]}
    >
      <Text
        style={item.sender === 'user' ? styles.userText : styles.llmText}
      >
        {item.content}
      </Text>
    </View>
  );


  return (
    <LinearGradient
  colors={['#0a1829ff', '#083642ff', '#082F44', '#02040A']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.container}
>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container} keyboardVerticalOffset={tabBarHeight}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatArea}
      />

      <View style={[styles.inputContainer]}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#00c8ff" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatArea: {
    padding: 10,
    flexGrow: 1,
  },
  
  messageBubble: {  // message bubbles
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#000000ff',
    alignSelf: 'flex-end',
    borderColor: '#474848ff',
    borderWidth: 1,
  },
  llmBubble: {
    backgroundColor: '#00c8ffc9',
    alignSelf: 'flex-start',
  },
  userText: {
  fontSize: 17,
  color: '#ffffff',   // user text color
  fontWeight: '500',
},

llmText: {
  fontSize: 17,
  color: '#000000',   // llm text color
  fontWeight: '500',
},

  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#090909ff',
    backgroundColor: '#070707ff',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#062336',
    color: '#fff',
  },
  sendButton: {
    marginLeft: 5,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
