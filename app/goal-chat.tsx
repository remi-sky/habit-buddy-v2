// app/(tabs)/goal-chat.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { sendMessageToGPT } from '../src/services/gpt';

export default function GoalChatScreen() {
    console.log('✅ GoalChatScreen rendering...');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! What would you like to improve or focus on in your life right now? For example: better sleep, being more present with family, building a morning routine...",
    },
  ]);

  console.log('✅ GoalChatScreen messages:', messages);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedGoals, setConfirmedGoals] = useState([]); // [{ topic: string, habit: string }]
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const detectConfirmedGoal = (text: string): { topic: string; habit: string } | null => {
    console.log('✅ Detecting confirmed goal in text:', text);
    const match = text.match(/\*\*Your new habit\*\*:.*\n\u2192\s*(.*)/);
    if (match && currentTopic) {
        console.log('✅ Confirmed goal detected:', match[1]);
      return { topic: currentTopic, habit: match[1].trim() };
    }
    console.log('❌ No confirmed goal detected');
    return null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    console.log('✅ Sending message:', input);
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGPT({
        userMessages: newMessages,
        confirmedGoals,
        currentTopic: currentTopic ?? undefined,
        awaitingConfirmation,
      });
      console.log('✅ GPT response:', response);
      const detected = detectConfirmedGoal(response);
      if (detected) {
        console.log('✅ Confirmed goal detected:', detected);
        setConfirmedGoals([...confirmedGoals, detected]);
        console.log('✅ Updated confirmed goals:', [...confirmedGoals, detected]);
        setCurrentTopic(null); // Reset or move to next topic if available
        setAwaitingConfirmation(false);
      }
      console.log('✅ Setting response:', response);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Oops! Something went wrong. Please try again." }]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {messages.map((msg, idx) => (
          <Text
            key={idx}
            style={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}>
            {msg.content}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What would you like to improve or change?"
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <Button title={isLoading ? '...' : 'Send'} onPress={handleSend} disabled={isLoading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  userMessage: {
    textAlign: 'right',
    marginVertical: 5,
    color: '#333',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
  },
  assistantMessage: {
    textAlign: 'left',
    marginVertical: 5,
    color: '#333',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginRight: 10,
    color: '#000',
  },
});
