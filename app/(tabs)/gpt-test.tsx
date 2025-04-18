import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { sendMessageToGPT } from '../../src/services/openai';

export default function GPTTestScreen() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const result = await sendMessageToGPT(input);
    setResponse(result);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎯 GPT Test</Text>
      <TextInput
        style={styles.input}
        placeholder="Ask your AI coach something..."
        value={input}
        onChangeText={setInput}
      />
      <Button title={loading ? 'Thinking...' : 'Send'} onPress={handleSend} disabled={loading} />
      {response ? (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10 },
  responseBox: { marginTop: 20, padding: 15, backgroundColor: '#eee', borderRadius: 6 },
  responseLabel: { fontWeight: 'bold', marginBottom: 6 },
  responseText: { fontSize: 16 },
});