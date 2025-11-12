import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card, Text } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

/**
 * Componente que exibe gráfico de evolução do humor e estresse
 * @param {Array} entries - Array de registros ordenados por data
 */
const MoodStressChart = ({ entries }) => {

  // Prepara os dados para o gráfico (últimos 7 dias ou todos se tiver menos)
  const prepareChartData = () => {
    if (!entries || entries.length === 0) {
      return null;
    }

    // Pega os últimos 7 registros (ou todos se tiver menos)
    const recentEntries = entries.slice(0, 7).reverse();
    
    const labels = recentEntries.map((entry) => {
      const date = new Date(entry.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const moodData = recentEntries.map((entry) => entry.mood);
    const stressData = recentEntries.map((entry) => entry.stress);

    return {
      labels,
      datasets: [
        {
          data: moodData,
          color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`, // Azul para humor
          strokeWidth: 2,
        },
        {
          data: stressData,
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Vermelho para estresse
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  if (!chartData) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Evolução do Bem-Estar</Text>
          <Text style={styles.emptyText}>
            Registre alguns dias para ver sua evolução!
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f5f5f5',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Evolução do Bem-Estar</Text>
        <Text style={styles.subtitle}>Últimos {chartData.labels.length} dias</Text>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={4}
          />
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#1976d2' }]} />
            <Text style={styles.legendText}>Humor (1-5)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f44336' }]} />
            <Text style={styles.legendText}>Estresse (1-5)</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default MoodStressChart;

