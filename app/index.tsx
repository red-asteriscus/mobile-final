// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from '../src/screens/HomeScreen';
import AddHabitScreen from '../src/screens/AddHabitScreen';
import StatsScreen from '../src/screens/StatsScreen';
import HabitDetailScreen from '../src/screens/HabitDetailScreen';
import { Habit } from '../src/types/HabitTypes';
import { loadHabits } from '../src/data/HabitUtils';

// Prevent auto-hide splash
SplashScreen.preventAutoHideAsync();

// --- Stack & Tab types
export type RootStackParamList = {
  Launch: undefined;
  MainTabs: undefined;
  Detail: { habitId: string };
};

export type RootTabParamList = {
  Tracker: undefined;
  AddHabit: undefined;
  Stats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// --- Tabs Component
function Tabs({ habits, setHabits }: { habits: Habit[]; setHabits: React.Dispatch<React.SetStateAction<Habit[]>> }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Tracker') iconName = 'list';
          else if (route.name === 'AddHabit') iconName = 'add-circle';
          else if (route.name === 'Stats') iconName = 'bar-chart';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1D9BF0',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="Tracker">
        {props => <HomeScreen {...props} habits={habits} setHabits={setHabits} />}
      </Tab.Screen>
      <Tab.Screen name="AddHabit">
        {props => <AddHabitScreen {...props} habits={habits} setHabits={setHabits} />}
      </Tab.Screen>
      <Tab.Screen name="Stats">
        {props => <StatsScreen {...props} habits={habits} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// --- Launch Screen
function LaunchScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.launchContainer}>
      <StatusBar barStyle="light-content" />
      <Ionicons name="rocket-outline" size={80} color="#fff" />
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
    </View>
  );
}

// --- App Component
export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await loadHabits();
      setHabits(loaded);
      setIsLoading(false);
      await SplashScreen.hideAsync();
    })();
  }, []);

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Launch">
        {props => <LaunchScreen {...props} onFinish={() => props.navigation.replace('MainTabs')} />}
      </Stack.Screen>
      <Stack.Screen name="MainTabs">
        {() => <Tabs habits={habits} setHabits={setHabits} />}
      </Stack.Screen>
      <Stack.Screen name="Detail">
        {props => <HabitDetailScreen {...props} habits={habits} setHabits={setHabits} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  launchContainer: {
    flex: 1,
    backgroundColor: '#1D9BF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
