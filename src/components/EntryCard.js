import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

/**
 * Componente que exibe um card com os dados de um registro
 * @param {Object} entry - Objeto com mood, stress, comment, date e motivationalMessage
 * @param {Function} onDelete - Função opcional para deletar o registro
 */
const EntryCard = ({ entry, onDelete }) => {

  // Formata a data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  };

  // Retorna emoji baseado no humor
  const getMoodEmoji = (mood) => {
    const emojis = {
      1: '😢',
      2: '😔',
      3: '😐',
      4: '🙂',
      5: '😊',
    };
    return emojis[mood] || '😐';
  };

  // Retorna emoji baseado no nível de estresse
  const getStressEmoji = (stress) => {
    const emojis = {
      1: '🟢',
      2: '🟡',
      3: '🟠',
      4: '🔴',
      5: '⚫',
    };
    return emojis[stress] || '🟡';
  };

  // Retorna texto descritivo do humor
  const getMoodText = (mood) => {
    const texts = {
      1: 'Muito Triste',
      2: 'Triste',
      3: 'Neutro',
      4: 'Feliz',
      5: 'Muito Feliz',
    };
    return texts[mood] || 'Neutro';
  };

  // Retorna texto descritivo do estresse
  const getStressText = (stress) => {
    const texts = {
      1: 'Muito Baixo',
      2: 'Baixo',
      3: 'Moderado',
      4: 'Alto',
      5: 'Muito Alto',
    };
    return texts[stress] || 'Moderado';
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Humor</Text>
            <View style={styles.metricValue}>
              <Text style={styles.emoji}>{getMoodEmoji(entry.mood)}</Text>
              <Text style={styles.metricText}>
                {entry.mood}/5 - {getMoodText(entry.mood)}
              </Text>
            </View>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Estresse</Text>
            <View style={styles.metricValue}>
              <Text style={styles.emoji}>{getStressEmoji(entry.stress)}</Text>
              <Text style={styles.metricText}>
                {entry.stress}/5 - {getStressText(entry.stress)}
              </Text>
            </View>
          </View>
        </View>

        {entry.comment && entry.comment.trim() !== '' && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Comentário:</Text>
            <Text style={styles.commentText}>{entry.comment}</Text>
          </View>
        )}

        {entry.motivationalMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>💬 Mensagem do dia:</Text>
            <Text style={styles.messageText}>{entry.motivationalMessage}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 20,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
  },
});

export default EntryCard;

