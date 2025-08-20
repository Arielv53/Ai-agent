import { ThemedView } from '@/components/ThemedView';
import { API_BASE } from '@/constants/config';
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
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.llmBubble]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatArea}
        inverted
      />

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c3d2e0ff',
  },
  chatArea: {
    padding: 10,
    flexGrow: 1,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#A1CEDC',
    alignSelf: 'flex-end',
  },
  llmBubble: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#1D3D47',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
