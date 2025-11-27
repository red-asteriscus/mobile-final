import "react-native-gesture-handler";
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import HomeScreen from '../src/screens/HomeScreen';
import AddHabitScreen from '../src/screens/AddHabitScreen';
import StatsScreen from '../src/screens/StatsScreen';
import { Habit, RootTabParamList } from '../src/types/HabitTypes';
import { loadHabits } from '../src/data/HabitUtils';

// Required Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator<RootTabParamList>();

const App = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await Notifications.requestPermissionsAsync();
      } catch {}
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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ color, size }) => {
          type IconName = React.ComponentProps<typeof Ionicons>['name'];
          const icons: Record<keyof RootTabParamList, IconName> = {
            Tracker: 'checkmark-circle-outline',
            AddHabit: 'add-circle-outline',
            Stats: 'stats-chart-outline',
          };
          const iconName = icons[route.name as keyof typeof icons];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
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
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
