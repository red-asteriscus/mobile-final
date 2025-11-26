import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// screens
import HomeScreen from '../src/screens/HomeScreen';
import AddHabitScreen from '../src/screens/AddHabitScreen';
import StatsScreen from '../src/screens/StatsScreen';

// utils
import { loadHabits } from '../src/data/HabitUtils';

// types
import { Habit, RootTabParamList } from '../src/types/HabitTypes';

// --------------------------------------------------
// REQUIRED Expo notifications handler
// --------------------------------------------------
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,    // iOS banner
    shouldShowList: true,      // Notification appears in list/center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const Tab = createBottomTabNavigator<RootTabParamList>();

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Request notification permissions on app start
        await Notifications.requestPermissionsAsync();
      } catch (err) {
        console.warn('Notification permission issue:', err);
      }

      // Load habits from AsyncStorage
      const stored = await loadHabits();
      setHabits(stored);
      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    // NOTE: The NavigationContainer is explicitly omitted here because Expo Router provides it.
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Tracker: 'checkmark-circle-outline',
            AddHabit: 'add-circle-outline',
            Stats: 'stats-chart-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      {/* Pass habits state and setter to screens that need them */}
      <Tab.Screen name="Tracker">
        {(props) => <HomeScreen {...props} habits={habits} setHabits={setHabits} />}
      </Tab.Screen>

      <Tab.Screen name="AddHabit">
        {(props) => <AddHabitScreen {...props} habits={habits} setHabits={setHabits} />}
      </Tab.Screen>

      <Tab.Screen name="Stats">
        {(props) => <StatsScreen {...props} habits={habits} setHabits={setHabits} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default App;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});