import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@workwell:entries';

/**
 * Salva um novo registro no AsyncStorage
 * @param {Object} entry - Objeto com mood, stress, comment e date
 * @returns {Promise<boolean>} - true se salvou com sucesso
 */
export const saveEntry = async (entry) => {
  try {
    const existingEntries = await getEntries();
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      date: entry.date || new Date().toISOString(),
    };
    const updatedEntries = [newEntry, ...existingEntries];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error('Erro ao salvar registro:', error);
    return false;
  }
};

/**
 * Recupera todos os registros salvos
 * @returns {Promise<Array>} - Array de registros
 */
export const getEntries = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao recuperar registros:', error);
    return [];
  }
};

/**
 * Remove todos os registros (limpar histórico)
 * @returns {Promise<boolean>} - true se limpou com sucesso
 */
export const clearEntries = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar registros:', error);
    return false;
  }
};

/**
 * Remove um registro específico pelo ID
 * @param {string} id - ID do registro a ser removido
 * @returns {Promise<boolean>} - true se removeu com sucesso
 */
export const deleteEntry = async (id) => {
  try {
    const existingEntries = await getEntries();
    const filteredEntries = existingEntries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    return false;
  }
};

