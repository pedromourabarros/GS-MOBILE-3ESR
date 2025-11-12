import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getEntries, clearEntries, deleteEntry } from '../services/storage';
import EntryCard from '../components/EntryCard';

/**
 * Tela que exibe o histórico de todos os registros
 * Permite visualizar, deletar e limpar todos os registros
 */
const HistoryScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega os registros ao montar o componente
  useEffect(() => {
    loadEntries();
    
    // Listener para recarregar quando voltar para esta tela
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });

    return unsubscribe;
  }, [navigation]);

  // Carrega os registros do AsyncStorage
  const loadEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  // Limpa todos os registros
  const handleClearAll = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja apagar todos os registros? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            const success = await clearEntries();
            if (success) {
              setEntries([]);
              Alert.alert('Sucesso', 'Todos os registros foram apagados.');
            } else {
              Alert.alert('Erro', 'Não foi possível limpar os registros.');
            }
          },
        },
      ]
    );
  };

  // Deleta um registro específico
  const handleDeleteEntry = async (id) => {
    try {
      const success = await deleteEntry(id);
      if (success) {
        await loadEntries();
      } else {
        Alert.alert('Erro', 'Não foi possível deletar o registro.');
      }
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao deletar o registro.');
    }
  };

  // Exporta o histórico para CSV
  const handleExportCSV = async () => {
    try {
      if (entries.length === 0) {
        Alert.alert('Atenção', 'Não há registros para exportar.');
        return;
      }

      // Cabeçalho do CSV
      let csvContent = 'Data,Hora,Humor,Estresse,Comentário,Mensagem Motivacional\n';

      // Adiciona cada registro ao CSV
      entries.forEach((entry) => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Escapa vírgulas e quebras de linha no CSV
        const escapeCSV = (text) => {
          if (!text) return '';
          return `"${text.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        };

        csvContent += `${dateStr},${timeStr},${entry.mood},${entry.stress},${escapeCSV(entry.comment || '')},${escapeCSV(entry.motivationalMessage || '')}\n`;
      });

      // Gera nome do arquivo com data atual
      const today = new Date();
      const fileName = `WorkWell_Historico_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.csv`;
      
      // Cria o arquivo temporário
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      // Verifica se o dispositivo suporta compartilhamento
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Compartilha o arquivo
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar Histórico WorkWell',
        });
        Alert.alert('Sucesso', 'Histórico exportado com sucesso!');
      } else {
        Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      Alert.alert('Erro', 'Não foi possível exportar o histórico. Tente novamente.');
    }
  };

  // Renderiza ação de swipe (delete)
  const renderRightActions = (item) => {
    return (
      <View style={styles.swipeContainer}>
        <Button
          mode="contained"
          onPress={() => {
            Alert.alert(
              'Deletar Registro',
              'Tem certeza que deseja deletar este registro?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Deletar',
                  style: 'destructive',
                  onPress: () => handleDeleteEntry(item.id),
                },
              ]
            );
          }}
          buttonColor="#f44336"
          icon="delete"
          style={styles.deleteButton}
        >
          Deletar
        </Button>
      </View>
    );
  };

  // Renderiza item da lista com swipe
  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <EntryCard entry={item} />
    </Swipeable>
  );

  // Renderiza lista vazia
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
      <Text style={styles.emptyText}>
        Comece registrando seu primeiro dia de trabalho na tela inicial.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('NewEntry')}
        style={styles.emptyButton}
        icon="plus-circle"
      >
        Criar Primeiro Registro
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Registros</Text>
        <Text style={styles.subtitle}>
          {entries.length} {entries.length === 1 ? 'registro' : 'registros'}
        </Text>
      </View>

      {entries.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <FlatList
            data={entries}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              <View style={styles.footer}>
                <Button
                  mode="contained"
                  onPress={handleExportCSV}
                  style={styles.exportButton}
                  icon="download"
                  contentStyle={styles.buttonContent}
                >
                  Exportar Histórico (CSV)
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleClearAll}
                  style={styles.clearButton}
                  textColor="#f44336"
                  icon="delete-sweep"
                  contentStyle={styles.buttonContent}
                >
                  Limpar Todo o Histórico
                </Button>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#1976d2',
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  exportButton: {
    backgroundColor: '#1976d2',
  },
  clearButton: {
    borderColor: '#f44336',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  swipeContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#f44336',
    marginVertical: 8,
    marginRight: 16,
    borderRadius: 8,
    paddingRight: 16,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
  deleteButton: {
    minWidth: 80,
  },
});

export default HistoryScreen;

