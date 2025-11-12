import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntries } from './storage';

const STREAK_KEY = '@workwell:streak';
const LAST_DATE_KEY = '@workwell:lastDate';
const BADGES_KEY = '@workwell:badges';

/**
 * Calcula o streak (dias consecutivos) do usuário
 * @returns {Promise<Object>} - Objeto com currentStreak, longestStreak e lastDate
 */
export const calculateStreak = async () => {
  try {
    const entries = await getEntries();
    
    if (entries.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastDate: null,
      };
    }

    // Ordena por data (mais recente primeiro)
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Pega a data mais recente
    const lastEntryDate = new Date(sortedEntries[0].date);
    const today = new Date();
    
    // Normaliza as datas (remove horas)
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const lastDate = normalizeDate(lastEntryDate);
    const todayNormalized = normalizeDate(today);
    
    // Calcula diferença em dias
    const diffDays = Math.floor((todayNormalized - lastDate) / (1000 * 60 * 60 * 24));

    // Se o último registro foi hoje ou ontem, continua o streak
    let currentStreak = 0;
    if (diffDays === 0) {
      // Registrou hoje - calcula streak
      currentStreak = 1;
      let checkDate = new Date(lastDate);
      
      for (let i = 1; i < sortedEntries.length; i++) {
        const entryDate = normalizeDate(sortedEntries[i].date);
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedDate = normalizeDate(checkDate);
        
        if (entryDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (diffDays === 1) {
      // Registrou ontem - streak continua
      currentStreak = 1;
      let checkDate = new Date(lastDate);
      
      for (let i = 1; i < sortedEntries.length; i++) {
        const entryDate = normalizeDate(sortedEntries[i].date);
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedDate = normalizeDate(checkDate);
        
        if (entryDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    // Se passou mais de 1 dia, streak quebrou

    // Calcula o maior streak da história
    let longestStreak = currentStreak;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = normalizeDate(sortedEntries[i - 1].date);
      const currDate = normalizeDate(sortedEntries[i].date);
      const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Salva o streak atual
    await AsyncStorage.setItem(STREAK_KEY, currentStreak.toString());
    await AsyncStorage.setItem(LAST_DATE_KEY, lastDate.toISOString());

    return {
      currentStreak,
      longestStreak,
      lastDate: lastDate.toISOString(),
    };
  } catch (error) {
    console.error('Erro ao calcular streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastDate: null,
    };
  }
};

/**
 * Verifica e concede badges baseado em marcos atingidos
 * @param {number} currentStreak - Streak atual
 * @param {number} totalEntries - Total de registros
 * @returns {Promise<Array>} - Array de badges desbloqueadas
 */
export const checkAndAwardBadges = async (currentStreak, totalEntries) => {
  try {
    const existingBadges = await AsyncStorage.getItem(BADGES_KEY);
    const badges = existingBadges ? JSON.parse(existingBadges) : [];

    const newBadges = [];

    // Badges de streak
    if (currentStreak >= 7 && !badges.includes('streak_7')) {
      badges.push('streak_7');
      newBadges.push({
        id: 'streak_7',
        name: 'Semana Perfeita',
        description: '7 dias consecutivos de registros! 🔥',
        icon: '🔥',
      });
    }
    if (currentStreak >= 15 && !badges.includes('streak_15')) {
      badges.push('streak_15');
      newBadges.push({
        id: 'streak_15',
        name: 'Quinzena de Dedicação',
        description: '15 dias consecutivos! 💪',
        icon: '💪',
      });
    }
    if (currentStreak >= 30 && !badges.includes('streak_30')) {
      badges.push('streak_30');
      newBadges.push({
        id: 'streak_30',
        name: 'Mês de Autocuidado',
        description: '30 dias consecutivos! 🌟',
        icon: '🌟',
      });
    }

    // Badges de total de registros
    if (totalEntries >= 10 && !badges.includes('entries_10')) {
      badges.push('entries_10');
      newBadges.push({
        id: 'entries_10',
        name: 'Iniciante',
        description: '10 registros completados! 📝',
        icon: '📝',
      });
    }
    if (totalEntries >= 50 && !badges.includes('entries_50')) {
      badges.push('entries_50');
      newBadges.push({
        id: 'entries_50',
        name: 'Consistente',
        description: '50 registros completados! 📊',
        icon: '📊',
      });
    }
    if (totalEntries >= 100 && !badges.includes('entries_100')) {
      badges.push('entries_100');
      newBadges.push({
        id: 'entries_100',
        name: 'Mestre do Bem-Estar',
        description: '100 registros completados! 🏆',
        icon: '🏆',
      });
    }

    if (newBadges.length > 0) {
      await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    }

    return newBadges;
  } catch (error) {
    console.error('Erro ao verificar badges:', error);
    return [];
  }
};

/**
 * Retorna todas as badges desbloqueadas
 * @returns {Promise<Array>} - Array de IDs de badges
 */
export const getUnlockedBadges = async () => {
  try {
    const badges = await AsyncStorage.getItem(BADGES_KEY);
    return badges ? JSON.parse(badges) : [];
  } catch (error) {
    console.error('Erro ao buscar badges:', error);
    return [];
  }
};

