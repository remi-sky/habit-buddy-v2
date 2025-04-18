import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { sendMessageToGPT } from '../src/services/openai';

export default function GoalChatScreen() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSend = async () => {
    if (!input.trim()) return;

    console.log('🧠 Prompting GPT with:', input);
    setLoading(true);
    const result = await sendMessageToGPT(input);
    console.log('🤖 GPT replied:', result);
    setResponse(result);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🎯 Goal Framing Test Chat</Text>

      <TextInput
  style={[
    styles.input,
    { backgroundColor: isDark ? '#1c1c1e' : '#fff', color: isDark ? '#fff' : '#000' },
  ]}
  placeholder="What would you like to improve, change, or focus on in your life?"
  placeholderTextColor={isDark ? '#888' : '#aaa'}
  value={input}
  onChangeText={setInput}
  editable={!loading}
/>

      <Button title={loading ? 'Thinking...' : 'Send'} onPress={handleSend} disabled={loading} />

      {response !== '' && (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  responseBox: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  responseLabel: { fontWeight: 'bold', marginBottom: 6 },
  responseText: { fontSize: 16 },
});