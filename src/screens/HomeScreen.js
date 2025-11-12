import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { getEntries } from '../services/storage';
import { calculateStreak, checkAndAwardBadges, getUnlockedBadges } from '../services/gamification';
import { getDailyReflection } from '../utils/dailyReflections';

/**
 * Tela inicial do aplicativo
 * Mostra um resumo geral e permite navegar para criar novo registro ou ver histórico
 */
const HomeScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEntries: 0,
    avgMood: 0,
    avgStress: 0,
  });
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [badges, setBadges] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [dailyReflection, setDailyReflection] = useState(null);

  // Carrega os registros ao montar o componente
  useEffect(() => {
    loadEntries();
    // Carrega a frase do dia
    setDailyReflection(getDailyReflection());
    
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
      calculateStats(data);
      
      // Calcula streak e badges
      const streakData = await calculateStreak();
      setStreak(streakData);
      
      // Verifica e concede badges
      const newBadges = await checkAndAwardBadges(streakData.currentStreak, data.length);
      if (newBadges.length > 0) {
        // Badges novas desbloqueadas - pode mostrar notificação
        console.log('Novas badges:', newBadges);
      }
      
      // Carrega badges desbloqueadas
      const unlockedBadges = await getUnlockedBadges();
      setBadges(unlockedBadges);
      
      // Calcula status de hoje
      if (data.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastEntry = new Date(data[0].date);
        lastEntry.setHours(0, 0, 0, 0);
        
        if (today.getTime() === lastEntry.getTime()) {
          // Registrou hoje
          const avgMood = data.reduce((s, e) => s + e.mood, 0) / data.length;
          const avgStress = data.reduce((s, e) => s + e.stress, 0) / data.length;
          const moodChange = data[0].mood - avgMood;
          const stressChange = data[0].stress - avgStress;
          
          setTodayStatus({
            mood: data[0].mood,
            stress: data[0].stress,
            moodTrend: moodChange > 0.2 ? 'up' : moodChange < -0.2 ? 'down' : 'stable',
            stressTrend: stressChange > 0.2 ? 'up' : stressChange < -0.2 ? 'down' : 'stable',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  // Calcula estatísticas dos registros
  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({
        totalEntries: 0,
        avgMood: 0,
        avgStress: 0,
      });
      return;
    }

    const totalMood = data.reduce((sum, entry) => sum + entry.mood, 0);
    const totalStress = data.reduce((sum, entry) => sum + entry.stress, 0);

    setStats({
      totalEntries: data.length,
      avgMood: (totalMood / data.length).toFixed(1),
      avgStress: (totalStress / data.length).toFixed(1),
    });
  };

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  // Retorna emoji baseado na média de humor
  const getMoodEmoji = (avgMood) => {
    if (avgMood >= 4.5) return '😊';
    if (avgMood >= 3.5) return '🙂';
    if (avgMood >= 2.5) return '😐';
    if (avgMood >= 1.5) return '😔';
    return '😢';
  };

  // Retorna cor baseada na média de estresse
  const getStressColor = (avgStress) => {
    if (avgStress <= 2) return '#4caf50';
    if (avgStress <= 3) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>WorkWell</Text>
          <Text style={styles.subtitle}>Diário de Bem-Estar no Trabalho</Text>
        </View>

        {/* Frase do Dia - Modo Reflexão */}
        {dailyReflection && (
          <Card style={styles.reflectionCard}>
            <Card.Content>
              <View style={styles.reflectionHeader}>
                <Text style={styles.reflectionIcon}>🧘</Text>
                <View style={styles.reflectionHeaderText}>
                  <Text style={styles.reflectionTitle}>Frase do Dia</Text>
                  <Text style={styles.reflectionCategory}>{dailyReflection.category}</Text>
                </View>
              </View>
              <Text style={styles.reflectionText}>"{dailyReflection.text}"</Text>
            </Card.Content>
          </Card>
        )}

        {/* Gamificação - Streak */}
        {streak.currentStreak > 0 && (
          <Card style={[styles.streakCard, { backgroundColor: '#fff3e0' }]}>
            <Card.Content>
              <View style={styles.streakContainer}>
                <Text style={styles.streakIcon}>🔥</Text>
                <View style={styles.streakTextContainer}>
                  <Text style={styles.streakTitle}>
                    Você registrou seu bem-estar por {streak.currentStreak} {streak.currentStreak === 1 ? 'dia' : 'dias'} seguidos!
                  </Text>
                  {streak.longestStreak > streak.currentStreak && (
                    <Text style={styles.streakSubtitle}>
                      Seu recorde: {streak.longestStreak} dias
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Dashboard: Como estou hoje? */}
        {todayStatus && (
          <Card style={styles.todayCard}>
            <Card.Content>
              <Text style={styles.todayTitle}>📊 Como estou hoje?</Text>
              <View style={styles.todayStats}>
                <View style={styles.todayItem}>
                  <Text style={styles.todayLabel}>Humor</Text>
                  <View style={styles.todayValueContainer}>
                    <Text style={styles.todayValue}>
                      {todayStatus.mood}/5 {getMoodEmoji(todayStatus.mood)}
                    </Text>
                    {todayStatus.moodTrend === 'up' && <Text style={styles.trendUp}>↑</Text>}
                    {todayStatus.moodTrend === 'down' && <Text style={styles.trendDown}>↓</Text>}
                    {todayStatus.moodTrend === 'stable' && <Text style={styles.trendStable}>→</Text>}
                  </View>
                </View>
                <View style={styles.todayItem}>
                  <Text style={styles.todayLabel}>Estresse</Text>
                  <View style={styles.todayValueContainer}>
                    <Text style={[styles.todayValue, { color: getStressColor(todayStatus.stress) }]}>
                      {todayStatus.stress}/5
                    </Text>
                    {todayStatus.stressTrend === 'up' && <Text style={styles.trendDown}>↑</Text>}
                    {todayStatus.stressTrend === 'down' && <Text style={styles.trendUp}>↓</Text>}
                    {todayStatus.stressTrend === 'stable' && <Text style={styles.trendStable}>→</Text>}
                  </View>
                </View>
              </View>
              {todayStatus.mood >= 4 && todayStatus.stress <= 2 && (
                <Text style={styles.todaySuggestion}>
                  ✨ Ótimo equilíbrio hoje! Continue mantendo esse bem-estar.
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {entries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyTitle}>Bem-vindo ao WorkWell! 👋</Text>
              <Text style={styles.emptyText}>
                Comece registrando seu primeiro dia de trabalho. Isso ajudará
                você a acompanhar seu bem-estar e identificar padrões ao longo
                do tempo.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text style={styles.statsTitle}>Estatísticas Gerais</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalEntries}</Text>
                    <Text style={styles.statLabel}>Registros</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {getMoodEmoji(parseFloat(stats.avgMood))} {stats.avgMood}
                    </Text>
                    <Text style={styles.statLabel}>Humor Médio</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: getStressColor(parseFloat(stats.avgStress)) },
                      ]}
                    >
                      {stats.avgStress}
                    </Text>
                    <Text style={styles.statLabel}>Estresse Médio</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Badges */}
            {badges.length > 0 && (
              <Card style={styles.badgesCard}>
                <Card.Content>
                  <Text style={styles.badgesTitle}>🏆 Conquistas</Text>
                  <View style={styles.badgesContainer}>
                    {badges.map((badgeId) => {
                      const badgeInfo = {
                        streak_7: { icon: '🔥', name: 'Semana Perfeita' },
                        streak_15: { icon: '💪', name: 'Quinzena' },
                        streak_30: { icon: '🌟', name: 'Mês' },
                        entries_10: { icon: '📝', name: 'Iniciante' },
                        entries_50: { icon: '📊', name: 'Consistente' },
                        entries_100: { icon: '🏆', name: 'Mestre' },
                      }[badgeId] || { icon: '⭐', name: 'Conquista' };
                      
                      return (
                        <View key={badgeId} style={styles.badgeItem}>
                          <Text style={styles.badgeIcon}>{badgeInfo.icon}</Text>
                          <Text style={styles.badgeName}>{badgeInfo.name}</Text>
                        </View>
                      );
                    })}
                  </View>
                </Card.Content>
              </Card>
            )}

            {entries.length > 0 && (
              <Card style={styles.recentCard}>
                <Card.Content>
                  <Text style={styles.recentTitle}>Último Registro</Text>
                  <Text style={styles.recentDate}>
                    {new Date(entries[0].date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  {entries[0].motivationalMessage && (
                    <Text style={styles.recentMessage}>
                      {entries[0].motivationalMessage}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            )}
          </>
        )}

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('NewEntry')}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="plus-circle"
          >
            Novo Registro
          </Button>

          {entries.length > 0 && (
            <>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Insights')}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon="chart-line"
              >
                Ver Insights
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('History')}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon="history"
              >
                Ver Histórico
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </View>
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
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyCard: {
    marginBottom: 24,
    backgroundColor: '#fff',
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
    lineHeight: 20,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  recentCard: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recentMessage: {
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  secondaryButton: {
    borderColor: '#1976d2',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
  streakCard: {
    marginBottom: 16,
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 12,
    color: '#ff6b35',
  },
  todayCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  todayItem: {
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  todayValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  trendUp: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  trendDown: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: 'bold',
  },
  trendStable: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  todaySuggestion: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  badgesCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 80,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  reflectionCard: {
    marginBottom: 16,
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reflectionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  reflectionHeaderText: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 2,
  },
  reflectionCategory: {
    fontSize: 12,
    color: '#9c27b0',
    fontStyle: 'italic',
  },
  reflectionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default HomeScreen;

