import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import NewEntryScreen from './src/screens/NewEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import InsightsScreen from './src/screens/InsightsScreen';

// Tema personalizado do React Native Paper
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1976d2',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'WorkWell',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="NewEntry"
              component={NewEntryScreen}
              options={{
                title: 'Novo Registro',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                title: 'Histórico',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="Insights"
              component={InsightsScreen}
              options={{
                title: 'Insights',
                headerShown: true,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

