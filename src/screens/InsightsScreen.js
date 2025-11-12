import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { getEntries } from '../services/storage';
import MoodStressChart from '../components/MoodStressChart';

/**
 * Tela de Insights com estatísticas semanais e dicas de bem-estar
 * Demonstra como a tecnologia pode ajudar no autoconhecimento e bem-estar
 */
const InsightsScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({
    avgMood: 0,
    avgStress: 0,
    totalEntries: 0,
    trend: 'stable',
    moodChange: 0,
    stressChange: 0,
    previousWeekMood: 0,
    previousWeekStress: 0,
  });
  const [wellnessTips, setWellnessTips] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
      calculateWeeklyStats(data);
      generateWellnessTips(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calcula estatísticas da última semana com comparação
  const calculateWeeklyStats = (data) => {
    if (data.length === 0) {
      setWeeklyStats({
        avgMood: 0,
        avgStress: 0,
        totalEntries: 0,
        trend: 'stable',
        moodChange: 0,
        stressChange: 0,
        previousWeekMood: 0,
        previousWeekStress: 0,
      });
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const weeklyEntries = data.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= oneWeekAgo;
    });

    const previousWeekEntries = data.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
    });

    if (weeklyEntries.length === 0) {
      setWeeklyStats({
        avgMood: 0,
        avgStress: 0,
        totalEntries: 0,
        trend: 'stable',
        moodChange: 0,
        stressChange: 0,
        previousWeekMood: 0,
        previousWeekStress: 0,
      });
      return;
    }

    const totalMood = weeklyEntries.reduce((sum, entry) => sum + entry.mood, 0);
    const totalStress = weeklyEntries.reduce((sum, entry) => sum + entry.stress, 0);
    const avgMood = totalMood / weeklyEntries.length;
    const avgStress = totalStress / weeklyEntries.length;

    // Calcula médias da semana anterior
    let previousWeekMood = 0;
    let previousWeekStress = 0;
    if (previousWeekEntries.length > 0) {
      previousWeekMood = previousWeekEntries.reduce((s, e) => s + e.mood, 0) / previousWeekEntries.length;
      previousWeekStress = previousWeekEntries.reduce((s, e) => s + e.stress, 0) / previousWeekEntries.length;
    }

    // Calcula mudanças percentuais
    const moodChange = previousWeekMood > 0 
      ? ((avgMood - previousWeekMood) / previousWeekMood) * 100 
      : 0;
    const stressChange = previousWeekStress > 0 
      ? ((avgStress - previousWeekStress) / previousWeekStress) * 100 
      : 0;

    // Determina tendência
    let trend = 'stable';
    if (weeklyEntries.length >= 2) {
      const recent = weeklyEntries.slice(0, 3);
      const older = weeklyEntries.slice(3, 6);
      
      if (older.length > 0) {
        const recentAvgMood = recent.reduce((s, e) => s + e.mood, 0) / recent.length;
        const olderAvgMood = older.reduce((s, e) => s + e.mood, 0) / older.length;
        
        if (recentAvgMood > olderAvgMood + 0.3) trend = 'improving';
        else if (recentAvgMood < olderAvgMood - 0.3) trend = 'declining';
      }
    }

    setWeeklyStats({
      avgMood: parseFloat(avgMood.toFixed(1)),
      avgStress: parseFloat(avgStress.toFixed(1)),
      totalEntries: weeklyEntries.length,
      trend,
      moodChange: parseFloat(moodChange.toFixed(1)),
      stressChange: parseFloat(stressChange.toFixed(1)),
      previousWeekMood: parseFloat(previousWeekMood.toFixed(1)),
      previousWeekStress: parseFloat(previousWeekStress.toFixed(1)),
    });
  };

  // Gera dicas de bem-estar baseadas nos dados (IA Simulada)
  const generateWellnessTips = (data) => {
    if (data.length === 0) {
      setWellnessTips([
        'Comece registrando seu bem-estar diariamente para receber dicas personalizadas! 📝',
      ]);
      return;
    }

    const recentEntries = data.slice(0, 7);
    const avgMood = recentEntries.reduce((s, e) => s + e.mood, 0) / recentEntries.length;
    const avgStress = recentEntries.reduce((s, e) => s + e.stress, 0) / recentEntries.length;

    const tips = [];

    // Dicas baseadas em estresse
    if (avgStress >= 4) {
      tips.push({
        icon: '🧘',
        title: 'Gerenciamento de Estresse',
        text: 'Seu nível de estresse está alto. Considere técnicas de respiração profunda ou meditação de 5 minutos por dia.',
        priority: 'high',
      });
    } else if (avgStress >= 3) {
      tips.push({
        icon: '🌿',
        title: 'Momento de Relaxamento',
        text: 'Inclua pequenas pausas durante o dia. Caminhadas curtas ou alongamentos podem ajudar.',
        priority: 'medium',
      });
    }

    // Dicas baseadas em humor
    if (avgMood <= 2.5) {
      tips.push({
        icon: '💙',
        title: 'Cuidado com o Bem-Estar',
        text: 'Seu humor está baixo. Considere atividades que te trazem alegria ou converse com alguém de confiança.',
        priority: 'high',
      });
    } else if (avgMood >= 4) {
      tips.push({
        icon: '🌟',
        title: 'Mantenha o Equilíbrio',
        text: 'Você está em um bom momento! Continue mantendo hábitos saudáveis e rotinas que te fazem bem.',
        priority: 'low',
      });
    }

    // Dicas gerais
    if (data.length < 7) {
      tips.push({
        icon: '📊',
        title: 'Continue Registrando',
        text: 'Quanto mais dados você registra, mais precisos serão seus insights e dicas personalizadas.',
        priority: 'medium',
      });
    } else {
      tips.push({
        icon: '📈',
        title: 'Acompanhe sua Evolução',
        text: 'Você já tem uma semana de dados! Use os gráficos para identificar padrões e melhorias.',
        priority: 'low',
      });
    }

    // Dica sobre padrões
    if (data.length >= 14) {
      const weekdays = data.slice(0, 7).filter((e) => {
        const day = new Date(e.date).getDay();
        return day >= 1 && day <= 5;
      });
      const weekends = data.slice(0, 7).filter((e) => {
        const day = new Date(e.date).getDay();
        return day === 0 || day === 6;
      });

      if (weekdays.length > 0 && weekends.length > 0) {
        const weekdayStress = weekdays.reduce((s, e) => s + e.stress, 0) / weekdays.length;
        const weekendStress = weekends.reduce((s, e) => s + e.stress, 0) / weekends.length;

        if (weekdayStress > weekendStress + 0.5) {
          tips.push({
            icon: '💼',
            title: 'Padrão Detectado',
            text: 'Seu estresse é maior durante a semana. Considere técnicas de organização e planejamento para reduzir a carga.',
            priority: 'medium',
          });
        }
      }
    }

    setWellnessTips(tips.slice(0, 4)); // Limita a 4 dicas
  };

  const getTrendEmoji = (trend) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'improving':
        return 'Melhorando';
      case 'declining':
        return 'Atenção';
      default:
        return 'Estável';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Insights de Bem-Estar</Text>
          <Text style={styles.subtitle}>
            Análise personalizada do seu bem-estar no trabalho
          </Text>
        </View>

        {/* Gráfico de Evolução */}
        <MoodStressChart entries={entries} />

        {/* Estatísticas Semanais */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📊 Estatísticas da Semana</Text>
            {weeklyStats.totalEntries === 0 ? (
              <Text style={styles.emptyText}>
                Registre alguns dias para ver suas estatísticas semanais!
              </Text>
            ) : (
              <>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weeklyStats.avgMood}</Text>
                    <Text style={styles.statLabel}>Humor Médio</Text>
                    {weeklyStats.previousWeekMood > 0 && (
                      <Text style={[
                        styles.changeText,
                        { color: weeklyStats.moodChange >= 0 ? '#4caf50' : '#f44336' }
                      ]}>
                        {weeklyStats.moodChange >= 0 ? '↑' : '↓'} {Math.abs(weeklyStats.moodChange)}%
                      </Text>
                    )}
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weeklyStats.avgStress}</Text>
                    <Text style={styles.statLabel}>Estresse Médio</Text>
                    {weeklyStats.previousWeekStress > 0 && (
                      <Text style={[
                        styles.changeText,
                        { color: weeklyStats.stressChange <= 0 ? '#4caf50' : '#f44336' }
                      ]}>
                        {weeklyStats.stressChange <= 0 ? '↓' : '↑'} {Math.abs(weeklyStats.stressChange)}%
                      </Text>
                    )}
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {getTrendEmoji(weeklyStats.trend)} {weeklyStats.totalEntries}
                    </Text>
                    <Text style={styles.statLabel}>
                      {getTrendText(weeklyStats.trend)} • {weeklyStats.totalEntries} dias
                    </Text>
                  </View>
                </View>
                
                {/* Mensagem automática baseada nas métricas */}
                {weeklyStats.previousWeekMood > 0 && (
                  <View style={styles.metricMessage}>
                    {weeklyStats.moodChange > 5 && (
                      <Text style={styles.metricMessageText}>
                        ✨ Seu humor melhorou {Math.abs(weeklyStats.moodChange)}% esta semana — continue assim!
                      </Text>
                    )}
                    {weeklyStats.moodChange < -5 && (
                      <Text style={styles.metricMessageText}>
                        💙 Seu humor diminuiu {Math.abs(weeklyStats.moodChange)}% esta semana. Considere fazer pausas e cuidar de si mesmo.
                      </Text>
                    )}
                    {weeklyStats.stressChange < -5 && (
                      <Text style={styles.metricMessageText}>
                        🌿 Seu estresse diminuiu {Math.abs(weeklyStats.stressChange)}% — ótimo progresso!
                      </Text>
                    )}
                    {weeklyStats.stressChange > 5 && (
                      <Text style={styles.metricMessageText}>
                        ⚠️ Seu estresse aumentou {Math.abs(weeklyStats.stressChange)}% esta semana. Que tal tentar técnicas de relaxamento?
                      </Text>
                    )}
                    {Math.abs(weeklyStats.moodChange) <= 5 && Math.abs(weeklyStats.stressChange) <= 5 && weeklyStats.previousWeekMood > 0 && (
                      <Text style={styles.metricMessageText}>
                        📊 Seu bem-estar está estável esta semana. Continue monitorando e cuidando de si mesmo!
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Dicas de Bem-Estar */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>💡 Dicas Personalizadas</Text>
            <Text style={styles.cardSubtitle}>
              Recomendações baseadas no seu histórico (IA Simulada)
            </Text>
            {wellnessTips.length === 0 ? (
              <Text style={styles.emptyText}>
                Continue registrando para receber dicas personalizadas!
              </Text>
            ) : (
              wellnessTips.map((tip, index) => (
                <View key={index} style={styles.tipContainer}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipText}>{tip.text}</Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Conexão com o Futuro */}
        <Card style={[styles.card, styles.futureCard]}>
          <Card.Content>
            <Text style={styles.futureTitle}>🔗 Conexão com o Futuro</Text>
            <Text style={styles.futureSubtitle}>
              Como o WorkWell se integra ao ecossistema de bem-estar do futuro do trabalho
            </Text>
            
            <View style={styles.futureSection}>
              <Text style={styles.futureSectionTitle}>⌚ Smartwatches e Wearables</Text>
              <Text style={styles.futureText}>
                No futuro, o WorkWell poderá se conectar a dispositivos como Apple Watch, 
                Fitbit e outras pulseiras inteligentes para capturar dados reais de:
              </Text>
              <Text style={styles.futureBullet}>• Qualidade e duração do sono</Text>
              <Text style={styles.futureBullet}>• Frequência cardíaca e variabilidade</Text>
              <Text style={styles.futureBullet}>• Níveis de atividade física</Text>
              <Text style={styles.futureBullet}>• Detecção de estresse através de sinais fisiológicos</Text>
            </View>

            <View style={styles.futureSection}>
              <Text style={styles.futureSectionTitle}>💼 Softwares Corporativos de Saúde Mental</Text>
              <Text style={styles.futureText}>
                Integração com plataformas de RH e bem-estar corporativo:
              </Text>
              <Text style={styles.futureBullet}>• Sincronização com programas de EAP (Employee Assistance Program)</Text>
              <Text style={styles.futureBullet}>• Dashboards anônimos para gestores de RH identificarem tendências gerais</Text>
              <Text style={styles.futureBullet}>• Alertas proativos quando padrões preocupantes são detectados</Text>
              <Text style={styles.futureBullet}>• Sugestões de recursos de bem-estar disponíveis na empresa</Text>
            </View>

            <View style={styles.futureSection}>
              <Text style={styles.futureSectionTitle}>🤝 Plataformas de RH Humanizadas</Text>
              <Text style={styles.futureText}>
                Conexão com sistemas que priorizam o bem-estar do trabalhador:
              </Text>
              <Text style={styles.futureBullet}>• Integração com calendários para sugerir pausas baseadas em padrões</Text>
              <Text style={styles.futureBullet}>• Recomendações de atividades de team building quando necessário</Text>
              <Text style={styles.futureBullet}>• Análise de correlação entre carga de trabalho e bem-estar</Text>
              <Text style={styles.futureBullet}>• Feedback anônimo para melhorias no ambiente de trabalho</Text>
            </View>

            <View style={styles.futureSection}>
              <Text style={styles.futureSectionTitle}>🌐 Visão Futurista</Text>
              <Text style={styles.futureText}>
                O WorkWell representa uma visão de futuro onde tecnologia e humanidade se unem. 
                Ao invés de monitorar trabalhadores, a tecnologia os empodera com dados e insights 
                para que possam tomar decisões informadas sobre seu próprio bem-estar. Isso alinha 
                com os Objetivos de Desenvolvimento Sustentável (ODS) 3 (Saúde e bem-estar) e 8 
                (Trabalho decente e crescimento econômico), promovendo um futuro do trabalho mais 
                saudável, sustentável e humano.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Sobre IA Simulada */}
        <Card style={[styles.card, styles.infoCard]}>
          <Card.Content>
            <Text style={styles.infoTitle}>🤖 Sobre a IA Simulada</Text>
            <Text style={styles.infoText}>
              O WorkWell utiliza análise de dados e padrões para fornecer insights
              personalizados sobre seu bem-estar. As dicas são geradas automaticamente
              baseadas no seu histórico de registros, simulando como uma IA de saúde
              mental poderia ajudar no futuro do trabalho.
            </Text>
          </Card.Content>
        </Card>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
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
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  metricMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  metricMessageText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  futureCard: {
    backgroundColor: '#f3e5f5',
    marginTop: 8,
  },
  futureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#7b1fa2',
  },
  futureSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  futureSection: {
    marginBottom: 20,
  },
  futureSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#7b1fa2',
  },
  futureText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  futureBullet: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 4,
  },
});

export default InsightsScreen;

