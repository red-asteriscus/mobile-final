import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export interface Habit {
  id: string;
  title: string;
  completedDates: string[]; // Stores 'YYYY-MM-DD' strings
  reminderEnabled: boolean;
  notificationId?: string; // ID used by Expo Notifications to cancel the reminder
}

export type RootTabParamList = {
  Tracker: undefined; // Maps to HomeScreen
  AddHabit: undefined; // Maps to AddHabitScreen
  Stats: undefined; // Maps to StatsScreen
};

export type SetHabits = React.Dispatch<React.SetStateAction<Habit[]>>;

export interface HabitContextProps {
  habits: Habit[];
  setHabits: SetHabits;
}

// Props definitions for each screen, combining navigation props and custom state props
export type HomeScreenProps = HabitContextProps & BottomTabScreenProps<RootTabParamList, 'Tracker'>;
export type AddHabitProps = HabitContextProps & BottomTabScreenProps<RootTabParamList, 'AddHabit'>;
export type StatsProps = HabitContextProps & BottomTabScreenProps<RootTabParamList, 'Stats'>;