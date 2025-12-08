import { API_BASE } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


type Message = {
  id: string;
  sender: 'user' | 'llm';
  content: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const typingSpeed = 20;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ fontSize: 30 }}>🤖</Text>   
      ),
      headerTitleAlign: "center",
      headerTintColor: "#d7f8ff",
      headerStyle: { backgroundColor: "#02131f"}, 
      headerShadowVisible: true,
    });
  }, [navigation]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Add LLM placeholder message immediately
        const typingId = (Date.now() + 1).toString();
        setMessages(prev => [
          ...prev,
          { id: typingId, sender: "llm", content: "" }  // ← placeholder
        ]);

        try {
            const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input }),
        });

        const data = await res.json();

        // Instead of instantly adding llmMsg, animate it:
        const fullText = data.reply || "⚠️ No response from LLM.";

        let i = 0;
        const interval = setInterval(() => {
          i++;
          setMessages(prev =>
            prev.map(m =>
              m.id === typingId ? { ...m, content: fullText.slice(0, i) } : m
            )
          );

          if (i >= fullText.length) {
            clearInterval(interval);
          }
        }, typingSpeed);


        } catch (error) {
          const errorText = "❌ Error contacting server.";
          let i = 0;

          const interval = setInterval(() => {
            i++;
            setMessages(prev =>
              prev.map(m =>
                m.id === typingId ? { ...m, content: errorText.slice(0, i) } : m
              )
            );

            if (i >= errorText.length) clearInterval(interval);
          }, typingSpeed);
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
      colors={['#0a1829ff', '#072c35ff', '#082F44', '#02040A']}
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

        {/* ⭐ NEW SECTION (Intro text + suggestion pills) */}
      <View style={styles.promptContainer}>
        <Text style={styles.promptTitle}>How may i assist you?</Text>
        <Text style={styles.promptSubtitle}>
          Every question is a step toward better fishing.
        </Text>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionScroll}
        >
          {["Where should I fish today?", "Best bait this month", "When do fish bite most?"].map(
            (text, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => setInput(text)}
              >
                <Text style={styles.suggestionText}>{text}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

        <View style={[styles.inputContainer]}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything"
            placeholderTextColor="#c6c5c5ff"
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
    backgroundColor: '#09203b5a',
    alignSelf: 'flex-end',
    borderColor: '#0f626270',
    borderWidth: 1,
  },
  llmBubble: {
    backgroundColor: '#65d9f914',
    alignSelf: 'flex-start',
    borderColor: '#3bc8fc45',
    borderWidth: 1,
  },
  userText: {
  fontSize: 16,
  color: '#ffffff',   // user text color
  fontWeight: '500',
},

llmText: {
  fontSize: 16,
  color: '#ffffffe5',   // llm text color
  fontWeight: '500',
},
promptContainer: {
  paddingHorizontal: 16,
  paddingBottom: 10,
},

promptTitle: {
  color: "#e8faffdb",
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 10,
  textAlign: "center",
},

promptSubtitle: {
  color: "#b4d7e5",
  fontSize: 14,
  marginBottom: 35,
  textAlign: "center",
},

suggestionScroll: {
  marginBottom: 8,
},

suggestionChip: {
  backgroundColor: "#ffffff07",
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 20,
  marginRight: 10,
  borderWidth: 1,
  borderColor: "#06a7e233",
},

suggestionText: {
  color: "#e8faffdd",
  fontSize: 14,
  fontWeight: "500",
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
    fontSize: 16,
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
