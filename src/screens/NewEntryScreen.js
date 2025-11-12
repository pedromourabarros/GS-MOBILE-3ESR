import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
} from 'react-native-paper';
import { saveEntry, getEntries } from '../services/storage';
import { getPersonalizedMotivationalMessage } from '../utils/motivationalMessages';

/**
 * Tela para criar um novo registro de bem-estar
 * Permite registrar humor, nível de estresse e um comentário opcional
 */
const NewEntryScreen = ({ navigation }) => {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Opções para o humor (1-5)
  const moodOptions = [
    { value: 1, label: '😢', text: '1' },
    { value: 2, label: '😔', text: '2' },
    { value: 3, label: '😐', text: '3' },
    { value: 4, label: '🙂', text: '4' },
    { value: 5, label: '😊', text: '5' },
  ];

  // Opções para o estresse (1-5)
  const stressOptions = [
    { value: 1, label: '🟢', text: '1' },
    { value: 2, label: '🟡', text: '2' },
    { value: 3, label: '🟠', text: '3' },
    { value: 4, label: '🔴', text: '4' },
    { value: 5, label: '⚫', text: '5' },
  ];

  // Salva o registro
  const handleSave = async () => {
    if (!mood || !stress) {
      Alert.alert('Atenção', 'Por favor, selecione o humor e o nível de estresse.');
      return;
    }

    setLoading(true);

    try {
      // Busca registros existentes para calcular médias e personalizar mensagem
      const existingEntries = await getEntries();
      
      let avgMood = 0;
      let avgStress = 0;
      
      if (existingEntries.length > 0) {
        const totalMood = existingEntries.reduce((sum, entry) => sum + entry.mood, 0);
        const totalStress = existingEntries.reduce((sum, entry) => sum + entry.stress, 0);
        avgMood = totalMood / existingEntries.length;
        avgStress = totalStress / existingEntries.length;
      }
      
      // Calcula streak para incluir na mensagem
      const { calculateStreak } = await import('../services/gamification');
      const streakData = await calculateStreak();
      
      // Gera mensagem personalizada e humanizada baseada nas médias, valores atuais e streak
      const motivationalMessage = getPersonalizedMotivationalMessage(
        avgMood,
        avgStress,
        mood,
        stress,
        existingEntries.length,
        streakData.currentStreak
      );
      
      const entry = {
        mood: mood,
        stress: stress,
        comment: comment.trim(),
        date: new Date().toISOString(),
        motivationalMessage,
      };

      const success = await saveEntry(entry);

      if (success) {
        // Feedback visual de sucesso
        Alert.alert(
          '✅ Registro Salvo com Sucesso!',
          motivationalMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpa o formulário
                setMood(3);
                setStress(3);
                setComment('');
                // Navega de volta para a Home
                navigation.navigate('Home');
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o registro. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Novo Registro</Text>
          <Text style={styles.subtitle}>
            Como você está se sentindo hoje?
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Humor (1 = Muito Triste, 5 = Muito Feliz)</Text>
            <View style={styles.optionsContainer}>
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    mood === option.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => setMood(option.value)}
                >
                  <Text style={styles.optionEmoji}>{option.label}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      mood === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>
              Nível de Estresse (1 = Muito Baixo, 5 = Muito Alto)
            </Text>
            <View style={styles.optionsContainer}>
              {stressOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    stress === option.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => setStress(option.value)}
                >
                  <Text style={styles.optionEmoji}>{option.label}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      stress === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Comentário (Opcional)</Text>
            <TextInput
              mode="outlined"
              placeholder="Como foi seu dia? O que você gostaria de registrar?"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {comment.length}/500 caracteres
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="check-circle"
          >
            Salvar Registro
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  optionButtonSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextSelected: {
    color: '#1976d2',
  },
  textInput: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
  cancelButton: {
    borderColor: '#666',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default NewEntryScreen;

