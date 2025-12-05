import React, { useState, useEffect, useRef } from 'react';
import { View, StatusBar, ActivityIndicator, StyleSheet, Animated } from 'react-native';
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

SplashScreen.preventAutoHideAsync();

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
        tabBarActiveTintColor: '#A593E0',
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

function LaunchScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => onFinish(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.launchContainer}>
      <StatusBar barStyle="light-content" />
      <Animated.Text style={[styles.launchText, { opacity: fadeAnim }]}>
        Habit Tracker 🚀
      </Animated.Text>
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
    </View>
  );
}

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
    backgroundColor: '#A593E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
});
